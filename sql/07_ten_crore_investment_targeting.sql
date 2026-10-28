-- 07_ten_crore_investment_targeting.sql
-- Stratifies the portfolio to identify the optimal target cohort for the ₹10 Cr ML Targeting Investment
-- Focuses on Early to Mid Delinquency (DPD 15 to 60) with outstanding balance > ₹100,000

WITH candidate_universe AS (
    SELECT 
        a.account_id,
        a.loan_type,
        a.risk_segment,
        a.dpd,
        a.outstanding_amount,
        CASE 
            WHEN a.dpd BETWEEN 15 AND 60 AND a.outstanding_amount >= 100000 THEN 'TIER_1_ML_PRIORITY'
            WHEN a.dpd BETWEEN 1 AND 14 THEN 'TIER_2_SELF_CURE_DIGITAL'
            WHEN a.dpd > 90 THEN 'TIER_3_LEGAL_FIELD_HARDENED'
            ELSE 'TIER_4_STANDARD_DIALER'
        END as recommended_allocation_tier
    FROM golden_accounts a
)
SELECT 
    recommended_allocation_tier,
    COUNT(*) as account_count,
    COUNT(*)::FLOAT / (SELECT COUNT(*) FROM golden_accounts) * 100 as pct_of_portfolio_accounts,
    SUM(outstanding_amount) as total_debt_pool,
    SUM(outstanding_amount)::FLOAT / (SELECT SUM(outstanding_amount) FROM golden_accounts) * 100 as pct_of_portfolio_debt,
    AVG(outstanding_amount) as avg_balance_per_account,
    AVG(dpd) as avg_dpd
FROM candidate_universe
GROUP BY recommended_allocation_tier
ORDER BY total_debt_pool DESC;

