import os
import pandas as pd
import numpy as np

DATA_DIR = "collections_30k_dataset"

def forensic_dq():
    print("=== FORENSIC DATA QUALITY AUDIT ===")
    
    # 1. Accounts
    accounts = pd.read_csv(os.path.join(DATA_DIR, "accounts.csv"))
    print("\n--- ACCOUNTS ---")
    print(f"Total rows: {len(accounts)}")
    print("Missing values in accounts:\n", accounts.isna().sum())
    print("Schema versions in accounts:\n", accounts['schema_version'].value_counts(dropna=False))
    print("Invalid/negative amounts:", (accounts['outstanding_amount'] < 0).sum(), (accounts['principal_amount'] < 0).sum())
    print("Outstanding > Principal:", (accounts['outstanding_amount'] > accounts['principal_amount']).sum())
    
    # 2. Borrowers
    borrowers = pd.read_csv(os.path.join(DATA_DIR, "borrowers.csv"))
    print("\n--- BORROWERS ---")
    print(f"Total rows: {len(borrowers)}, Unique borrower_id: {borrowers['borrower_id'].nunique()}")
    print("Duplicate borrower_id:", borrowers.duplicated(subset=['borrower_id']).sum())
    print("Missing values in borrowers:\n", borrowers.isna().sum())
    
    # Check borrower_id in accounts vs borrowers
    orphan_accounts = ~accounts['borrower_id'].isin(borrowers['borrower_id'])
    print(f"Accounts with borrower_id not in borrowers.csv: {orphan_accounts.sum()}")
    
    # 3. Payments
    payments = pd.read_csv(os.path.join(DATA_DIR, "payments.csv"))
    print("\n--- PAYMENTS ---")
    print(f"Total rows: {len(payments)}")
    print("Missing values in payments:\n", payments.isna().sum())
    orphan_payments_acc = ~payments['account_id'].isin(accounts['account_id'])
    orphan_payments_bor = ~payments['borrower_id'].isin(borrowers['borrower_id'])
    print(f"Payments with orphan account_id: {orphan_payments_acc.sum()}")
    print(f"Payments with orphan borrower_id: {orphan_payments_bor.sum()}")
    
    # Check payment reference duplicates with different statuses or amounts
    pref_groups = payments.groupby('payment_reference').agg(
        row_cnt=('payment_id', 'count'),
        status_nunique=('payment_status', 'nunique'),
        amount_nunique=('amount', 'nunique'),
        account_nunique=('account_id', 'nunique')
    )
    print("Payment references appearing > 1 time:", (pref_groups['row_cnt'] > 1).sum())
    print("Payment references with multiple distinct statuses:", (pref_groups['status_nunique'] > 1).sum())
    print("Payment references with multiple distinct amounts:", (pref_groups['amount_nunique'] > 1).sum())
    print("Payment references across multiple distinct accounts:", (pref_groups['account_nunique'] > 1).sum())
    
    # 4. Call Dispositions & Legacy Codes
    dispos = pd.read_csv(os.path.join(DATA_DIR, "call_dispositions.csv"))
    print("\n--- CALL DISPOSITIONS ---")
    print("Disposition versions:\n", dispos['disposition_version'].value_counts(dropna=False))
    print("Disposition codes:\n", dispos['disposition_code'].value_counts(dropna=False))
    orphan_dispo_calls = ~dispos['call_id'].isin(pd.read_csv(os.path.join(DATA_DIR, "calls.csv"), usecols=['call_id'])['call_id'])
    print(f"Dispositions with call_id not in calls.csv: {orphan_dispo_calls.sum()}")
    
    # 5. Agents
    agents = pd.read_csv(os.path.join(DATA_DIR, "agents.csv"))
    print("\n--- AGENTS ---")
    print(f"Total rows: {len(agents)}, Unique agent_id: {agents['agent_id'].nunique()}, Unique employee_code: {agents['employee_code'].nunique()}")
    print("Duplicate employee_codes:", agents.duplicated(subset=['employee_code']).sum())
    print("Teams:\n", agents['team'].value_counts(dropna=False))
    
    # 6. Timezones & Conflicting Timestamps in Account Status History
    ash = pd.read_csv(os.path.join(DATA_DIR, "account_status_history.csv"))
    print("\n--- ACCOUNT STATUS HISTORY ---")
    ash['dt_event'] = pd.to_datetime(ash['event_at'], utc=True)
    ash['dt_recorded'] = pd.to_datetime(ash['recorded_at'], utc=True)
    late_arriving = ash['dt_recorded'] < ash['dt_event']
    print(f"Rows where recorded_at < event_at (inverted/conflicting timestamps): {late_arriving.sum()}")
    lag_days = (ash['dt_recorded'] - ash['dt_event']).dt.total_seconds() / 86400
    print("Lag (recorded_at - event_at in days) summary:\n", lag_days.describe())

if __name__ == "__main__":
    forensic_dq()
