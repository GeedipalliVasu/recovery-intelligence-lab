import os
import pandas as pd
import numpy as np

DATA_DIR = "collections_30k_dataset"

def investigate_all_mom():
    payments = pd.read_csv(os.path.join(DATA_DIR, "payments.csv"))
    accounts = pd.read_csv(os.path.join(DATA_DIR, "accounts.csv"))
    
    # Check exact duplicates
    exact_dups = payments.duplicated()
    print(f"Exact duplicate rows in payments: {exact_dups.sum()}")
    
    # Check payment_id duplicates
    pid_dups = payments.duplicated(subset=['payment_id'], keep=False)
    print(f"Duplicate payment_id rows: {pid_dups.sum()} (unique IDs: {payments.loc[pid_dups, 'payment_id'].nunique()})")
    
    # Check payment_reference duplicates
    pref_dups = payments.duplicated(subset=['payment_reference'], keep=False)
    print(f"Duplicate payment_reference rows: {pref_dups.sum()} (unique refs: {payments.loc[pref_dups, 'payment_reference'].nunique()})")
    
    # Convert event_at with timezone handling
    # Let's inspect raw event_at strings to see if timezone info is in the string or if accounts.csv has timezone
    print("\nSample event_at in payments:", payments['event_at'].head(5).tolist())
    print("Does event_at contain timezone offset?", payments['event_at'].str.contains(r'[+-]\d\d').any())
    print("Does event_at contain 'Z'?", payments['event_at'].str.contains('Z').any())
    
    # Join with accounts to see account timezone vs vendor timezone
    merged = payments.merge(accounts[['account_id', 'timezone', 'outstanding_amount', 'dpd', 'risk_segment', 'loan_type', 'status']], on='account_id', how='left')
    print(f"Merged payments with accounts: {len(merged)} rows. Null accounts: {merged['outstanding_amount'].isna().sum()}")
    
    # Let's inspect MoM changes for all consecutive months across different metrics:
    # 1. Total Raw Amount
    # 2. SUCCESS Amount (Raw)
    # 3. SUCCESS Amount (Deduplicated by payment_id)
    # 4. SUCCESS Amount (Deduplicated by payment_reference)
    # 5. Daily Run-Rate (Amount / Days in Month)
    # 6. Distinct Paying Accounts
    # 7. Recovery Rate = SUCCESS Amount / Outstanding Amount of Active/All Accounts
    
    # Let's create year_month using UTC parse
    payments['dt_utc'] = pd.to_datetime(payments['event_at'], utc=True)
    payments['ym'] = payments['dt_utc'].dt.to_period('M').astype(str)
    
    months = sorted([m for m in payments['ym'].unique() if m != '2026-08']) # August is partial (up to Aug 8)
    print(f"\nFull months available: {months}")
    
    for status_filter in [None, 'SUCCESS']:
        df = payments if status_filter is None else payments[payments['payment_status'] == status_filter]
        
        # A. Raw sum
        m_sum = df.groupby('ym')['amount'].sum()
        # B. Dedup by payment_id
        m_dedup_pid = df.drop_duplicates(subset=['payment_id']).groupby('ym')['amount'].sum()
        # C. Dedup by payment_reference
        m_dedup_pref = df.drop_duplicates(subset=['payment_reference']).groupby('ym')['amount'].sum()
        # D. Distinct accounts
        m_accts = df.groupby('ym')['account_id'].nunique()
        # E. Daily average
        days_per_month = {'2026-01': 31, '2026-02': 28, '2026-03': 31, '2026-04': 30, '2026-05': 31, '2026-06': 30, '2026-07': 31}
        m_daily = m_sum / pd.Series(days_per_month)
        
        print(f"\n=================== METRIC ANALYSIS: status={status_filter} ===================")
        for i in range(len(months)-1):
            m1, m2 = months[i], months[i+1]
            pct_sum = (m_sum[m2] - m_sum[m1]) / m_sum[m1] * 100
            pct_dedup_pid = (m_dedup_pid[m2] - m_dedup_pid[m1]) / m_dedup_pid[m1] * 100
            pct_dedup_pref = (m_dedup_pref[m2] - m_dedup_pref[m1]) / m_dedup_pref[m1] * 100
            pct_accts = (m_accts[m2] - m_accts[m1]) / m_accts[m1] * 100
            pct_daily = (m_daily[m2] - m_daily[m1]) / m_daily[m1] * 100
            
            print(f"{m1} -> {m2}:")
            print(f"   Raw Amount:         {m_sum[m1]:,.0f} -> {m_sum[m2]:,.0f} | Change: {pct_sum:+.2f}%")
            print(f"   Dedup payment_id:   {m_dedup_pid[m1]:,.0f} -> {m_dedup_pid[m2]:,.0f} | Change: {pct_dedup_pid:+.2f}%")
            print(f"   Dedup payment_ref:  {m_dedup_pref[m1]:,.0f} -> {m_dedup_pref[m2]:,.0f} | Change: {pct_dedup_pref:+.2f}%")
            print(f"   Distinct Accounts:  {m_accts[m1]:,} -> {m_accts[m2]:,} | Change: {pct_accts:+.2f}%")
            print(f"   Daily Run Rate:     {m_daily[m1]:,.0f} -> {m_daily[m2]:,.0f} | Change: {pct_daily:+.2f}%")

if __name__ == "__main__":
    investigate_all_mom()
