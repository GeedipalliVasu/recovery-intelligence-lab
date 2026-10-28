"""
Recovery Intelligence Lab - Collection Strategy Sandbox & Causal Experiment Design
"""

from typing import Dict, Any, List
from backend.database import get_db_connection

def simulate_strategy(
    priority_rule: str = "HIGH_BALANCE_EARLY_DPD",
    contact_capacity: int = 10000,
    min_dpd: int = 1,
    max_dpd: int = 90
) -> Dict[str, Any]:
    con = get_db_connection()
    
    total_accounts = 30000
    total_balance = 10489035343.0
    
    order_clause = "outstanding_amount DESC"
    if priority_rule == "HIGH_BALANCE_EARLY_DPD":
        order_clause = "CASE WHEN dpd BETWEEN 1 AND 30 THEN 1 WHEN dpd BETWEEN 31 AND 60 THEN 2 ELSE 3 END, outstanding_amount DESC"
    elif priority_rule == "HIGH_RISK_FIRST":
        order_clause = "CASE WHEN risk_segment = 'HIGH' THEN 1 WHEN risk_segment = 'NPA' THEN 2 ELSE 3 END, outstanding_amount DESC"
    elif priority_rule == "LOW_RISK_QUICK_WINS":
        order_clause = "CASE WHEN risk_segment = 'LOW' THEN 1 WHEN risk_segment = 'MEDIUM' THEN 2 ELSE 3 END, outstanding_amount DESC"
    elif priority_rule == "PURE_BALANCE_DESC":
        order_clause = "outstanding_amount DESC"
        
    query = f"""
        WITH target_universe AS (
            SELECT 
                account_id,
                outstanding_amount,
                dpd,
                risk_segment,
                ROW_NUMBER() OVER (ORDER BY {order_clause}) as rank_id
            FROM golden_accounts
            WHERE dpd >= {min_dpd} AND dpd <= {max_dpd}
        ),
        allocated_cohort AS (
            SELECT *,
                CASE WHEN rank_id <= {contact_capacity} THEN 'TARGETED' ELSE 'UNASSIGNED' END as allocation_group
            FROM target_universe
        ),
        cohort_payments AS (
            SELECT 
                account_id,
                COUNT(*) as tx_count,
                SUM(amount) as total_recovered
            FROM golden_payments
            WHERE is_settled = TRUE AND year_month = '2026-03'
            GROUP BY account_id
        ),
        cohort_outcomes AS (
            SELECT 
                a.allocation_group,
                COUNT(DISTINCT a.account_id) as account_count,
                SUM(a.outstanding_amount) as allocated_balance,
                COUNT(DISTINCT cp.account_id) as paying_accounts,
                COALESCE(SUM(cp.total_recovered), 0) as total_recovered
            FROM allocated_cohort a
            LEFT JOIN cohort_payments cp ON a.account_id = cp.account_id
            GROUP BY a.allocation_group
        )
        SELECT * FROM cohort_outcomes;
    """
    
    sim_df = con.execute(query).df()
    con.close()
    
    targeted = sim_df[sim_df['allocation_group'] == 'TARGETED'].iloc[0] if len(sim_df[sim_df['allocation_group'] == 'TARGETED']) > 0 else None
    
    accounts_reached = int(targeted['account_count']) if targeted is not None else 0
    balance_targeted = float(targeted['allocated_balance']) if targeted is not None else 0.0
    paying_targeted = int(targeted['paying_accounts']) if targeted is not None else 0
    recovered_targeted = float(targeted['total_recovered']) if targeted is not None else 0.0
    
    recovery_rate = (recovered_targeted / balance_targeted * 100) if balance_targeted > 0 else 0.0
    payer_penetration = (paying_targeted / accounts_reached * 100) if accounts_reached > 0 else 0.0
    
    return {
        "strategy_config": {
            "priority_rule": priority_rule,
            "contact_capacity": contact_capacity,
            "min_dpd": min_dpd,
            "max_dpd": max_dpd
        },
        "workload_and_coverage": {
            "accounts_targeted": accounts_reached,
            "portfolio_account_coverage_pct": round((accounts_reached / total_accounts) * 100, 2),
            "outstanding_balance_targeted": balance_targeted,
            "portfolio_balance_coverage_pct": round((balance_targeted / total_balance) * 100, 2)
        },
        "historical_observed_outcomes": {
            "historical_settled_recovery": recovered_targeted,
            "historical_recovery_rate_pct": round(recovery_rate, 3),
            "historical_paying_accounts": paying_targeted,
            "debtor_penetration_rate_pct": round(payer_penetration, 2)
        },
        "causal_disclaimer": {
            "warning": "CAUSATION != CORRELATION WARNING",
            "message": (
                "These historical numbers describe what debtors in this segment paid in March 2026. "
                "THEY DO NOT PROVE THAT CONTACTING THEM CAUSED THE RECOVERY. "
                "Many accounts self-cure without contact. Using historically targeted accounts as an unbiased "
                "estimate of future intervention impact introduces severe selection bias."
            )
        },
        "randomized_experiment_protocol": {
            "experiment_name": "Collections Strategy Randomised Controlled Trial (RCT)",
            "design_type": "Orthogonal 2-Arm Randomized Evaluation",
            "sample_eligibility": f"Delinquent accounts (DPD {min_dpd} to {max_dpd}) meeting contact capability rules.",
            "allocation": {
                "treatment_arm": "80% of accounts allocated to new active outreach protocol (dialer + WhatsApp follow-up).",
                "control_arm": "20% Holdout (standard organic billing reminder only, no aggressive dialer outreach)."
            },
            "primary_outcome": "30-day cumulative cash collected per $1,000 outstanding balance (Continuous metric).",
            "secondary_outcomes": ["Promise-to-pay keep rate", "Debtor dispute / complaint escalation rate", "Cost-to-collect"],
            "statistical_power": "n = 10,000 accounts achieves 80% power at alpha = 0.05 to detect a 0.25 percentage-point incremental lift (MDE).",
            "guardrails_and_stopping_rules": [
                "Stop trial immediately if complaint escalation in treatment arm exceeds 2.5x control.",
                "Minimum observation window: 30 full calendar days (do not evaluate on partial weeks)."
            ]
        }
    }
