-- 04_data_quality_reconciliation.sql
-- Quantifies the financial impact of excluded duplicate rows and non-settled payments

SELECT 
    'Exact Duplicates' as anomaly_type,
    COUNT(*) as affected_records,
    SUM(amount) as total_impact_amount
FROM payments
GROUP BY 1

UNION ALL

SELECT 
    'Failed / Reversed / Pending' as anomaly_type,
    COUNT(*) as affected_records,
    SUM(amount) as total_impact_amount
FROM payments
WHERE payment_status != 'SUCCESS'
GROUP BY 1;
