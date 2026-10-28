"""
Recovery Intelligence Lab - API Integration Tests
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

def test_kpi_summary(client):
    response = client.get("/api/kpi/summary")
    assert response.status_code == 200
    data = response.json()
    assert "verdict" in data
    assert "kpis" in data
    assert "timeline" in data
    assert data["verdict"]["status"] == "UNSUPPORTED_CALENDAR_ARTIFACT"
    assert "management_raw_growth_pct" in data["kpis"]
    assert data["kpis"]["management_raw_growth_pct"] == 10.99

def test_claim_stress_test(client):
    response = client.get("/api/metrics/stress-test")
    assert response.status_code == 200
    data = response.json()
    assert "scenarios" in data
    assert len(data["scenarios"]) >= 6
    # Find primary defensible scenario
    primary = next(s for s in data["scenarios"] if s["scenario_id"] == "SCN-03")
    assert primary["is_defensible"] is True
    assert primary["relative_change_pct"] == 0.29

def test_evidence_trace(client):
    response = client.get("/api/metrics/evidence-trace?metric=claim_11_pct")
    assert response.status_code == 200
    data = response.json()
    assert "formula" in data
    assert "sql_query" in data
    assert "audit_counts" in data
    assert "assumptions_and_caveats" in data

def test_data_quality_ledger(client):
    response = client.get("/api/data-quality/ledger")
    assert response.status_code == 200
    data = response.json()
    assert "issues" in data
    assert data["total_issues"] >= 5
    assert data["total_financial_impact"] > 0

def test_performance_drivers(client):
    response = client.get("/api/performance/drivers")
    assert response.status_code == 200
    data = response.json()
    assert "by_risk_segment" in data
    assert "by_loan_type" in data
    assert "mix_shift_decomposition" in data

def test_strategy_sandbox(client):
    response = client.get("/api/strategy/sandbox?priority_rule=HIGH_BALANCE_EARLY_DPD&contact_capacity=5000")
    assert response.status_code == 200
    data = response.json()
    assert "workload_and_coverage" in data
    assert "historical_observed_outcomes" in data
    assert "causal_disclaimer" in data
    assert "randomized_experiment_protocol" in data
    assert data["workload_and_coverage"]["accounts_targeted"] == 5000
