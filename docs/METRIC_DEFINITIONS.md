# METRIC DEFINITIONS & OPERATIONAL METRIC CHALLENGES

**Project**: Recovery Intelligence Lab  
**Scope**: Definitive Operational Metric Framework  
**Author**: Lead Analytics Engineer  

---

## 1. Primary Recovery Metrics Under Investigation

| Metric Code | Metric Name | Existing Naive Definition | Proposed Authoritative Definition | Why the Existing Metric is Flawed |
| :--- | :--- | :--- | :--- | :--- |
| **MTR-01** | **Monthly Recovery Volume** | $\sum \text{Amount}_{\text{SUCCESS}}$ | $\frac{\sum \text{Clean Settled Amount}}{\text{Active Calendar Days}}$ ($/day) | Comparing 28 days (Feb) to 31 days (Mar) introduces an unavoidable 10.71% calendar distortion. |
| **MTR-02** | **Portfolio Recovery Rate** | $\frac{\text{Monthly Recovery}}{\text{Active Balance}}$ | $\frac{\sum \text{Clean Settled Recovery}}{\sum \text{Total Portfolio Outstanding Balance}}$ | Omits delinquent accounts that drop out of contact lists, causing survivor bias. |
| **MTR-03** | **Paying Debtor Penetration** | Unique Accounts Paying / Active | $\frac{\text{Distinct Accounts with Settled Payment}}{\text{Total Portfolio Accounts}}$ | Micro-payments and split payments inflate transaction counts without increasing recovered accounts. |

---

## 2. Challenging the Existing Operations Metrics (Assignment Page 3)

### 1. Contact Rate
* **Existing Flawed Definition:** $\frac{\text{Total Calls with Status ANSWERED}}{\text{Total Call Attempts}}$
* **Flaw:** Conflates call attempts with reachable debtors. A progressive dialer retrying the same unanswered number 7 times penalizes the metric, while automated voicemail drops falsely register as "contact".
* **Proposed Definition:** $\frac{\text{Distinct Accounts with at least 1 Human Interaction}}{\text{Total Accounts Targeted in Month}}$
* **Appropriateness:** Measures unique customer reachability rather than dialer aggression.

### 2. Right Party Contact (RPC) Rate
* **Existing Flawed Definition:** $\frac{\text{Dispositions not in (WRONG\_NUMBER, NO\_CONTACT)}}{\text{Total Answered Calls}}$
* **Flaw:** High agent gaming: agents mark disconnected calls as callbacks to protect RPC bonuses.
* **Proposed Definition:** $\frac{\text{Calls with verified debtor identity authentication}}{\text{Total Answered Calls}}$
* **Appropriateness:** Excludes wrong numbers, third-party relatives, and non-debtor pick-ups.

### 3. Promise-to-Pay (PTP) Rate
* **Existing Flawed Definition:** $\frac{\text{Total PTP Events Created}}{\text{Total Calls Answered}}$
* **Flaw:** Incentivizes collectors to extract soft, insincere verbal promises to end difficult phone calls.
* **Proposed Definition:** $\frac{\text{Distinct Accounts with a Formal Payment Commitment}}{\text{Distinct RPC Accounts}}$
* **Appropriateness:** Evaluates true conversion conditional on reaching the actual borrower.

### 4. PTP Kept Rate
* **Existing Flawed Definition:** $\frac{\text{Count of PTPs with status KEPT}}{\text{Total PTP Events Recorded}}$
* **Flaw:** In synthetic and production logs, PTP statuses are often overwritten or left open indefinitely without settlement reconciliation.
* **Proposed Definition:** $\frac{\text{Accounts with settled payment } \ge 80\% \text{ of promised amount within } \pm 3 \text{ days}}{\text{Total Accounts with Matured PTP Date}}$
* **Appropriateness:** Ties verbal promises directly to audited bank ledger settlements within a defined grace window.

### 5. Recovery Rate
* **Existing Flawed Definition:** $\frac{\text{Total Ingested Cash Collections}}{\text{Opening Overdue Balance}}$
* **Flaw:** Includes failed transactions, unverified cheques, and chargeback reversals.
* **Proposed Definition:** $\frac{\text{Net Settled Cash (Gross - Reversals)}}{\text{Total Static Portfolio Book Balance}}$
* **Appropriateness:** Prevents denominator gaming and matches accounting revenue recognition.

### 6. Recovery Per Account
* **Existing Flawed Definition:** $\frac{\text{Total Collections}}{\text{Count of Paying Accounts}}$
* **Flaw:** Measures conditional settlement size (average ticket size) rather than operational recovery efficiency.
* **Proposed Definition:** $\frac{\text{Total Settled Recovery}}{\text{Total Accounts Assigned in Portfolio}}$
* **Appropriateness:** Evaluates expected value per debt account, penalizing portfolios with low collection coverage.

### 7. Recovery Per Agent-Hour
* **Existing Flawed Definition:** $\frac{\text{Collections attributed to Agent}}{\text{Total Shift Hours (Login to Logout)}}$
* **Flaw:** Inaccurate attribution: collectors who work high-balance, low-DPD accounts appear productive while working fewer hours.
* **Proposed Definition:** $\frac{\text{Incremental Cash Recovered above Baseline}}{\text{Active Talk-Time + Wrap-Time Hours}}$
* **Appropriateness:** Normalizes for portfolio difficulty and true engaged operational labor.

### 8. Cost Per Rupee Recovered (Cost-to-Collect)
* **Existing Flawed Definition:** $\frac{\text{Total Operations Budget}}{\text{Total Recovered Cash}}$
* **Flaw:** Distorts channel efficiency: voice call centers incur high wage and trunk costs, whereas digital channels (WhatsApp/SMS) incur marginal API costs.
* **Proposed Channel-Specific Cost Matrix:**
  * Human Voice: **₹18.50 per RPC** (~₹0.12 per ₹ recovered)
  * WhatsApp Business API: **₹0.28 per delivery** (~₹0.003 per ₹ recovered)
  * SMS: **₹0.12 per message** (~₹0.002 per ₹ recovered)
  * Field Visit: **₹450 per visit** (~₹0.35 per ₹ recovered)

### 9. Channel Conversion Rate
* **Existing Flawed Definition:** $\frac{\text{Accounts paying within 7 days of channel message}}{\text{Total messages sent on channel}}$
* **Flaw:** Multi-channel spam: debtors receive SMS, WhatsApp, and voice calls on the same day; naive last-touch credits whichever arrived last.
* **Proposed Definition:** $\frac{\text{Incremental recovery observed in Single-Channel Random Holdout}}{\text{Unique Accounts Reached on Channel}}$
* **Appropriateness:** Isolates true incremental channel elasticity without attribution overlap.

