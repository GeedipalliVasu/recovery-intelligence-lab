"""
Recovery Intelligence Lab - Evidence Trace Engine
Provides full mathematical, algorithmic, and SQL lineage for every core KPI.
"""

from typing import Dict, Any, List, Optional
from backend.database import get_db_connection

TRACES = {
    "claim_11_pct": {
        "metric_id": "MTR-CLAIM-01",
        "metric_name": "Management 11% Month-on-Month Growth Claim",
        "formula": "Growth = (Sum(Amount_Mar_Raw_Success) - Sum(Amount_Feb_Raw_Success)) / Sum(Amount_Feb_Raw_Success)",
        "observation_window": "2026-02-01 00:00:00 UTC to 2026-03-31 23:59:59 UTC",
        "numerator": {
            "label": "March 2026 Raw SUCCESS Amount",
            "value": 193233384.0,
            "unit": "USD ($)"
        },
        "denominator": {
            "label": "February 2026 Raw SUCCESS Amount",
            "value": 174097288.0,
            "unit": "USD ($)"
        },
        "computed_result": "+10.9916% (~11.0%)",
        "audit_counts": {
            "total_raw_rows_examined": 6888,
            "feb_records_included": 2315,
            "mar_records_included": 2576,
            "records_excluded": 1997,
            "exclusion_reason": "Filtered for payment_status = 'SUCCESS' (drops FAILED, PENDING, REVERSED)."
        },
        "data_quality_rules_applied": [
            "None. Management performed a naive SELECT SUM(amount) WHERE payment_status = 'SUCCESS' on raw CSVs.",
            "Included 486 duplicate rows that were subsequently ingested.",
            "Did not normalize for February's 28 days vs March's 31 days."
        ],
        "sql_query": """-- Reconstructs Management's Claim
SELECT 
    DATE_TRUNC('month', event_at::TIMESTAMP) as month,
    COUNT(*) as tx_count,
    SUM(amount) as raw_success_amount
FROM payments
WHERE payment_status = 'SUCCESS' 
  AND event_at >= '2026-02-01' AND event_at < '2026-04-01'
GROUP BY 1
ORDER BY 1;""",
        "assumptions_and_caveats": [
            "Assumes 28 days in February is directly comparable to 31 days in March (+10.71% days difference ignored).",
            "Assumes webhook duplicate retries are separate legitimate cash recoveries.",
            "Assumes timestamp string in payments represents uniform UTC timezone without offset adjustment."
        ]
    },
    "daily_run_rate": {
        "metric_id": "MTR-RUNRATE-01",
        "metric_name": "Calendar-Normalized Daily Recovery Run-Rate",
        "formula": "Daily_Rate = Sum(Clean_Settled_Amount) / Days_In_Calendar_Month",
        "observation_window": "2026-02-01 to 2026-03-31 (Normalized by 28 days and 31 days respectively)",
        "numerator": {
            "label": "Clean Settled Payments in Month",
            "value": "Feb: $170,142,454.00 | Mar: $188,912,374.00",
            "unit": "USD ($)"
        },
        "denominator": {
            "label": "Operational Days in Calendar Month",
            "value": "Feb: 28 days | Mar: 31 days",
            "unit": "Days"
        },
        "computed_result": "Feb: $6,076,516/day -> Mar: $6,093,948/day (+0.287% change)",
        "audit_counts": {
            "total_raw_rows_examined": 6888,
            "feb_settled_deduped": 2267,
            "mar_settled_deduped": 2519,
            "duplicates_removed": 105,
            "non_settled_filtered": 1997
        },
        "data_quality_rules_applied": [
            "Exact row deduplication (dropped 486 file-level duplicates).",
            "Primary key deduplication: prioritized SUCCESS status and earliest event_at.",
            "Converted event_at to UTC timestamp standard.",
            "Calendar length divisor: 28 for Feb 2026, 31 for Mar 2026."
        ],
        "sql_query": """-- Calendar-Normalized Daily Run-Rate
WITH clean_payments AS (
    SELECT 
        year_month,
        amount
    FROM golden_payments
    WHERE is_settled = TRUE AND year_month IN ('2026-02', '2026-03')
)
SELECT 
    year_month,
    SUM(amount) as monthly_total,
    CASE WHEN year_month = '2026-02' THEN 28 ELSE 31 END as days,
    SUM(amount) / (CASE WHEN year_month = '2026-02' THEN 28 ELSE 31 END) as daily_run_rate
FROM clean_payments
GROUP BY 1, 3
ORDER BY 1;""",
        "assumptions_and_caveats": [
            "Collections operations operate continuously across all 7 days of the week (standard digital & dialer operations).",
            "Excludes unsettled payments ($575.8M overall portfolio lifetime) until confirmed by gateway settlement."
        ]
    },
    "portfolio_recovery_rate": {
        "metric_id": "MTR-RECOVRATE-01",
        "metric_name": "Portfolio Balance Recovery Rate",
        "formula": "Recovery_Rate = Sum(Clean_Settled_Amount) / Sum(Total_Portfolio_Outstanding_Balance)",
        "observation_window": "Active portfolio book ($10,489,035,343 outstanding)",
        "numerator": {
            "label": "Monthly Settled Recovery",
            "value": "Feb: $170,142,454.00 | Mar: $188,912,374.00",
            "unit": "USD ($)"
        },
        "denominator": {
            "label": "Total Portfolio Outstanding Balance",
            "value": 10489035343.0,
            "unit": "USD ($)"
        },
        "computed_result": "Feb: 1.622% -> Mar: 1.801% (+0.179 percentage points)",
        "audit_counts": {
            "total_accounts_denom": 30000,
            "accounts_with_recovery_feb": 2173,
            "accounts_with_recovery_mar": 2419
        },
        "data_quality_rules_applied": [
            "Accounts table outstanding_amount validated (all > 0).",
            "455 accounts with missing borrower_id retained in denominator to avoid artificially inflating recovery rate."
        ],
        "sql_query": """-- Portfolio Recovery Rate
SELECT 
    p.year_month,
    SUM(p.amount) as settled_recovery,
    (SELECT SUM(outstanding_amount) FROM golden_accounts) as total_balance,
    (SUM(p.amount) / (SELECT SUM(outstanding_amount) FROM golden_accounts)) * 100 as recovery_rate_pct
FROM golden_payments p
WHERE p.is_settled = TRUE AND p.year_month IN ('2026-02', '2026-03')
GROUP BY 1
ORDER BY 1;""",
        "assumptions_and_caveats": [
            "Uses static point-in-time outstanding balance across observation months as baseline.",
            "The 0.179 pp increase is mathematically equivalent to 11.0% relative increase, which decomposes into 10.71% extra calendar days and 0.29% daily gain."
        ]
    }
}

def get_evidence_trace(metric_key: str = "claim_11_pct") -> Dict[str, Any]:
    if metric_key in TRACES:
        return TRACES[metric_key]
    # Return default or list of available traces
    return {
        "available_traces": list(TRACES.keys()),
        "selected_trace": TRACES["claim_11_pct"]
    }
