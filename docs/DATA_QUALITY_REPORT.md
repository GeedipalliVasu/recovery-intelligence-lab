# DATA QUALITY & FORENSIC AUDIT REPORT

**Project**: Recovery Intelligence Lab  
**Scope**: 17 Relational Collections Datasets (30,000 Accounts, ~500,000 Event Rows)  
**Author**: Lead Data Forensic Auditor & Analytics Engineer  
**Status**: Authoritative Reference  

---

## 1. Executive Summary & Audit Overview

A comprehensive audit of the `collections_30k_dataset` revealed multiple systemic data-quality issues, synthetic corruptions, relational key violations, and temporal inconsistencies. 

If uncorrected, these data quality failures **distort the primary headline recovery metric by up to ₹575.8 Cr** and produce false signals regarding operational productivity.

```
+---------------------------------------------------------------------------------------+
|                                DATA RECONCILIATION FLOW                               |
|                                                                                       |
|   Raw Records          Rejected / Corrected              Golden Analytical Dataset    |
|   ───────────          ────────────────────              ─────────────────────────    |
|   payments: 25,500 ──► - 486 exact duplicates       ───► golden_payments: 25,000      |
|                        - 1,000 PK collision resolved     (17,880 settled SUCCESS)     |
|                        - 7,620 non-settled flagged                                    |
|                                                                                       |
|   accounts: 30,000 ──► - 455 missing borrower_id    ───► golden_accounts: 30,000      |
|                        - 2,913 orphan borrowers retained (all balances verified)      |
|                                                                                       |
|   borrowers: 30,600 ─► - 19,585 historical snapshots ──► golden_borrowers: 11,015    |
|                          deduplicated to unique IDs                                   |
|                                                                                       |
|   dispositions: 35k ─► - 3,904 legacy 'PTP' unified ───► canonical 'PROMISE_TO_PAY'   |
|                                                                                       |
|   agents: 30,000   ──► - 29,000 redundant log rows  ───► golden_agents: 1,000         |
+---------------------------------------------------------------------------------------+
```

---

## 2. Quantified Data Quality Impact Ledger

The table below reflects all 10 documented issues audited in `scripts/pipeline.py` and stored in `dq_impact_ledger`:

| Issue ID | Category | Table | Affected Rows | Monetary Impact (₹) | Alters 11% Claim? | Treatment & Reconciliation Rule |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DQ-PAY-01** | Exact Duplicate Rows | `payments.csv` | 486 | ₹37,29,90,198 | **YES** | Dropped identical duplicate rows created by ingestion/webhook retries. |
| **DQ-PAY-02** | Primary Key Collisions | `payments.csv` | 28 | ₹2,13,46,489 | **YES** | Deduplicated by `payment_id`, prioritizing `SUCCESS` status, then earliest `event_at`. |
| **DQ-PAY-03** | Missing References | `payments.csv` | 382 | ₹28,75,67,886 | NO | Imputed synthetic reference `SYNTH_REF_<id>` and flagged `imputed_reference=True`. |
| **DQ-PAY-04** | Non-Settled Transactions | `payments.csv` | 7,620 | ₹575,77,26,908 | **YES** | Filtered `FAILED`, `PENDING`, `REVERSED` from headline recovery; retained in golden table with `is_settled=False`. |
| **DQ-ACC-01** | Missing Foreign Key | `accounts.csv` | 455 | ₹15,38,56,547 | NO | Flagged `has_missing_borrower=True`; account balances retained to prevent denominator manipulation. |
| **DQ-ACC-02** | Orphan Foreign Key | `accounts.csv` | 2,913 | ₹85,27,28,421 | NO | Flagged `is_orphan_borrower=True`; accounts retained in analytical portfolio book. |
| **DQ-BOR-01** | Entity Duplication | `borrowers.csv` | 19,585 | ₹0 (Audit) | NO | Deduplicated to unique `borrower_id` using the latest `updated_at` timestamp. |
| **DQ-DSP-01** | Legacy Code Fragmentation| `call_dispositions.csv` | 14,334 | ₹0 (Operational)| NO | Mapped legacy disposition `PTP` to canonical `PROMISE_TO_PAY`. |
| **DQ-ASH-01** | Inverted Timestamps | `account_status_history.csv` | 30,191 | ₹0 (Audit) | NO | Flagged `has_inverted_timestamp=True`; used `event_at` rather than `recorded_at` as ground truth. |
| **DQ-AGT-01** | Table Duplication | `agents.csv` | 29,000 | ₹0 (Operational)| NO | Deduplicated append-only log down to 1,000 distinct operational agents. |

---

## 3. Deep Forensic Investigation (Part 2 Requirements)

### A. Duplicate Payments & Webhook Re-deliveries
* **Finding:** In `payments.csv`, exactly 486 rows were byte-for-byte duplicates. Furthermore, 8,424 rows shared a `payment_reference` across multiple payment IDs.
* **Forensic Root Cause:** Webhook redeliveries and multi-leg gateway attempts. In 1,681 instances, an initial `FAILED` attempt was succeeded by a `SUCCESS` event under the same external payment reference.
* **Treatment:** Terminal status resolution. Only terminal settled transactions are credited towards cash recovery.

### B. Payment Attribution Fallacy
* **Finding:** 94.8% of paying accounts received a voice call within 30 days prior to payment. However, **94.6% of accounts that never paid also received calls**.
* **Forensic Root Cause:** Blanket dialer cadence creates spurious correlation. Naive last-touch attribution improperly credits automated dialer pings for payments that were organic self-cures.
* **Treatment:** Explicitly disclaimed last-touch attribution in golden metrics; required an orthogonal A/B randomized control group for future causal claims.

### C. Timezone Discrepancies
* **Finding:** Timestamps are recorded across three time zones: `UTC`, `Asia/Kolkata` (UTC+5:30), and `Asia/Dubai` (UTC+4:00).
* **Forensic Root Cause:** Inconsistent server logging across geographically distributed telephony instances. Transactions executed between 18:30 UTC and 23:59 UTC on February 28 fall into March 1 in Indian Standard Time (IST).
* **Treatment:** All timestamps were standardized to UTC epoch (`TIMESTAMPTZ`) in `scripts/pipeline.py`.

### D. Vendor Telephony & Disposition Mapping Changes
* **Finding:** Disposition codes switched between legacy script identifiers (`PTP`) and v1/v2 schema identifiers (`PROMISE_TO_PAY`).
* **Forensic Root Cause:** Telephony vendor CRM migration mid-year without retro-fitting historical disposition lookups.
* **Treatment:** Unified all promise dispositions under the canonical code `PROMISE_TO_PAY`.

### E. Agent Identity Problems
* **Finding:** `agents.csv` contains 30,000 rows but only 1,000 unique `agent_id`s and 1,099 `employee_code`s.
* **Forensic Root Cause:** The source table was an unindexed append-only event log recording status updates rather than a dimensional table of employees.
* **Treatment:** Deduplicated by `agent_id` taking the most recent profile snapshot.

### F. Denominator Manipulation Audit
* **Finding:** 455 accounts in `accounts.csv` lack a `borrower_id` and 2,913 reference borrower IDs that do not exist in `borrowers.csv`.
* **Forensic Risk:** If an analyst performs an `INNER JOIN accounts ON borrowers`, exactly 3,368 accounts representing **₹100.65 Cr of debt** vanish from the denominator, artificially inflating portfolio recovery rates from **1.80% to 2.03%**.
* **Treatment:** Retained all 30,000 accounts in the golden denominator using `LEFT JOIN`.

