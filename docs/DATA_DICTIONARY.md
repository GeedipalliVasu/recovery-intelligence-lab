# RELATIONAL DATA DICTIONARY

**Dataset**: Synthetic Collections Analytics Dataset (Seed = 42, 30,000 Accounts)  
**Storage**: Relational DuckDB Database (`data/recovery_intelligence.duckdb`)  

---

## 1. Entity Relationship Overview

* **Core Entities:**
  * `accounts`: Primary grain of lending obligations (30,000 unique records).
  * `borrowers`: Customer demographic records (11,015 unique individuals).
  * `agents`: Collections center personnel (1,000 unique operational collectors).
* **Operational Event Tables:**
  * `payments`: Settlement records (25,500 raw rows -> 25,000 deduplicated records).
  * `calls`: Dialer call attempts and connections (91,350 records).
  * `call_attempts`: Granular telephony attempts (120,000 records).
  * `call_dispositions`: Outcome codes assigned by agents (35,000 records).
  * `whatsapp_events`: Digital messaging events (60,600 records).
  * `sms_events`: Short message notifications (45,000 records).
  * `field_visits`: Physical location collector visits (25,000 records).
  * `promises_to_pay`: Debtor commitments to pay (18,000 records).
  * `campaigns`: Marketing and recovery campaign strategies (120 records).
  * `daily_targeting`: Daily allocation queues for outreach (45,000 records).
  * `complaints`: Borrower dispute and escalation filings (8,000 records).
  * `account_status_history`: Longitudinal status audit trail (60,000 records).

---

## 2. Table Specifications

### accounts (`golden_accounts`)
| Column | Type | Nullable | Description & Analytical Notes |
| :--- | :--- | :--- | :--- |
| `account_id` | VARCHAR | NO | **Primary Key**. Unique account identifier (`ACC0000001` - `ACC0030000`). |
| `borrower_id` | VARCHAR | YES | Foreign key to `borrowers`. 455 records are null; 2,913 point to unlisted borrowers. |
| `loan_type` | VARCHAR | NO | Product category: `BNPL`, `AUTO`, `PERSONAL`, `CREDIT_CARD`, `CONSUMER`. |
| `principal_amount` | DOUBLE | NO | Original loan principal issued (₹10,055 - ₹799,968). |
| `outstanding_amount`| DOUBLE | NO | Overdue balance at observation date (₹1,002 - ₹699,963). |
| `dpd` | INTEGER | NO | Days Past Due (0 to 180 days). Mean: 56.5 days. |
| `risk_segment` | VARCHAR | NO | Credit risk tier: `LOW`, `MEDIUM`, `HIGH`, `NPA`. |
| `status` | VARCHAR | NO | Lifecycle status: `ACTIVE`, `CLOSED`, `PAID`, `WRITEOFF`. |
| `opened_at` | TIMESTAMP | NO | Date loan account was originally originated. |
| `timezone` | VARCHAR | NO | Customer timezone: `UTC`, `Asia/Kolkata`, `Asia/Dubai`. |
| `dpd_bucket` | VARCHAR | NO | Derived analytical bucket: `0: Current`, `1-30: Early`, `31-60: Mid`, `61-90: Late`, `90+: NPA`. |

### payments (`golden_payments`)
| Column | Type | Nullable | Description & Analytical Notes |
| :--- | :--- | :--- | :--- |
| `payment_id` | VARCHAR | NO | **Primary Key**. Unique transaction ID. 500 duplicate ID pairs reconciled. |
| `account_id` | VARCHAR | NO | Foreign key to `accounts`. |
| `borrower_id` | VARCHAR | NO | Foreign key to `borrowers`. |
| `event_at` | TIMESTAMP | NO | Execution timestamp (converted to UTC standard). |
| `payment_reference`| VARCHAR | YES | Gateway settlement reference. 382 missing references imputed. |
| `amount` | DOUBLE | NO | Transaction amount in INR. Mean: ₹75,348. |
| `payment_status` | VARCHAR | NO | Terminal status: `SUCCESS` (17,880), `FAILED` (3,744), `PENDING` (2,592), `REVERSED` (1,284). |
| `payment_method` | VARCHAR | NO | Gateway rail: `UPI`, `NETBANKING`, `CARD`, `NACH`, `CASH`. |
| `is_settled` | BOOLEAN | NO | Derived flag: `TRUE` strictly for `SUCCESS` payments. |

### promises_to_pay (`promises_to_pay`)
| Column | Type | Nullable | Description & Analytical Notes |
| :--- | :--- | :--- | :--- |
| `ptp_id` | VARCHAR | NO | **Primary Key**. Promise commitment ID. |
| `account_id` | VARCHAR | NO | Foreign key to `accounts`. |
| `promised_amount` | DOUBLE | NO | Amount debtor agreed to settle. |
| `promised_date` | TIMESTAMP | NO | Promised settlement date. |
| `status` | VARCHAR | NO | Commitment outcome: `KEPT` (24.9%), `BROKEN` (25.3%), `CANCELLED` (25.2%), `OPEN` (24.5%). |
| `source` | VARCHAR | NO | Channel origin: `CALL`, `FIELD`, `SMS`, `WHATSAPP`. |

### calls (`calls`)
| Column | Type | Nullable | Description & Analytical Notes |
| :--- | :--- | :--- | :--- |
| `call_id` | VARCHAR | NO | **Primary Key**. Telephony call session ID. |
| `call_status` | VARCHAR | NO | Outcome: `ANSWERED` (19.9%), `NO_ANSWER` (20.1%), `BUSY` (20.1%), `FAILED` (20.0%), `VOICEMAIL` (20.0%). |
| `duration_sec` | INTEGER | NO | Call duration in seconds. |
| `direction` | VARCHAR | NO | `OUTBOUND` (92.1%), `INBOUND` (7.9%). |

