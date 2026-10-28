-- 02_daily_run_rate_normalization.sql
-- Normalizes monthly recovery by calendar day count to eliminate February-March distortion

WITH monthly_totals AS (
    SELECT 
        year_month,
        SUM(amount) as clean_recovery_amount,
        COUNT(DISTINCT account_id) as paying_accounts,
        CASE 
            WHEN year_month = '2026-02' THEN 28
            WHEN year_month = '2026-03' THEN 31
            WHEN year_month IN ('2026-04', '2026-06') THEN 30
            ELSE 31
        END as days_in_month
    FROM golden_payments
    WHERE is_settled = TRUE
    GROUP BY year_month
)
SELECT 
    year_month,
    days_in_month,
    clean_recovery_amount,
    clean_recovery_amount / days_in_month as daily_run_rate,
    paying_accounts,
    paying_accounts::FLOAT / days_in_month as daily_paying_accounts
FROM monthly_totals
ORDER BY year_month;
