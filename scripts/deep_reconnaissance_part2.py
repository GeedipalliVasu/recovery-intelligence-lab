import os
import pandas as pd
import numpy as np

DATA_DIR = "collections_30k_dataset"

def inspect_more():
    print("=== CAMPAIGNS & TARGETING ===")
    camp = pd.read_csv(os.path.join(DATA_DIR, "campaigns.csv"))
    print("Campaigns head:")
    print(camp.head(10))
    print(f"Total campaigns: {len(camp)}")
    print("Campaign strategies:", camp['strategy_version'].value_counts())
    print("Campaign channels:", camp['channel'].value_counts())
    
    dt = pd.read_csv(os.path.join(DATA_DIR, "daily_targeting.csv"))
    print(f"\nDaily targeting rows: {len(dt):,}")
    print("Targeting dates min/max:", dt['target_date'].min(), "to", dt['target_date'].max())
    dt['dt'] = pd.to_datetime(dt['target_date'], utc=True)
    dt['ym'] = dt['dt'].dt.to_period('M').astype(str)
    print("Targeting count by month:\n", dt['ym'].value_counts().sort_index())
    print("Targeting recommended channels:\n", dt['recommended_channel'].value_counts())
    print("Targeting statuses:\n", dt['status'].value_counts())
    
    print("\n=== CALLS & ATTEMPTS ===")
    calls = pd.read_csv(os.path.join(DATA_DIR, "calls.csv"))
    print(f"Calls rows: {len(calls):,}")
    calls['dt'] = pd.to_datetime(calls['event_at'], utc=True)
    calls['ym'] = calls['dt'].dt.to_period('M').astype(str)
    print("Calls by month:\n", calls['ym'].value_counts().sort_index())
    print("Call statuses:\n", calls['call_status'].value_counts())
    print("Call directions:\n", calls['direction'].value_counts())
    
    print("\n=== PROMISES TO PAY (PTP) ===")
    ptp = pd.read_csv(os.path.join(DATA_DIR, "promises_to_pay.csv"))
    print(f"PTP rows: {len(ptp):,}")
    ptp['dt'] = pd.to_datetime(ptp['event_at'], utc=True)
    ptp['ym'] = ptp['dt'].dt.to_period('M').astype(str)
    print("PTP by month:\n", ptp['ym'].value_counts().sort_index())
    print("PTP status:\n", ptp['status'].value_counts())
    print("PTP source:\n", ptp['source'].value_counts())
    
    print("\n=== COMPLAINTS ===")
    comp = pd.read_csv(os.path.join(DATA_DIR, "complaints.csv"))
    print(f"Complaints rows: {len(comp):,}")
    comp['dt'] = pd.to_datetime(comp['event_at'], utc=True)
    comp['ym'] = comp['dt'].dt.to_period('M').astype(str)
    print("Complaints by month:\n", comp['ym'].value_counts().sort_index())
    print("Complaints severity:\n", comp['severity'].value_counts())
    print("Complaints type:\n", comp['complaint_type'].value_counts())
    
    print("\n=== FIELD VISITS ===")
    fv = pd.read_csv(os.path.join(DATA_DIR, "field_visits.csv"))
    print(f"Field visits rows: {len(fv):,}")
    fv['dt'] = pd.to_datetime(fv['event_at'], utc=True)
    fv['ym'] = fv['dt'].dt.to_period('M').astype(str)
    print("Field visits by month:\n", fv['ym'].value_counts().sort_index())
    print("Field visits outcomes:\n", fv['outcome'].value_counts())
    
    print("\n=== ACCOUNT STATUS HISTORY ===")
    ash = pd.read_csv(os.path.join(DATA_DIR, "account_status_history.csv"))
    print(f"History rows: {len(ash):,}")
    ash['dt'] = pd.to_datetime(ash['event_at'], utc=True)
    ash['ym'] = ash['dt'].dt.to_period('M').astype(str)
    print("Status changes by month:\n", ash['ym'].value_counts().sort_index())
    print("History status values:\n", ash['status'].value_counts())
    
if __name__ == "__main__":
    inspect_more()
