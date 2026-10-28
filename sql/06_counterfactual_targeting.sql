-- 06_counterfactual_targeting.sql
-- Evaluates performance across campaign strategy versions (legacy, v1, v2, v3)
-- to determine whether the mid-year targeting change yielded incremental recovery

WITH targeting_cohorts AS (
    SELECT 
        dt.account_id,
        c.strategy_version,
        c.channel as campaign_channel,
        MIN(dt.target_date) as first_targeted_at
    FROM daily_targeting dt
    JOIN campaigns c ON dt.campaign_id = c.campaign_id
    GROUP BY dt.account_id, c.strategy_version, c.channel
),
settled_outcomes AS (
    SELECT 
        p.account_id,
        SUM(p.amount) as settled_cash,
        COUNT(*) as payments_count
    FROM golden_payments p
    WHERE p.is_settled = TRUE
    GROUP BY p.account_id
)
SELECT 
    tc.strategy_version,
    COUNT(DISTINCT tc.account_id) as accounts_targeted,
    COUNT(DISTINCT so.account_id) as paying_accounts,
    COUNT(DISTINCT so.account_id)::FLOAT / COUNT(DISTINCT tc.account_id) * 100 as debtor_conversion_rate_pct,
    COALESCE(SUM(so.settled_cash), 0) as total_recovered_cash,
    COALESCE(SUM(so.settled_cash), 0) / COUNT(DISTINCT tc.account_id) as cash_per_targeted_account
FROM targeting_cohorts tc
LEFT JOIN settled_outcomes so ON tc.account_id = so.account_id
GROUP BY tc.strategy_version
ORDER BY tc.strategy_version;

