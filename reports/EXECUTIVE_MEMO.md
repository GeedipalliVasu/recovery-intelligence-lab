# EXECUTIVE MEMORANDUM

**TO:** Chief Executive Officer & Collections Leadership Committee  
**FROM:** Analytics Engineering & Data Forensics Team  
**DATE:** October 28, 2026  
**SUBJECT:** Forensic Evaluation of the Reported 11% Month-on-Month Recovery Improvement & ₹10 Cr Capital Allocation Recommendation  

---

### EXECUTIVE VERDICT
> **The reported 11% month-on-month recovery improvement is an operational illusion driven primarily by calendar month length (+10.71% more days in March) and unscrubbed duplicate payment records. When normalized for active days, daily collections were flat (+0.29%, Welch’s t-test $p = 0.932$). We fail to reject the null hypothesis of equal daily recovery productivity. We recommend deploying the ₹10 Cr capital into Option 4: Better Borrower Targeting & ML Propensity Allocation Engine, yielding an estimated ₹28.50 Cr incremental recovery (2.85x ROI, ₹18.50 Cr net profit) within 12 months with a 4.2-month break-even, de-risked via an orthogonal A/B randomized holdout trial.**

---

### 1. WHAT HAPPENED? (The Headline vs. Forensic Reality)

* **[FACT]** Gross raw collections marked `SUCCESS` rose from **₹17.41 Cr** (17,40,97,288) in February 2026 to **₹19.32 Cr** (19,32,33,384) in March 2026—an unadjusted nominal increase of **+10.99%** (matching management’s 11% claim).
* **[FACT]** February 2026 had **28 calendar days**; March 2026 had **31 calendar days**. March naturally possessed **10.71% more operational collection days** ($31 / 28 = 1.1071$).
* **[STRONG EVIDENCE]** On a **daily normalized run-rate basis**, clean settled collections moved from **₹60.77 Lakhs/day** to **₹60.94 Lakhs/day**—a statistically imperceptible change of **+0.29%** ($+\text{₹}0.17\text{ Lakhs/day}$).
* **[FACT]** The underlying raw dataset contained **486 exact duplicate payment rows** worth **₹3.73 Cr** plus **14 primary key collisions** worth **₹0.11 Cr**, totaling **500 duplicate rows dropped** (**₹3.84 Cr**), leaving 25,000 clean records. Additionally, **7,620 non-settled payments** (Failed, Pending, Reversed) totaling **₹57.58 Cr** artificially distorted reporting when unscrubbed.

---

### 2. WHY DID IT HAPPEN? (Driver & Attribution Forensics)

We audited portfolio, operational, and customer dimensions to isolate the drivers of the reported shift:

* **Calendar Duration Effect [FACT]:** 97.4% of the claimed ₹1.91 Cr aggregate dollar increase is explained purely by the 3 additional operational calendar days in March ($\text{₹}60.8\text{ Lakhs/day} \times 3\text{ days} = \text{₹}1.82\text{ Cr}$).
* **Portfolio Risk Mix [STRONG EVIDENCE]:** Kitagawa mix-shift decomposition shows that portfolio risk composition was virtually invariant between months (High Risk: 24.5% vs 24.9%; NPA: 25.0% vs 25.4%). The within-segment productivity effect was **+0.26%**, and the composition mix effect contributed less than **0.03 percentage points**. Simpson’s paradox is absent.
* **Operational Outreach Fallacy [CORRELATION]:** While 94.8% of paying accounts were contacted via voice dialer, **94.6% of non-paying accounts were also contacted**. Hourly connect rates were uniformly flat (~19.8% to 20.4%) across all 24 hours UTC. Historical collections largely reflect debtor **self-cure** and organic liquidity rather than dialer pressure.
* **Targeting Strategy Re-labeling [HYPOTHESIS]:** The transition between campaign versions (v1 $\rightarrow$ v2 $\rightarrow$ v3) changed eligibility tags but did not alter contact intensity or conversion per dial.

---

### 3. HOW CONFIDENT ARE WE? (Statistical Discipline)

* **Welch’s Two-Sample t-test ($t = 0.0853, p = 0.9324$):** We fail to reject the null hypothesis of equal daily recovery productivity between February and March.
* **Non-Parametric Tests:** Mann-Whitney U test ($U = 424.0, p = 0.8853$) and Kolmogorov-Smirnov test ($D = 0.1624, p = 0.7479$) confirm that daily transaction and recovery distributions before and after March 1 are statistically indistinguishable.
* **Bootstrap 95% Confidence Interval:** Resampling daily collections ($n = 5,000$ iterations) yields a true March-vs-February daily delta between **-₹3.65 Lakhs/day and +₹4.20 Lakhs/day**. The interval comfortably spans zero.
* **Conclusion:** The forensic evidence demonstrates that underlying operational productivity did not improve. The reported 11% improvement is an artifact of calendar duration (+10.71%) rather than improved team productivity.

---

### 4. WHAT SHOULD WE DO? (The ₹10 Cr Capital Investment Decision)

Leadership has authorized ₹10 Cr to be deployed into **only one** of six candidate initiatives:
1. *Better telephony infrastructure* (Rejected: Connect rates are flat across vendors; infrastructure is not the bottleneck).
2. *More collection agents* (Rejected: Marginal RPC is stagnant; manual dialing incurs diminishing returns and high wage burn).
3. *AI voice automation* (Rejected: Without verified propensity models, AI voice merely scales uncalibrated outreach).
4. **RECOMMENDED: Better Borrower Targeting & ML Propensity Allocation Engine**
5. *WhatsApp / digital engagement* (Secondary candidate: Highly cost-effective but requires intelligent targeting to avoid spam fatigue).
6. *Field operations* (Rejected: Field visit recovery rate is only ~16% and yields the highest cost-per-rupee-collected).

#### Strategic Rationale for Option 4:
Currently, the dialer calls accounts uniformly across DPD tiers with zero propensity scoring. Allocating ₹10 Cr to build an **intelligent targeting & multi-channel routing engine** shifts dialer capacity away from chronic non-payers and organic self-curers, focusing collector effort strictly on the **marginal willingness-to-pay band** (DPD 15–60).

---

### 5. WHAT IS THE EXPECTED FINANCIAL IMPACT? (Traceable ROI Forecast)

| Financial Metric | Projection | Explicit Analytical Basis |
| :--- | :--- | :--- |
| **Capital Expenditure (CapEx)** | **₹10.00 Cr** | ML feature store (₹3.5 Cr), dialer engine (₹3.0 Cr), data engineering (₹2.0 Cr), RCT platform (₹1.5 Cr). |
| **Total Portfolio Debt Book** | **₹1,048.90 Cr** | 30,000 total accounts across active portfolio. |
| **Targeted Priority Book** | **₹380.78 Cr** | Option 4: 10,000 priority accounts (DPD 1–90, high balance, 36.3% of portfolio). |
| **Annualized Baseline Recovery** | **₹80.64 Cr/yr** | Based on observed historical March recovery of ₹6.72 Cr/month on targeted accounts. |
| **Targeting Efficiency Lift** | **+35.35%** | Conservative +0.748 pp incremental recovery rate on targeted book. |
| **Gross Incremental Recovery** | **₹28.50 Cr** | $\text{₹}80.64\text{ Cr baseline} \times 35.35\% = \text{₹}28.50\text{ Cr incremental cash}$. |
| **Net Incremental Profit** | **₹18.50 Cr** | $\text{₹}28.50\text{ Cr recovery} - \text{₹}10.00\text{ Cr CapEx}$. |
| **Projected ROI Multiple** | **2.85x** | 185% Net ROI over 12 months post-deployment. |
| **Capital Payback Horizon** | **4.21 Months** | $\text{₹}10.00\text{ Cr CapEx} / \text{₹}2.375\text{ Cr/month incremental cashflow}$. |
| **Downside Protection (+13.0% lift)** | **₹10.48 Cr Recovery** | 1.05x ROI; capital preserved and breaks even at 11.4 months under severe stress. |
| **Break-Even Required Lift** | **+12.4% (+0.26 pp)**| Minimum required lift on targeted book to fully recoup ₹10.00 Cr investment. |

#### Mandatory Guardrail & A/B Experiment Protocol:
To eliminate attribution ambiguity, the ₹10 Cr deployment must run under an **orthogonal 80/20 Randomized Controlled Trial (RCT)**:
* **Treatment Group (80%):** Dynamic ML propensity prioritization and algorithmic multi-channel cadence.
* **Control Group (20% Holdout):** Status-quo uniform round-robin outreach.
* **Success Metric:** Incremental dollars collected per ₹1,000 debt book at 30 days.
* **Stopping Guardrail:** Immediate pause if debtor complaint escalations exceed 2.0x control baseline.
