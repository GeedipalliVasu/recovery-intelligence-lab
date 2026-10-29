# ARCHITECTURE & ANALYTICAL DECISION RECORDS (ADR)

**Project**: Recovery Intelligence Lab  
**Scope**: Core Analytical Metrics, Data Engineering Pipeline & Investment Modeling  
**Status**: Project Decision Record  

---

### ADR 01: Calendar-Normalized Daily Settled Run-Rate as Primary Benchmark

* **Status**: Accepted
* **Context**: Management reported an unadjusted +10.99% month-on-month recovery growth between February 2026 and March 2026. February contains 28 calendar days, while March contains 31 calendar days.
* **Decision**: Adopt Calendar-Normalized Daily Settled Run-Rate ($\text{Clean Settled Amount} / \text{Days in Month}$) as the primary benchmark metric rather than aggregate monthly totals.
* **Alternatives Considered**: 
  * *Raw monthly totals*: Flawed because it conflates operational performance with calendar duration (+10.71% available days).
  * *Working-day normalization*: Inapplicable because digital payment gateways (UPI, net banking) and automated telephony run 7 days a week.
* **Consequences & Trade-offs**: 
  * Normalizing by days reveals the true underlying run-rate moved from ₹60.77 Lakhs/day to ₹60.94 Lakhs/day (+0.29%, Welch's t-test $p = 0.932$), demonstrating that daily operational productivity was flat.
  * Monthly reporting requires dual-track presentation (nominal total vs daily rate) to prevent leadership misinterpretation.

---

### ADR 02: Deterministic Deduplication of Exact Rows and Webhook Retries

* **Status**: Accepted
* **Context**: `payments.csv` contains 486 exact byte-for-byte duplicate rows and 14 primary key collision pairs (28 rows total, 14 dropped), reflecting webhook retry storms and multi-partition ingestion overlaps.
* **Decision**: Deduplicate exact rows entirely and resolve primary key collisions by prioritizing `payment_status = 'SUCCESS'` and earliest timestamp (`event_at`).
* **Alternatives Considered**: 
  * *Ingest as distinct transactions*: Creates phantom revenue of ₹3.84 Cr and distorts financial reconciliation.
  * *Arbitrary first-seen deduplication*: Risk of preserving FAILED retry attempts over subsequent SUCCESS settlements.
* **Consequences & Trade-offs**: 
  * Prevents revenue overstatement and enforces primary key integrity in `golden_payments`.
  * All excluded transactions are cataloged in an auditable machine-readable Data Quality Impact Ledger (`dq_impact_ledger`).

---

### ADR 03: Preservation of Orphan Accounts in the Portfolio Denominator

* **Status**: Accepted
* **Context**: 455 accounts have missing `borrower_id` and 2,913 accounts have orphan borrower foreign keys not present in `borrowers.csv`.
* **Decision**: Retain all 30,000 accounts (and their associated ₹1,048.90 Cr balance) in the portfolio recovery denominator, flagging unlinked records with boolean indicators (`is_orphan_borrower = TRUE`).
* **Alternatives Considered**: 
  * *Inner join filtering*: Dropping accounts without matching borrower demographic records.
* **Consequences & Trade-offs**: 
  * Dropping unlinked accounts would artificially strip ₹100.65 Cr of debt from the portfolio denominator, artificially inflating calculated recovery rates from 1.80% to 2.03% (denominator manipulation).
  * Demographic analysis on borrower segments must explicitly document the coverage rate (~90.3%).

---

### ADR 04: Rejection of Causal Attribution from Historical Contact Logs

* **Status**: Accepted
* **Context**: 94.8% of paying accounts were contacted via voice dialer, leading operational teams to claim outreach was the primary cause of collections recovery.
* **Decision**: Reject observational contact logs as proof of causal lift. Document the high prevalence of debtor self-cure and require randomized holdouts for future attribution.
* **Alternatives Considered**: 
  * *Last-touch attribution*: Crediting the last channel before payment timestamp.
* **Consequences & Trade-offs**: 
  * Cross-cohort audit proved that 94.6% of *non-paying* accounts were also contacted at identical call frequencies. 
  * Dialing indiscriminately without holdout controls creates post-hoc attribution bias. The analytical engine disclaims causal attribution on observational data.

---

### ADR 05: ₹10 Cr Capital Deployment: ML Borrower Targeting (Option 4) with A/B Holdout

* **Status**: Accepted
* **Context**: Leadership allocated ₹10 Cr to be deployed into one of six candidate collections initiatives.
* **Decision**: Allocate ₹10 Cr to Option 4 (Better Borrower Targeting & ML Propensity Allocation Engine) under an orthogonal 80/20 Randomized Controlled Trial (RCT) governance protocol.
* **Alternatives Considered**: 
  * *Option 1 (Telephony trunks)*: Connect rates are flat across vendors (~20%); telephony capacity is not the constraint.
  * *Option 2 (More collection agents)*: High marginal cost per dial with stagnant Right Party Contact (RPC) rates.
  * *Option 3 (AI voice bots)*: Without targeting intelligence, automated bots scale uncalibrated dialing and drive customer complaints.
* **Consequences & Trade-offs**: 
  * Shifts outbound dialer capacity away from chronic non-payers and organic self-curers to the marginal responsiveness band (DPD 15–60).
  * Projected incremental recovery of ₹28.5 Cr (2.85x ROI, 4.2-month break-even).
  * Requires maintaining a 20% control holdout group to measure true incremental lift above baseline.
