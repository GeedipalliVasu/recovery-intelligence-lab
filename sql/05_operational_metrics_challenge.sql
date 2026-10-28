-- 05_operational_metrics_challenge.sql
-- Challenges naive operational collections metrics with authoritative debtor-level definitions

WITH call_metrics AS (
    SELECT 
        c.account_id,
        COUNT(*) as total_calls,
        SUM(CASE WHEN c.call_status = 'ANSWERED' THEN 1 ELSE 0 END) as answered_calls,
        SUM(c.duration_sec) as total_talk_time_sec
    FROM calls c
    GROUP BY c.account_id
),
ptp_metrics AS (
    SELECT 
        p.account_id,
        COUNT(*) as total_ptps,
        SUM(CASE WHEN p.status = 'KEPT' THEN 1 ELSE 0 END) as kept_ptps,
        SUM(p.promised_amount) as total_promised_amount
    FROM promises_to_pay p
    GROUP BY p.account_id
),
settled_payments AS (
    SELECT 
        p.account_id,
        COUNT(*) as settled_tx_count,
        SUM(p.amount) as total_settled_amount
    FROM golden_payments p
    WHERE p.is_settled = TRUE AND p.year_month = '2026-03'
    GROUP BY p.account_id
)
SELECT 
    a.risk_segment,
    COUNT(DISTINCT a.account_id) as total_portfolio_accounts,
    
    -- 1. Contact Penetration: Unique accounts reached (not call count)
    COUNT(DISTINCT CASE WHEN cm.answered_calls > 0 THEN a.account_id END) as unique_reached_accounts,
    COUNT(DISTINCT CASE WHEN cm.answered_calls > 0 THEN a.account_id END)::FLOAT / COUNT(DISTINCT a.account_id) * 100 as debtor_contact_penetration_pct,
    
    -- 2. PTP Conversion: PTP accounts as share of reached accounts
    COUNT(DISTINCT CASE WHEN pm.total_ptps > 0 THEN a.account_id END) as accounts_with_ptp,
    COUNT(DISTINCT CASE WHEN pm.total_ptps > 0 THEN a.account_id END)::FLOAT / NULLIF(COUNT(DISTINCT CASE WHEN cm.answered_calls > 0 THEN a.account_id END), 0) * 100 as reached_to_ptp_conversion_pct,
    
    -- 3. PTP Kept Authenticity
    SUM(COALESCE(pm.kept_ptps, 0)) as total_kept_ptp_records,
    SUM(COALESCE(pm.kept_ptps, 0))::FLOAT / NULLIF(SUM(COALESCE(pm.total_ptps, 0)), 0) * 100 as nominal_ptp_keep_rate_pct,
    
    -- 4. True Cash Recovery per Account Assigned
    COALESCE(SUM(sp.total_settled_amount), 0) / COUNT(DISTINCT a.account_id) as recovery_per_assigned_account
FROM golden_accounts a
LEFT JOIN call_metrics cm ON a.account_id = cm.account_id
LEFT JOIN ptp_metrics pm ON a.account_id = pm.account_id
LEFT JOIN settled_payments sp ON a.account_id = sp.account_id
GROUP BY a.risk_segment
ORDER BY a.risk_segment;

