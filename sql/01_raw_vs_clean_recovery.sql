-- 01_raw_vs_clean_recovery.sql
-- Compares management's raw calculation of recovery against deduplicated settled recovery

SELECT 
    p.year_month,
    COUNT(*) as raw_tx_count,
    SUM(p.amount) as raw_total_amount,
    SUM(CASE WHEN p.payment_status = 'SUCCESS' THEN p.amount ELSE 0 END) as raw_success_amount,
    COUNT(DISTINCT p.payment_id) as dedup_pid_count,
    SUM(CASE WHEN p.is_settled THEN p.amount ELSE 0 END) as clean_success_amount,
    COUNT(DISTINCT CASE WHEN p.is_settled THEN p.account_id END) as paying_accounts
FROM golden_payments p
WHERE p.year_month IN ('2026-02', '2026-03')
GROUP BY p.year_month
ORDER BY p.year_month;
