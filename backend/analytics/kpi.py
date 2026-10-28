"""
Recovery Intelligence Lab - Executive KPI & Verdict Engine
"""

from typing import Dict, Any, List
from backend.database import get_db_connection

def get_executive_summary() -> Dict[str, Any]:
    con = get_db_connection()
    
    # Fetch monthly timeline
    monthly_df = con.execute("""
        SELECT 
            year_month,
            days_in_period,
            is_partial_month,
            raw_all_amount,
            raw_success_amount,
            clean_success_amount,
            clean_tx_count,
            clean_paying_accounts,
            daily_run_rate_raw,
            daily_run_rate_clean,
            recovery_rate_portfolio_pct,
            trimmed_99_amount
        FROM golden_monthly_metrics
        ORDER BY year_month
    """).df()
    
    # Portfolio total
    portfolio_total = con.execute("SELECT SUM(outstanding_amount) as total FROM golden_accounts").fetchone()[0]
    total_accounts = con.execute("SELECT COUNT(*) as cnt FROM golden_accounts").fetchone()[0]
    
    # Feb vs Mar specific stats
    feb = monthly_df[monthly_df['year_month'] == '2026-02'].iloc[0]
    mar = monthly_df[monthly_df['year_month'] == '2026-03'].iloc[0]
    
    raw_mom_pct = ((mar['raw_success_amount'] - feb['raw_success_amount']) / feb['raw_success_amount']) * 100
    clean_mom_pct = ((mar['clean_success_amount'] - feb['clean_success_amount']) / feb['clean_success_amount']) * 100
    daily_mom_pct = ((mar['daily_run_rate_clean'] - feb['daily_run_rate_clean']) / feb['daily_run_rate_clean']) * 100
    accounts_mom_pct = ((mar['clean_paying_accounts'] - feb['clean_paying_accounts']) / feb['clean_paying_accounts']) * 100
    
    # DQ ledger summary
    dq_summary = con.execute("""
        SELECT 
            COUNT(*) as issue_count,
            SUM(monetary_impact) as total_monetary_impact,
            SUM(CASE WHEN changes_headline THEN 1 ELSE 0 END) as headline_affecting_count
        FROM dq_impact_ledger
    """).df().iloc[0]
    
    con.close()
    
    return {
        "verdict": {
            "status": "UNSUPPORTED_CALENDAR_ARTIFACT",
            "headline_title": "The Claimed 11% Recovery Gain is an Artifact of Calendar Month Length",
            "confidence_level": "High (p = 0.932)",
            "summary": (
                "Management's claim of an 11.0% MoM recovery improvement from February to March 2026 is mathematically "
                "real in raw dollar totals ($174.10M to $193.23M, +10.99%), but operationally misleading. "
                "March had 31 calendar days compared to February's 28 days (+10.71% more operational days). "
                "When normalized for daily collection rate, the true performance change was only +0.25% (raw) "
                "or +0.29% (deduplicated), which is statistically indistinguishable from zero (Welch's t-test p = 0.932). "
                "Furthermore, injected duplicate payments and non-settled transactions inflated raw figures by over $37M."
            )
        },
        "kpis": {
            "management_raw_growth_pct": round(raw_mom_pct, 2),
            "clean_growth_pct": round(clean_mom_pct, 2),
            "calendar_normalized_growth_pct": round(daily_mom_pct, 2),
            "paying_accounts_growth_pct": round(accounts_mom_pct, 2),
            "feb_2026": {
                "days": int(feb['days_in_period']),
                "raw_success_amt": float(feb['raw_success_amount']),
                "clean_success_amt": float(feb['clean_success_amount']),
                "daily_run_rate": float(feb['daily_run_rate_clean']),
                "paying_accounts": int(feb['clean_paying_accounts']),
                "recovery_rate_pct": round(float(feb['recovery_rate_portfolio_pct']), 3)
            },
            "mar_2026": {
                "days": int(mar['days_in_period']),
                "raw_success_amt": float(mar['raw_success_amount']),
                "clean_success_amt": float(mar['clean_success_amount']),
                "daily_run_rate": float(mar['daily_run_rate_clean']),
                "paying_accounts": int(mar['clean_paying_accounts']),
                "recovery_rate_pct": round(float(mar['recovery_rate_portfolio_pct']), 3)
            },
            "statistical_audit": {
                "test_name": "Welch's Two-Sample t-test on Daily Collections",
                "t_statistic": 0.0853,
                "p_value": 0.9324,
                "statistically_significant": False,
                "bootstrap_95_ci_daily_diff": [-369912.63, 431257.70],
                "mann_whitney_p_value": 0.8869,
                "ks_distribution_p_value": 0.7392
            },
            "portfolio": {
                "total_outstanding_balance": float(portfolio_total),
                "total_accounts": int(total_accounts),
                "avg_balance_per_account": float(portfolio_total / total_accounts)
            },
            "data_quality_ledger": {
                "total_issues_identified": int(dq_summary['issue_count']),
                "total_monetary_impact": float(dq_summary['total_monetary_impact']),
                "headline_altering_issues": int(dq_summary['headline_affecting_count'])
            }
        },
        "key_findings": [
            {
                "id": "KF-01",
                "title": "Calendar Day Inflation (+10.71%)",
                "finding": "February has 28 days while March has 31 days. A 3-day difference alone creates a +10.71% baseline increase in monthly aggregate cashflow with zero change in operational productivity."
            },
            {
                "id": "KF-02",
                "title": "True Daily Run-Rate (+0.29%)",
                "finding": "Clean daily collections moved from $6.077M/day to $6.094M/day (+0.29%). Welch's t-test yields p = 0.932 and bootstrap 95% CI spans [-$370k, +$431k], confirming zero statistically credible improvement."
            },
            {
                "id": "KF-03",
                "title": "Data Quality Distortions ($37.3M Duplicates)",
                "finding": "Raw data contains 486 exact duplicate payment rows ($37.3M) and 7,620 non-settled payments ($575.8M) that if unscrubbed create massive false variance."
            },
            {
                "id": "KF-04",
                "title": "Zero Mix Shift or Simpson's Paradox",
                "finding": "Standardizing portfolio risk weights (Kitagawa decomposition) reveals mix shift contributed less than 0.03 percentage points. The recovery rate was uniformly flat across high, medium, and NPA segments."
            },
            {
                "id": "KF-05",
                "title": "Attribution Confounding",
                "finding": "Daily targeting prioritized lower-risk and lower-DPD accounts, causing observed recovery in targeted groups to appear higher purely through selection bias rather than collection causality."
            }
        ],
        "timeline": monthly_df.to_dict(orient="records")
    }
