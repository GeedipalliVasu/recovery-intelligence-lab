"""
Recovery Intelligence Lab - Pipeline & Data Quality Tests
"""

import os
import duckdb
import pytest

DB_PATH = os.path.join("data", "recovery_intelligence.duckdb")

@pytest.fixture
def db_conn():
    if not os.path.exists(DB_PATH):
        pytest.skip(f"Database not found at {DB_PATH}. Run pipeline first.")
    conn = duckdb.connect(DB_PATH, read_only=True)
    yield conn
    conn.close()

def test_golden_tables_exist(db_conn):
    tables = [t[0] for t in db_conn.execute("SHOW TABLES").fetchall()]
    assert "golden_accounts" in tables
    assert "golden_payments" in tables
    assert "golden_monthly_metrics" in tables
    assert "dq_impact_ledger" in tables

def test_no_exact_duplicate_payments(db_conn):
    dup_count = db_conn.execute("""
        SELECT COUNT(*) - COUNT(DISTINCT payment_id) 
        FROM golden_payments
    """).fetchone()[0]
    assert dup_count == 0, f"Found {dup_count} duplicate payment_ids in golden_payments!"

def test_join_cardinality_accounts_payments(db_conn):
    # Verify that joining accounts onto payments does not inflate row count
    base_count = db_conn.execute("SELECT COUNT(*) FROM golden_payments").fetchone()[0]
    joined_count = db_conn.execute("""
        SELECT COUNT(*) 
        FROM golden_payments p
        JOIN golden_accounts a ON p.account_id = a.account_id
    """).fetchone()[0]
    assert base_count == joined_count, f"Join cardinality inflation detected: {base_count} vs {joined_count}"

def test_dq_ledger_integrity(db_conn):
    issues = db_conn.execute("SELECT issue_id, category, affected_rows, monetary_impact FROM dq_impact_ledger").df()
    assert len(issues) >= 5, "Expected at least 5 documented DQ issues."
    assert (issues['affected_rows'] >= 0).all()
    assert (issues['monetary_impact'] >= 0).all()

def test_feb_mar_settled_metrics(db_conn):
    df = db_conn.execute("""
        SELECT year_month, clean_success_amount, days_in_period, daily_run_rate_clean
        FROM golden_monthly_metrics
        WHERE year_month IN ('2026-02', '2026-03')
        ORDER BY year_month
    """).df()
    
    assert len(df) == 2
    feb = df[df['year_month'] == '2026-02'].iloc[0]
    mar = df[df['year_month'] == '2026-03'].iloc[0]
    
    assert feb['days_in_period'] == 28
    assert mar['days_in_period'] == 31
    
    daily_diff_pct = ((mar['daily_run_rate_clean'] - feb['daily_run_rate_clean']) / feb['daily_run_rate_clean']) * 100
    assert abs(daily_diff_pct) < 1.0, f"Expected daily diff < 1%, got {daily_diff_pct}%"
