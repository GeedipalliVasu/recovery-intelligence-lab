# DATA REPOSITORY & STORAGE ARCHITECTURE

This directory stores the golden analytical dataset, machine-readable data quality logs, and pre-computed metric artifacts for the **Recovery Intelligence Lab**.

---

## 1. Directory Structure

* `collections_30k_dataset/`: Raw, immutable source CSV archives (17 relational files, 30,000 accounts, Seed=42).
* `data/recovery_intelligence.duckdb`: Authoritative DuckDB columnar analytical database containing golden and raw views.
* `data/dq_impact_ledger.json`: Machine-readable audit export of the 10 audited data-quality anomalies.
* `data/golden_monthly_metrics.json`: Pre-computed monthly timeline metrics for rapid REST API response.

---

## 2. Reproducibility & Regeneration

The entire database and JSON exports can be deterministically reproduced from scratch with a single command:

```powershell
python scripts/pipeline.py
```

This script:
1. Validates input schemas and enforces data contracts.
2. Deduplicates exact duplicate rows and primary key collisions in `payments.csv`.
3. Normalizes all timestamps to standard UTC epoch.
4. Unifies legacy disposition codes (`PTP` -> `PROMISE_TO_PAY`).
5. Deduplicates agent profiles down to 1,000 unique operational personnel.
6. Writes clean tables to `data/recovery_intelligence.duckdb`.
7. Exports JSON artifacts for instant web dashboard consumption.
