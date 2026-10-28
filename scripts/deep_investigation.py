import os
import pandas as pd
import numpy as np

DATA_DIR = "collections_30k_dataset"

def investigate():
    print("=== 1. PAYMENTS INVESTIGATION ===")
    payments = pd.read_csv(os.path.join(DATA_DIR, "payments.csv"))
    print(f"Total rows in payments.csv: {len(payments):,}")
    print(f"Unique payment_id: {payments['payment_id'].nunique():,}")
    print(f"Unique payment_reference: {payments['payment_reference'].nunique():,}")
    print(f"Unique account_id: {payments['account_id'].nunique():,}")
    print(f"Payment statuses:\n{payments['payment_status'].value_counts(dropna=False)}")
    print(f"Payment methods:\n{payments['payment_method'].value_counts(dropna=False)}")
    
    # Check timestamps
    print(f"\nSample timestamps in payments:")
    print(payments['event_at'].head(10))
    
    # Try parsing timestamps
    # Note: timestamps might have mixed offsets or tz
    payments['dt'] = pd.to_datetime(payments['event_at'], utc=True, errors='coerce')
    print(f"Null datetime after UTC conversion: {payments['dt'].isna().sum()}")
    print(f"Date range (UTC): {payments['dt'].min()} to {payments['dt'].max()}")
    
    payments['year_month'] = payments['dt'].dt.to_period('M')
    print("\nPayments by Month (Raw - all statuses):")
    monthly_raw = payments.groupby('year_month').agg(
        tx_count=('payment_id', 'count'),
        unique_ref=('payment_reference', 'nunique'),
        unique_accounts=('account_id', 'nunique'),
        total_amount=('amount', 'sum'),
        mean_amount=('amount', 'mean'),
        median_amount=('amount', 'median')
    )
    print(monthly_raw)
    
    print("\nPayments by Month and Status (Amount):")
    monthly_status_amt = payments.groupby(['year_month', 'payment_status'])['amount'].sum().unstack(fill_value=0)
    print(monthly_status_amt)
    
    print("\nPayments by Month and Status (Count):")
    monthly_status_cnt = payments.groupby(['year_month', 'payment_status'])['payment_id'].count().unstack(fill_value=0)
    print(monthly_status_cnt)
    
    # Check duplicate payment references
    dup_refs = payments[payments.duplicated(subset=['payment_reference'], keep=False)]
    print(f"\nTotal rows with duplicated payment_reference: {len(dup_refs):,}")
    if len(dup_refs) > 0:
        print("Sample duplicated payment references:")
        print(dup_refs.sort_values('payment_reference').head(10)[['payment_id', 'account_id', 'event_at', 'payment_reference', 'amount', 'payment_status']])
        
    print("\n=== 2. ACCOUNTS INVESTIGATION ===")
    accounts = pd.read_csv(os.path.join(DATA_DIR, "accounts.csv"))
    print(f"Total rows in accounts.csv: {len(accounts):,}")
    print(f"Unique account_id: {accounts['account_id'].nunique():,}")
    print(f"Risk segments:\n{accounts['risk_segment'].value_counts(dropna=False)}")
    print(f"Loan types:\n{accounts['loan_type'].value_counts(dropna=False)}")
    print(f"DPD summary:\n{accounts['dpd'].describe()}")
    print(f"Outstanding amount summary:\n{accounts['outstanding_amount'].describe()}")
    print(f"Principal amount summary:\n{accounts['principal_amount'].describe()}")
    print(f"Timezones:\n{accounts['timezone'].value_counts(dropna=False)}")
    print(f"Schema versions:\n{accounts['schema_version'].value_counts(dropna=False)}")
    print(f"Status:\n{accounts['status'].value_counts(dropna=False)}")

if __name__ == "__main__":
    investigate()
