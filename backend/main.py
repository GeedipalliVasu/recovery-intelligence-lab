"""
Recovery Intelligence Lab - Main FastAPI Application
"""

import os
from typing import Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.database import get_db_connection
from backend.analytics.kpi import get_executive_summary
from backend.analytics.stress_test import get_claim_stress_test_scenarios
from backend.analytics.evidence_trace import get_evidence_trace
from backend.analytics.drivers import get_performance_drivers
from backend.analytics.strategy import simulate_strategy

app = FastAPI(
    title="Recovery Intelligence Lab API",
    description="Forensic investigation into management's 11% month-on-month collections recovery claim.",
    version="1.0.0"
)

# Enable CORS for local Vite dev server and production frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    try:
        con = get_db_connection()
        count = con.execute("SELECT COUNT(*) FROM golden_monthly_metrics").fetchone()[0]
        con.close()
        return {"status": "healthy", "database": "connected", "monthly_records": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")

@app.get("/api/kpi/summary")
def kpi_summary():
    try:
        return get_executive_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/metrics/stress-test")
def claim_stress_test():
    try:
        return get_claim_stress_test_scenarios()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/metrics/evidence-trace")
def evidence_trace(metric: str = Query("claim_11_pct", description="Metric identifier to trace")):
    try:
        return get_evidence_trace(metric)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data-quality/ledger")
def data_quality_ledger():
    try:
        con = get_db_connection()
        ledger_df = con.execute("SELECT * FROM dq_impact_ledger ORDER BY monetary_impact DESC").df()
        con.close()
        return {
            "total_issues": len(ledger_df),
            "total_financial_impact": float(ledger_df['monetary_impact'].sum()),
            "issues": ledger_df.to_dict(orient="records")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/performance/drivers")
def performance_drivers():
    try:
        return get_performance_drivers()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/strategy/sandbox")
def strategy_sandbox(
    priority_rule: str = Query("HIGH_BALANCE_EARLY_DPD", description="Targeting priority rule"),
    contact_capacity: int = Query(10000, ge=1000, le=30000, description="Monthly contact attempt capacity"),
    min_dpd: int = Query(1, ge=0, le=180, description="Minimum DPD"),
    max_dpd: int = Query(90, ge=0, le=180, description="Maximum DPD")
):
    try:
        return simulate_strategy(
            priority_rule=priority_rule,
            contact_capacity=contact_capacity,
            min_dpd=min_dpd,
            max_dpd=max_dpd
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount built frontend static files for unified single-port hosting
from fastapi.staticfiles import StaticFiles

dist_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
if os.path.exists(dist_path):
    app.mount("/", StaticFiles(directory=dist_path, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
