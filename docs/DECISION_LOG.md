# DECISION LOG & INTERVIEW DEFENSE GUIDE

**Project**: Recovery Intelligence Lab  
**Author**: Lead Analytics Engineer  

This document logs all critical architecture and analytical decisions made during the forensic investigation, alternative options considered, and the exact evidence-based rationale to defend each choice in an executive interview.

---

## 1. Primary Metric Definition: Daily Run-Rate vs. Raw Monthly Volume

* **Decision**: Adopt Calendar-Normalized Daily Settled Run-Rate ($\text{Clean Settled Amount} / \text{Days in Month}$) as the primary benchmark metric rather than aggregate monthly totals.
* **Alternative Considered**: Comparing raw monthly sums or working-day sums.
* **Rationale**: February has 28 days and March has 31 days. A 3-day difference automatically inflates available operating days by 10.71%. Because digital payments, dialers, and SMS gateways run continuously 7 days a week, calendar day normalization is standard corporate treasury accounting practice.
* **Interview Defense**: *"If a collections leader claims an 11% improvement from Feb to Mar, asking 'did your daily collection rate change?' immediately uncovers that the gain is an artifact of March having 3 extra calendar days."*

---

## 2. Ingestion Deduplication: Dropping 486 Exact Duplicates & PK Collisions

* **Decision**: Drop 486 exact byte-for-byte duplicate payment rows and resolve duplicate `payment_id`s by prioritizing `SUCCESS` and earliest `event_at`.
* **Alternative Considered**: Retaining all rows as distinct transactions or averaging them.
* **Rationale**: Primary keys in financial accounting must be strictly unique. The 486 duplicate rows resulted from webhook delivery retries or multi-partition ingestion overlaps. Retaining them creates phantom revenue of ₹37.3 Cr.
* **Interview Defense**: *"Counting duplicate webhook records inflates both cashflow and debtor penetration. We isolated exact duplicates and logged their monetary impact in an auditable Data Quality Ledger."*

---

## 3. Preservation of Orphan Account Balances in Denominator

* **Decision**: Retain 455 accounts with missing `borrower_id` and 2,913 accounts with orphan borrower foreign keys in the total portfolio denominator ($N = 30,000$).
* **Alternative Considered**: Performing an `INNER JOIN accounts ON borrowers` to discard orphan records.
* **Rationale**: Discarding orphan accounts would remove ₹100.65 Cr of debt from the portfolio denominator, artificially inflating portfolio recovery rates from 1.80% to 2.03% (denominator manipulation).
* **Interview Defense**: *"An unlinked borrower does not make a debt obligation disappear. Discarding them creates artificial survivor bias in conversion metrics."*

---

## 4. Rejection of Causal Claims from Historical Dialer Contact

* **Decision**: Refuse to attribute payments to historical dialer contacts as 'causal lift'.
* **Alternative Considered**: Last-touch attribution (crediting the last channel before payment).
* **Rationale**: Data forensics proved that 94.8% of paying accounts were contacted, but 94.6% of *non-paying* accounts were also contacted. Contact rates were identical across both cohorts. The underlying data generating process reflects a high rate of debtor self-cure.
* **Interview Defense**: *"Post-hoc ergo propter hoc is the most dangerous trap in collections analytics. Without a randomized holdout, calling everyone and then claiming calls caused recovery is an attribution fallacy."*

---

## 5. The ₹10 Cr Investment Choice: Option 4 (Targeting) with an RCT Guardrail

* **Decision**: Recommend deploying ₹10 Cr into Option 4 (Better Borrower Targeting & ML Propensity Allocation) with a mandatory 80/20 Randomized Controlled Trial (RCT) holdout.
* **Alternative Considered**: Buying more telephony dialer trunks or hiring more manual agents.
* **Rationale**: Dialer connect rates are already flat at ~20% across all 24 hours of the day. Adding more dialer trunks simply rings unanswered numbers faster. Better targeting focuses expensive outreach on the marginal responsiveness band (DPD 15–60) while allowing self-curers to pay organically, generating ₹28.5 Cr incremental recovery at 2.85x ROI.
* **Interview Defense**: *"Hiring more agents to dial random numbers scales a broken process. Allocating capital to intelligent segmentation and validating lift with a 20% holdout protects capital and guarantees verifiable ROI."*

