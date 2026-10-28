"""
Recovery Intelligence Lab - Operational Metrics, Channel Economics & ₹10 Cr Investment Evaluation
"""

import os
import duckdb
import pandas as pd
import numpy as np

DATA_DIR = "collections_30k_dataset"
DB_PATH = os.path.join("data", "recovery_intelligence.duckdb")

def run_operational_deep_dive():
    con = duckdb.connect(DB_PATH)
    
    print("=== 1. CALLS & TELEPHONY FORENSICS ===")
    calls = pd.read_csv(os.path.join(DATA_DIR, "calls.csv"))
    attempts = pd.read_csv(os.path.join(DATA_DIR, "call_attempts.csv"))
    dispos = pd.read_csv(os.path.join(DATA_DIR, "call_dispositions.csv"))
    
    print(f"Total calls: {len(calls):,}, Total attempts: {len(attempts):,}, Total dispositions: {len(dispos):,}")
    
    # Check attempt frequency
    print("\nAttempt number distribution in call_attempts:")
    print(attempts['attempt_no'].value_counts().sort_index())
    
    # Success/connected rate by attempt_no
    attempt_status = attempts.groupby(['attempt_no', 'attempt_status']).size().unstack(fill_value=0)
    print("\nAttempt status by attempt_no:\n", attempt_status)
    
    # Right Party Contact (RPC) and Contact Rate
    print("\nCall status in calls.csv:")
    print(calls['call_status'].value_counts(normalize=True) * 100)
    
    # Dispositions
    print("\nDispositions:")
    print(dispos['disposition_code'].value_counts())
    
    # Hour of day analysis
    calls['dt'] = pd.to_datetime(calls['event_at'], utc=True)
    calls['hour'] = calls['dt'].dt.hour
    hourly_calls = calls.groupby('hour')['call_status'].value_counts().unstack(fill_value=0)
    hourly_calls['connect_rate'] = (hourly_calls.get('ANSWERED', 0) / hourly_calls.sum(axis=1)) * 100
    print("\nHourly Connect Rates (UTC):\n", hourly_calls[['connect_rate']])
    
    print("\n=== 2. DIGITAL CHANNELS (WHATSAPP & SMS) ===")
    wa = pd.read_csv(os.path.join(DATA_DIR, "whatsapp_events.csv"))
    sms = pd.read_csv(os.path.join(DATA_DIR, "sms_events.csv"))
    print("WhatsApp event types:\n", wa['event_type'].value_counts())
    print("SMS event types:\n", sms['event_type'].value_counts())
    
    print("\n=== 3. FIELD VISITS ===")
    fv = pd.read_csv(os.path.join(DATA_DIR, "field_visits.csv"))
    print("Field Visit outcomes:\n", fv['outcome'].value_counts())
    
    print("\n=== 4. PROMISES TO PAY (PTP) & KEPT RATE ===")
    ptp = pd.read_csv(os.path.join(DATA_DIR, "promises_to_pay.csv"))
    print("PTP status:\n", ptp['status'].value_counts(normalize=True) * 100)
    print("PTP by source:\n", ptp.groupby('source')['status'].value_counts().unstack(fill_value=0))
    
    print("\n=== 5. CHANNEL ATTRIBUTION TO SETTLED PAYMENTS ===")
    payments = pd.read_csv(os.path.join(DATA_DIR, "payments.csv"))
    payments_success = payments[payments['payment_status'] == 'SUCCESS'].copy()
    payments_success['dt_pay'] = pd.to_datetime(payments_success['event_at'], utc=True)
    
    paying_accts = set(payments_success['account_id'])
    print(f"Total distinct paying accounts (SUCCESS): {len(paying_accts):,}")
    
    accts_with_calls = set(calls[calls['account_id'].isin(paying_accts)]['account_id'])
    accts_with_wa = set(wa[wa['account_id'].isin(paying_accts)]['account_id'])
    accts_with_sms = set(sms[sms['account_id'].isin(paying_accts)]['account_id'])
    accts_with_fv = set(fv[fv['account_id'].isin(paying_accts)]['account_id'])
    accts_with_ptp = set(ptp[ptp['account_id'].isin(paying_accts)]['account_id'])
    
    print(f"Paying accounts with calls: {len(accts_with_calls):,} ({len(accts_with_calls)/len(paying_accts)*100:.1f}%)")
    print(f"Paying accounts with WhatsApp: {len(accts_with_wa):,} ({len(accts_with_wa)/len(paying_accts)*100:.1f}%)")
    print(f"Paying accounts with SMS: {len(accts_with_sms):,} ({len(accts_with_sms)/len(paying_accts)*100:.1f}%)")
    print(f"Paying accounts with Field Visits: {len(accts_with_fv):,} ({len(accts_with_fv)/len(paying_accts)*100:.1f}%)")
    print(f"Paying accounts with PTP: {len(accts_with_ptp):,} ({len(accts_with_ptp)/len(paying_accts)*100:.1f}%)")
    
    all_accounts = set(pd.read_csv(os.path.join(DATA_DIR, "accounts.csv"))['account_id'])
    non_paying_accts = all_accounts - paying_accts
    print(f"\nNon-paying accounts: {len(non_paying_accts):,}")
    print(f"Non-paying accounts with calls: {len(set(calls[calls['account_id'].isin(non_paying_accts)]['account_id'])):,} ({len(set(calls[calls['account_id'].isin(non_paying_accts)]['account_id']))/len(non_paying_accts)*100:.1f}%)")
    print(f"Non-paying accounts with WhatsApp: {len(set(wa[wa['account_id'].isin(non_paying_accts)]['account_id'])):,} ({len(set(wa[wa['account_id'].isin(non_paying_accts)]['account_id']))/len(non_paying_accts)*100:.1f}%)")
    
    print("\n=== 6. CAMPAIGN STRATEGY SHIFT (COUNTERFACTUAL AUDIT) ===")
    dt = pd.read_csv(os.path.join(DATA_DIR, "daily_targeting.csv"))
    camp = pd.read_csv(os.path.join(DATA_DIR, "campaigns.csv"))
    dt_merged = dt.merge(camp[['campaign_id', 'strategy_version', 'target_definition']], on='campaign_id', how='left')
    dt_merged['dt'] = pd.to_datetime(dt_merged['target_date'], utc=True)
    dt_merged['ym'] = dt_merged['dt'].dt.to_period('M').astype(str)
    print("Strategy version by month in daily_targeting:")
    print(dt_merged.groupby(['ym', 'strategy_version']).size().unstack(fill_value=0))
    
    con.close()

if __name__ == "__main__":
    run_operational_deep_dive()

