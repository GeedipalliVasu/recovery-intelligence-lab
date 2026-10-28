"""
Recovery Intelligence Lab - Statistical Testing & Driver Analysis
"""

import os
import duckdb
import pandas as pd
import numpy as np
from scipy import stats

DB_PATH = os.path.join("data", "recovery_intelligence.duckdb")

def run_statistical_analysis():
    con = duckdb.connect(DB_PATH)
    
    # 1. Fetch daily totals for Feb and March 2026
    df_daily = con.execute("""
        SELECT 
            year_month,
            date_utc,
            COUNT(*) as tx_count,
            SUM(amount) as daily_amount,
            AVG(amount) as avg_amount
        FROM golden_payments
        WHERE is_settled = TRUE AND year_month IN ('2026-02', '2026-03')
        GROUP BY year_month, date_utc
        ORDER BY date_utc
    """).df()
    
    feb_daily = df_daily[df_daily['year_month'] == '2026-02']['daily_amount'].values
    mar_daily = df_daily[df_daily['year_month'] == '2026-03']['daily_amount'].values
    
    print(f"Feb daily mean: ${np.mean(feb_daily):,.2f} (std: ${np.std(feb_daily):,.2f}, n={len(feb_daily)})")
    print(f"Mar daily mean: ${np.mean(mar_daily):,.2f} (std: ${np.std(mar_daily):,.2f}, n={len(mar_daily)})")
    
    # Welch's t-test on daily run-rate
    t_stat, p_val = stats.ttest_ind(mar_daily, feb_daily, equal_var=False)
    print(f"Daily Run-Rate Welch's t-test: t={t_stat:.4f}, p-value={p_val:.4f}")
    
    # 2. Individual transaction distribution
    df_tx = con.execute("""
        SELECT year_month, amount
        FROM golden_payments
        WHERE is_settled = TRUE AND year_month IN ('2026-02', '2026-03')
    """).df()
    
    feb_tx = df_tx[df_tx['year_month'] == '2026-02']['amount'].values
    mar_tx = df_tx[df_tx['year_month'] == '2026-03']['amount'].values
    
    # Mann-Whitney U test on transaction size
    u_stat, u_pval = stats.mannwhitneyu(mar_tx, feb_tx, alternative='two-sided')
    # Kolmogorov-Smirnov test
    ks_stat, ks_pval = stats.ks_2samp(mar_tx, feb_tx)
    print(f"Transaction Size Mann-Whitney U: U={u_stat:.2f}, p-value={u_pval:.4f}")
    print(f"Transaction Size KS-test: KS={ks_stat:.4f}, p-value={ks_pval:.4f}")
    
    # 3. Bootstrap 95% Confidence Interval for difference in daily means
    np.random.seed(42)
    boot_diffs = []
    n_boot = 5000
    for _ in range(n_boot):
        b_feb = np.random.choice(feb_daily, size=len(feb_daily), replace=True).mean()
        b_mar = np.random.choice(mar_daily, size=len(mar_daily), replace=True).mean()
        boot_diffs.append(b_mar - b_feb)
        
    ci_lower = np.percentile(boot_diffs, 2.5)
    ci_upper = np.percentile(boot_diffs, 97.5)
    print(f"Bootstrap 95% CI for Daily Run-Rate Diff (Mar - Feb): [${ci_lower:,.2f}, ${ci_upper:,.2f}]")
    print(f"Does CI contain 0? {ci_lower <= 0 <= ci_upper}")
    
    # 4. Performance drivers by Risk Segment and Loan Type
    print("\n--- PERFORMANCE BY RISK SEGMENT ---")
    risk_df = con.execute("""
        SELECT 
            risk_segment,
            year_month,
            COUNT(*) as tx_count,
            SUM(amount) as total_amt,
            COUNT(DISTINCT account_id) as paying_accounts
        FROM golden_payments
        WHERE is_settled = TRUE AND year_month IN ('2026-02', '2026-03')
        GROUP BY risk_segment, year_month
        ORDER BY risk_segment, year_month
    """).df()
    print(risk_df)
    
    print("\n--- PERFORMANCE BY LOAN TYPE ---")
    loan_df = con.execute("""
        SELECT 
            loan_type,
            year_month,
            COUNT(*) as tx_count,
            SUM(amount) as total_amt
        FROM golden_payments
        WHERE is_settled = TRUE AND year_month IN ('2026-02', '2026-03')
        GROUP BY loan_type, year_month
        ORDER BY loan_type, year_month
    """).df()
    print(loan_df)
    
    print("\n--- PERFORMANCE BY DPD BUCKET ---")
    dpd_df = con.execute("""
        SELECT 
            dpd_bucket,
            year_month,
            COUNT(*) as tx_count,
            SUM(amount) as total_amt
        FROM golden_payments
        WHERE is_settled = TRUE AND year_month IN ('2026-02', '2026-03')
        GROUP BY dpd_bucket, year_month
        ORDER BY dpd_bucket, year_month
    """).df()
    print(dpd_df)
    
    con.close()

if __name__ == "__main__":
    run_statistical_analysis()
