# IMPLEMENTATION PLAN — RECOVERY INTELLIGENCE LAB

**Project**: Recovery Intelligence Lab  
**Scope**: Ingestion, Golden Analytical Pipeline, Forensic Verification & Dashboard  
**Date**: October 2026  
**Status**: Completed (100% Verified)  

---

## 1. Executive Summary & Reconnaissance Findings

### The Business Question
> *Management claims that collections recovery improved by 11% month-on-month. Is that improvement real, correctly calculated, statistically credible, and attributable to better collection performance rather than changes in portfolio composition, payment timing, data quality, or targeting?*

### Initial Forensic Reconnaissance
1. **The Source of the 11% Claim**:
   - In `payments.csv`, comparing February 2026 to March 2026:
     - **February 2026 (SUCCESS payments)**: $174,097,288 across 2,315 successful payments.
     - **March 2026 (SUCCESS payments)**: $193,233,384 across 2,576 successful payments.
     - **Raw Change**: `($193,233,384 - $174,097,288) / $174,097,288 = +10.9916%` (matches the 11% claim exactly).
2. **The Forensic Reality — Calendar Month Length Artifact**:
   - February 2026 has **28 days** ($6,217,760/day).
   - March 2026 has **31 days** ($6,233,335/day).
   - The calendar length alone accounts for `31 / 28 = +10.71%` increase in available collection days!
   - On a **daily normalized run-rate basis**, the change is **+0.25%**, which is statistically indistinguishable from zero ($p = 0.89$).
3. **Severe Data Quality Distortions**:
   - **486 exact duplicate rows** in `payments.csv`.
   - **1,000 rows sharing `payment_id`** (500 distinct duplicated IDs).
   - **8,424 rows sharing `payment_reference`** (3,745 references appearing multiple times, with 1,681 having divergent statuses like FAILED followed by SUCCESS).
   - **455 accounts with missing `borrower_id`** and **2,913 orphan borrower links**.
   - **19,585 duplicate borrower records** (snapshots without unique key enforcement).
   - **30,191 account status history records with inverted timestamps** (`recorded_at < event_at`).
   - Legacy disposition code conflation (`PTP` vs `PROMISE_TO_PAY`).

---

## 2. Proposed Architecture

```
[Raw CSVs: collections_30k_dataset/]
          │
          ▼
[Forensic Ingestion & Validation Pipeline: scripts/pipeline.py]
  - Deduplication (exact & business keys)
  - Reconciliation of multi-status references
  - Timestamp standardization to UTC
  - Anomaly logging & Data Quality Impact Ledger
          │
          ▼
[DuckDB Golden Storage: data/recovery_intelligence.duckdb]
  - golden_payments
  - golden_accounts
  - golden_monthly_metrics
  - dq_impact_ledger
          │
          ▼
[Analytical Engine: backend/analytics/]
  - Stress Test Scenarios (Raw, Normalized, Deduped, Winsorized, Mix-Adjusted)
  - Statistical Discipline (Two-sample tests, Mann-Whitney U, Bootstrap 95% CIs)
  - Evidence Trace (Formulas, sample counts, SQL queries)
  - Strategy Sandbox (Portfolio rules, capacity model, causal experiment design)
          │
          ▼
[FastAPI REST API: backend/main.py]
  - /api/kpi/summary
  - /api/metrics/stress-test
  - /api/metrics/evidence-trace
  - /api/data-quality/ledger
  - /api/performance/drivers
  - /api/strategy/sandbox
          │
          ▼
[React + Vite + Recharts Frontend: frontend/]
  - Executive Overview
  - Performance Drivers
  - Data Quality Ledger
  - Claim Stress Test
  - Collection Strategy Sandbox
  - Evidence Trace & Methodology
```

---

## 3. Metric Definitions to Investigate

| Metric ID | Name | Formula / Definition | Unit | MoM Feb->Mar Result |
| :--- | :--- | :--- | :--- | :--- |
| `M1_RAW_SUCCESS` | Raw Success Payment Volume | $\sum \text{amount}_{\text{SUCCESS}}$ | Currency ($) | **+10.99%** (The Claim) |
| `M2_DAILY_NORM` | Daily Normalized Run-Rate | $\frac{\sum \text{amount}_{\text{SUCCESS}}}{\text{Days in Month}}$ | $/day | **+0.25%** |
| `M3_DEDUP_PID` | Payment-ID Deduplicated | $\sum \text{amount}_{\text{SUCCESS}}$ (unique `payment_id`) | Currency ($) | **+11.03%** |
| `M4_DEDUP_PREF` | Reference Deduplicated | $\sum \text{amount}_{\text{SUCCESS}}$ (unique `payment_reference`) | Currency ($) | **+11.81%** |
| `M5_DISTINCT_ACCT`| Paying Account Count | Count of distinct `account_id` with SUCCESS | Accounts | **+11.32%** (Raw), **+0.55%** (Daily) |
| `M6_RECOVERY_RATE`| Balance Recovery Rate | $\frac{\sum \text{amount}_{\text{SUCCESS}}}{\sum \text{outstanding\_amount}}$ | % | **1.66% -> 1.84%** (+0.18 pp, +10.8% rel) |
| `M7_MIX_ADJUSTED` | Standardized Mix Rate | Portfolio weight-adjusted recovery rate | % | **1.67% -> 1.84%** (Mix shift impact: < 0.05%) |
| `M8_WINSORIZED`   | 99th-Percentile Trimmed | Recovery excluding top 1% extreme payments | Currency ($) | **+10.85%** (Raw), **+0.12%** (Daily) |

---

## 4. Testing & QA Strategy

1. **Unit Tests (`tests/test_metrics.py`)**:
   - Zero and null denominator handling.
   - Percentage vs percentage-point arithmetic.
   - Calendar normalization logic across leap and non-leap years.
   - Outlier trimming and winsorization logic.
2. **Data Pipeline Tests (`tests/test_pipeline.py`)**:
   - Exact duplicate row detection.
   - Business key deduplication (`payment_id`, `payment_reference`).
   - Cardinality check: zero payment duplication when joining accounts.
   - Deterministic timestamp handling (UTC normalization).
3. **Statistical Engine Tests (`tests/test_statistics.py`)**:
   - Hypothesis test assumptions (Welch's t-test, Mann-Whitney U).
   - Bootstrap confidence interval convergence and symmetry.
4. **API Integration Tests (`tests/test_api.py`)**:
   - Healthcheck status 200.
   - Schema validation for `/api/kpi/summary`, `/api/metrics/stress-test`, `/api/data-quality/ledger`.
   - Error handling for invalid parameter inputs.
5. **Frontend Verification**:
   - Component rendering, loading states, empty states, and responsive styling.

---

## 5. Risks & Mitigation

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Confounding in Attribution** | Mistaking targeting correlation for collection effectiveness. | Explicitly disclaim causal claims in the Sandbox; provide an A/B pilot protocol with power calculation. |
| **Timezone Boundary Leakage** | Payments shifted between months by 4-5.5 hour offsets. | Normalize all timestamps to UTC in the golden pipeline and quantify borderline records. |
| **Duplicate Ingestion Inflation** | Multiple records inflating payments. | Strict deterministic deduplication with audit logs in the DQ Impact Ledger. |

---

## 6. Implementation Checklist

- [x] Initial reconnaissance and file inspection completed.
- [x] Root cause of 11% claim verified (Feb 28d vs Mar 31d calendar artifact).
- [x] Data quality anomalies audited (duplicates, missing keys, inverted dates).
- [x] `docs/IMPLEMENTATION_PLAN.md` created.
- [x] Implement data ingestion and golden pipeline (`scripts/pipeline.py`).
- [x] Export DuckDB database `data/recovery_intelligence.duckdb` and DQ ledger.
- [x] Implement backend analytics, stress testing, and evidence trace engine.
- [x] Implement FastAPI endpoints.
- [x] Implement unit and integration tests (`pytest`).
- [x] Build React + Vite frontend dashboard with Recharts.
- [x] Author documentation: `DATA_DICTIONARY.md`, `DATA_QUALITY_REPORT.md`, `METRIC_DEFINITIONS.md`, `ARCHITECTURE.md`, `LIMITATIONS.md`, `DECISION_LOG.md`.
- [x] Author Executive Memo (`reports/EXECUTIVE_MEMO.md`).
- [x] Author README handover and Git checklist.
- [x] Verify full acceptance gate.
