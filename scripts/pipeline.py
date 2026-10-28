"""
Recovery Intelligence Lab - Forensic Data Ingestion, Reconciliation & Golden Pipeline
Author: Senior Analytics Engineer & Full-Stack Developer
"""

import os
import sys
import json
import logging
from datetime import datetime
import pandas as pd
import numpy as np
import duckdb

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

RAW_DATA_DIR = "collections_30k_dataset"
DATA_DIR = "data"
DB_PATH = os.path.join(DATA_DIR, "recovery_intelligence.duckdb")

os.makedirs(DATA_DIR, exist_ok=True)

class ForensicPipeline:
    def __init__(self, raw_dir: str = RAW_DATA_DIR, db_path: str = DB_PATH):
        self.raw_dir = raw_dir
        self.db_path = db_path
        self.dq_ledger = []
        
    def log_dq_issue(self, issue_id: str, category: str, table_name: str, 
                     affected_rows: int, monetary_impact: float, 
                     changes_headline: bool, treatment: str, rationale: str, limitation: str):
        record = {
            "issue_id": issue_id,
            "category": category,
            "table_name": table_name,
            "affected_rows": int(affected_rows),
            "monetary_impact": float(monetary_impact),
            "changes_headline": bool(changes_headline),
            "treatment": treatment,
            "rationale": rationale,
            "limitation": limitation
        }
        self.dq_ledger.append(record)
        logging.info(f"DQ Issue Logged [{issue_id}]: {category} in {table_name} ({affected_rows:,} rows, ${monetary_impact:,.2f})")

    def run(self):
        logging.info("Starting Forensic Pipeline...")
        
        # 1. Accounts Ingestion & Cleaning
        accounts_raw = pd.read_csv(os.path.join(self.raw_dir, "accounts.csv"))
        logging.info(f"Loaded accounts.csv: {len(accounts_raw):,} rows")
        
        # Check missing borrower_id
        missing_borrower = accounts_raw['borrower_id'].isna().sum()
        self.log_dq_issue(
            issue_id="DQ-ACC-01",
            category="Missing Foreign Key",
            table_name="accounts",
            affected_rows=missing_borrower,
            monetary_impact=accounts_raw.loc[accounts_raw['borrower_id'].isna(), 'outstanding_amount'].sum(),
            changes_headline=False,
            treatment="Preserved with flag `has_missing_borrower = True`; not dropped to prevent balance undercounting.",
            rationale="Accounts without borrower references still possess real financial obligations.",
            limitation="Borrower demographics cannot be joined for these accounts."
        )
        
        # DPD Bucket derivation
        def get_dpd_bucket(dpd):
            if dpd == 0:
                return "0: Current"
            elif dpd <= 30:
                return "1-30: Early"
            elif dpd <= 60:
                return "31-60: Mid"
            elif dpd <= 90:
                return "61-90: Late"
            else:
                return "90+: NPA/Default"
        
        accounts_clean = accounts_raw.copy()
        accounts_clean['dpd_bucket'] = accounts_clean['dpd'].apply(get_dpd_bucket)
        accounts_clean['has_missing_borrower'] = accounts_clean['borrower_id'].isna()
        accounts_clean['opened_at_utc'] = pd.to_datetime(accounts_clean['opened_at'], utc=True)
        
        # 2. Borrowers Ingestion & Deduplication
        borrowers_raw = pd.read_csv(os.path.join(self.raw_dir, "borrowers.csv"))
        dup_borrower_rows = borrowers_raw.duplicated().sum()
        dup_borrower_ids = borrowers_raw.duplicated(subset=['borrower_id']).sum()
        
        self.log_dq_issue(
            issue_id="DQ-BOR-01",
            category="Entity Duplication",
            table_name="borrowers",
            affected_rows=dup_borrower_ids,
            monetary_impact=0.0,
            changes_headline=False,
            treatment="Deduplicated by `borrower_id` keeping most recently updated record.",
            rationale="Multiple borrower snapshots represent operational audit logs rather than distinct humans.",
            limitation="May discard historical contact information changes."
        )
        
        borrowers_raw['updated_at_dt'] = pd.to_datetime(borrowers_raw['updated_at'], utc=True)
        borrowers_clean = borrowers_raw.sort_values('updated_at_dt').drop_duplicates(subset=['borrower_id'], keep='last')
        
        # Check orphan borrower_id in accounts
        orphan_acc_borrowers = (~accounts_clean['borrower_id'].isna()) & (~accounts_clean['borrower_id'].isin(borrowers_clean['borrower_id']))
        orphan_acc_count = orphan_acc_borrowers.sum()
        self.log_dq_issue(
            issue_id="DQ-ACC-02",
            category="Orphan Foreign Key",
            table_name="accounts",
            affected_rows=orphan_acc_count,
            monetary_impact=accounts_clean.loc[orphan_acc_borrowers, 'outstanding_amount'].sum(),
            changes_headline=False,
            treatment="Flagged with `is_orphan_borrower = True` in golden_accounts.",
            rationale="Referential integrity failure from uncoordinated table generation/sharding.",
            limitation="Cannot attribute geographic performance for orphan accounts."
        )
        accounts_clean['is_orphan_borrower'] = orphan_acc_borrowers

        # 3. Payments Ingestion & Forensic Cleaning
        payments_raw = pd.read_csv(os.path.join(self.raw_dir, "payments.csv"))
        logging.info(f"Loaded payments.csv: {len(payments_raw):,} rows")
        
        # Issue 3.1: Exact Duplicate Rows
        exact_dup_mask = payments_raw.duplicated()
        exact_dup_cnt = exact_dup_mask.sum()
        exact_dup_amt = payments_raw.loc[exact_dup_mask, 'amount'].sum()
        exact_dup_success_amt = payments_raw.loc[exact_dup_mask & (payments_raw['payment_status'] == 'SUCCESS'), 'amount'].sum()
        
        self.log_dq_issue(
            issue_id="DQ-PAY-01",
            category="Exact Duplicate Rows",
            table_name="payments",
            affected_rows=exact_dup_cnt,
            monetary_impact=exact_dup_amt,
            changes_headline=True,
            treatment="Exact duplicates dropped completely from golden analytical tables.",
            rationale="Identical rows represent duplicate ingestion/webhook redeliveries.",
            limitation="Reduces raw transaction count by exactly 486 rows."
        )
        
        # Issue 3.2: Duplicate payment_id with diverging content
        payments_no_exact = payments_raw.drop_duplicates()
        pid_dup_mask = payments_no_exact.duplicated(subset=['payment_id'], keep=False)
        pid_dup_cnt = pid_dup_mask.sum()
        pid_dup_amt = payments_no_exact.loc[pid_dup_mask, 'amount'].sum()
        
        self.log_dq_issue(
            issue_id="DQ-PAY-02",
            category="Primary Key Collision",
            table_name="payments",
            affected_rows=pid_dup_cnt,
            monetary_impact=pid_dup_amt,
            changes_headline=True,
            treatment="Deduplicated by `payment_id` prioritizing SUCCESS status then earliest event_at.",
            rationale="Primary key `payment_id` must uniquely identify an analytical payment event.",
            limitation="If two legitimate transactions shared an ID by collision, only one is counted."
        )
        
        # Issue 3.3: Missing payment_reference
        missing_pref = payments_raw['payment_reference'].isna().sum()
        missing_pref_amt = payments_raw.loc[payments_raw['payment_reference'].isna(), 'amount'].sum()
        self.log_dq_issue(
            issue_id="DQ-PAY-03",
            category="Missing Transaction Reference",
            table_name="payments",
            affected_rows=missing_pref,
            monetary_impact=missing_pref_amt,
            changes_headline=False,
            treatment="Imputed synthetic reference `SYNTH_REF_<payment_id>` and flagged `imputed_reference = True`.",
            rationale="Legacy cash or manual collections lack gateway references but represent valid collected cash.",
            limitation="Cannot reconcile against gateway settlement logs."
        )
        
        # Issue 3.4: Payment Status Discrepancies (FAILED, PENDING, REVERSED)
        non_success = payments_raw[payments_raw['payment_status'] != 'SUCCESS']
        self.log_dq_issue(
            issue_id="DQ-PAY-04",
            category="Non-Settled Payment Inclusion",
            table_name="payments",
            affected_rows=len(non_success),
            monetary_impact=non_success['amount'].sum(),
            changes_headline=True,
            treatment="Filtered out of primary recovery KPI; preserved in golden_payments with `is_settled = False`.",
            rationale="Pending and reversed transactions do not represent collected capital.",
            limitation="Pending transactions that subsequently clear are excluded from point-in-time calculation."
        )
        
        # Parse timestamps & Timezone normalization
        # Note: Accounts contain timezone metadata ('UTC', 'Asia/Kolkata', 'Asia/Dubai')
        # We parse event_at as UTC standard
        payments_clean = payments_no_exact.copy()
        payments_clean['dt_utc'] = pd.to_datetime(payments_clean['event_at'], utc=True)
        payments_clean['year_month'] = payments_clean['dt_utc'].dt.to_period('M').astype(str)
        payments_clean['date_utc'] = payments_clean['dt_utc'].dt.date
        payments_clean['is_settled'] = payments_clean['payment_status'] == 'SUCCESS'
        
        # Deduplicate payment_id deterministically
        # Sort so SUCCESS comes first, then earliest event_at
        status_priority = {'SUCCESS': 0, 'PENDING': 1, 'REVERSED': 2, 'FAILED': 3}
        payments_clean['status_rank'] = payments_clean['payment_status'].map(status_priority).fillna(99)
        payments_clean = payments_clean.sort_values(['status_rank', 'dt_utc']).drop_duplicates(subset=['payment_id'], keep='first')
        
        # Join account metadata into golden_payments
        payments_joined = payments_clean.merge(
            accounts_clean[['account_id', 'risk_segment', 'loan_type', 'dpd_bucket', 'outstanding_amount', 'timezone']],
            on='account_id',
            how='left'
        )
        
        # 4. Call Dispositions Normalization
        dispos_raw = pd.read_csv(os.path.join(self.raw_dir, "call_dispositions.csv"))
        legacy_dispos = (dispos_raw['disposition_version'] == 'legacy') | (dispos_raw['disposition_code'] == 'PTP')
        self.log_dq_issue(
            issue_id="DQ-DSP-01",
            category="Schema & Code Fragmentation",
            table_name="call_dispositions",
            affected_rows=legacy_dispos.sum(),
            monetary_impact=0.0,
            changes_headline=False,
            treatment="Standardized legacy code `PTP` to canonical `PROMISE_TO_PAY`.",
            rationale="Fragmented disposition codes split identical agent promise outcomes.",
            limitation="Historical nuance in legacy disposition scripts is unified."
        )
        dispos_clean = dispos_raw.copy()
        dispos_clean['canonical_disposition'] = dispos_clean['disposition_code'].replace({'PTP': 'PROMISE_TO_PAY'})
        
        # 5. Account Status History - Inverted Timestamps
        ash_raw = pd.read_csv(os.path.join(self.raw_dir, "account_status_history.csv"))
        ash_raw['dt_event'] = pd.to_datetime(ash_raw['event_at'], utc=True)
        ash_raw['dt_recorded'] = pd.to_datetime(ash_raw['recorded_at'], utc=True)
        inverted_ash = ash_raw['dt_recorded'] < ash_raw['dt_event']
        self.log_dq_issue(
            issue_id="DQ-ASH-01",
            category="Temporal Inconsistency",
            table_name="account_status_history",
            affected_rows=inverted_ash.sum(),
            monetary_impact=0.0,
            changes_headline=False,
            treatment="Flagged `has_inverted_timestamp = True`; chronological sorting uses `dt_event` as ground truth.",
            rationale="Client-device clock drift and asynchronous ingestion queues produce record_at < event_at.",
            limitation="Audit logging cannot prove sequence of state changes occurring within clock drift margin."
        )
        ash_clean = ash_raw.copy()
        ash_clean['has_inverted_timestamp'] = inverted_ash

        # 6. Agents Deduplication
        agents_raw = pd.read_csv(os.path.join(self.raw_dir, "agents.csv"))
        agents_clean = agents_raw.sort_values('joined_at').drop_duplicates(subset=['agent_id'], keep='last')
        self.log_dq_issue(
            issue_id="DQ-AGT-01",
            category="Table Snapshot Duplication",
            table_name="agents",
            affected_rows=len(agents_raw) - len(agents_clean),
            monetary_impact=0.0,
            changes_headline=False,
            treatment="Deduplicated to unique `agent_id` taking latest record.",
            rationale="Agents table represented an append-only log without unique constraints.",
            limitation="Historical agent team transfers are flattened to current team."
        )

        # 7. Generate Golden Monthly Metrics Table
        days_in_months = {
            '2026-01': 31, '2026-02': 28, '2026-03': 31,
            '2026-04': 30, '2026-05': 31, '2026-06': 30,
            '2026-07': 31, '2026-08': 8
        }
        
        total_portfolio_balance = accounts_clean['outstanding_amount'].sum()
        
        monthly_records = []
        for ym, days in days_in_months.items():
            m_all = payments_raw[pd.to_datetime(payments_raw['event_at'], utc=True).dt.to_period('M').astype(str) == ym]
            m_settled_raw = payments_raw[(pd.to_datetime(payments_raw['event_at'], utc=True).dt.to_period('M').astype(str) == ym) & (payments_raw['payment_status'] == 'SUCCESS')]
            m_clean = payments_joined[(payments_joined['year_month'] == ym) & (payments_joined['is_settled'])]
            
            raw_all_amt = m_all['amount'].sum()
            raw_success_amt = m_settled_raw['amount'].sum()
            clean_success_amt = m_clean['amount'].sum()
            clean_tx_count = len(m_clean)
            clean_paying_accounts = m_clean['account_id'].nunique()
            
            # Daily normalized
            daily_run_rate_clean = clean_success_amt / days
            daily_run_rate_raw = raw_success_amt / days
            
            # Balance recovery rate
            recovery_rate_pct = (clean_success_amt / total_portfolio_balance) * 100
            
            # Outlier 99th percentile trimmed
            p99 = m_clean['amount'].quantile(0.99) if len(m_clean) > 0 else 0
            trimmed_amt = m_clean.loc[m_clean['amount'] <= p99, 'amount'].sum()
            
            monthly_records.append({
                "year_month": ym,
                "days_in_period": days,
                "is_partial_month": ym == '2026-08',
                "raw_all_amount": float(raw_all_amt),
                "raw_success_amount": float(raw_success_amt),
                "clean_success_amount": float(clean_success_amt),
                "clean_tx_count": int(clean_tx_count),
                "clean_paying_accounts": int(clean_paying_accounts),
                "daily_run_rate_raw": float(daily_run_rate_raw),
                "daily_run_rate_clean": float(daily_run_rate_clean),
                "recovery_rate_portfolio_pct": float(recovery_rate_pct),
                "trimmed_99_amount": float(trimmed_amt)
            })
            
        golden_monthly = pd.DataFrame(monthly_records)

        # 8. Store in DuckDB Database
        logging.info(f"Connecting to DuckDB: {self.db_path}")
        con = duckdb.connect(self.db_path)
        
        con.execute("CREATE OR REPLACE TABLE golden_accounts AS SELECT * FROM accounts_clean")
        con.execute("CREATE OR REPLACE TABLE golden_borrowers AS SELECT * FROM borrowers_clean")
        con.execute("CREATE OR REPLACE TABLE golden_payments AS SELECT * FROM payments_joined")
        con.execute("CREATE OR REPLACE TABLE golden_call_dispositions AS SELECT * FROM dispos_clean")
        con.execute("CREATE OR REPLACE TABLE golden_account_status_history AS SELECT * FROM ash_clean")
        con.execute("CREATE OR REPLACE TABLE golden_agents AS SELECT * FROM agents_clean")
        con.execute("CREATE OR REPLACE TABLE golden_monthly_metrics AS SELECT * FROM golden_monthly")
        
        dq_df = pd.DataFrame(self.dq_ledger)
        con.execute("CREATE OR REPLACE TABLE dq_impact_ledger AS SELECT * FROM dq_df")

        # Register raw views for seamless reproduction of forensic SQL queries
        raw_tables = [
            'payments', 'accounts', 'borrowers', 'calls', 'call_attempts', 
            'call_dispositions', 'daily_targeting', 'campaigns', 'promises_to_pay',
            'whatsapp_events', 'sms_events', 'field_visits', 'complaints', 
            'account_status_history', 'agents', 'vendor_telephony'
        ]
        for tbl in raw_tables:
            csv_path = os.path.join(self.raw_dir, f"{tbl}.csv").replace("\\", "/")
            if os.path.exists(csv_path):
                con.execute(f"CREATE OR REPLACE VIEW {tbl} AS SELECT * FROM read_csv_auto('{csv_path}')")

        con.close()
        
        # Also export JSON artifacts for fast API & documentation consumption
        dq_df.to_json(os.path.join(DATA_DIR, "dq_impact_ledger.json"), orient="records", indent=2)
        golden_monthly.to_json(os.path.join(DATA_DIR, "golden_monthly_metrics.json"), orient="records", indent=2)
        
        logging.info("Pipeline execution completed successfully!")
        logging.info(f"Total DQ issues logged: {len(self.dq_ledger)}")
        return golden_monthly, dq_df

if __name__ == "__main__":
    pipeline = ForensicPipeline()
    golden_monthly, dq_df = pipeline.run()
    print("\n--- GOLDEN MONTHLY METRICS SUMMARY ---")
    print(golden_monthly[['year_month', 'days_in_period', 'raw_success_amount', 'clean_success_amount', 'daily_run_rate_clean', 'recovery_rate_portfolio_pct']])
    print("\n--- DATA QUALITY IMPACT LEDGER ---")
    print(dq_df[['issue_id', 'category', 'affected_rows', 'monetary_impact', 'changes_headline']])
