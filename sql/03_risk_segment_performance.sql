-- 03_risk_segment_performance.sql
-- Explores recovery amounts and account rates across risk segments and DPD delinquency buckets

SELECT 
    p.year_month,
    p.risk_segment,
    p.dpd_bucket,
    COUNT(DISTINCT p.account_id) as paying_accounts,
    COUNT(*) as settled_tx_count,
    SUM(p.amount) as total_collected,
    AVG(p.amount) as avg_settlement_size
FROM golden_payments p
WHERE p.is_settled = TRUE AND p.year_month IN ('2026-02', '2026-03')
GROUP BY p.year_month, p.risk_segment, p.dpd_bucket
ORDER BY p.risk_segment, p.dpd_bucket, p.year_month;
