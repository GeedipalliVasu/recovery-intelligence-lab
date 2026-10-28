import React from 'react';
import { BookOpen, Database, Code, ShieldCheck, AlertCircle, Search } from 'lucide-react';

export default function Methodology({ onOpenTrace }) {
  return (
    <div>
      {/* Architecture & Pipeline Flow */}
      <div className="section-card">
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={20} color="var(--accent-teal)" />
            <h3 className="section-title">End-to-End Forensic Architecture</h3>
          </div>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Data flows deterministically from raw immutable CSV archives to a clean DuckDB golden dataset,
          powering a tested FastAPI analytics engine and a React executive dashboard.
        </p>

        <div style={{ background: '#0f172a', color: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.6', overflowX: 'auto' }}>
          {`[Raw Archives: collections_30k_dataset/] (17 relational CSVs, ~500k rows)
          │
          ▼
[Forensic Ingestion: scripts/pipeline.py]
  ├── Drop exact duplicate rows (486 rows, $37.3M)
  ├── Resolve duplicate payment_id collisions (priority: SUCCESS > earliest event)
  ├── Normalize mixed timezones (UTC, Asia/Kolkata, Asia/Dubai) to UTC standard
  ├── Standardize fragmented disposition codes ('PTP' -> 'PROMISE_TO_PAY')
  └── Log all anomalies to Data Quality Impact Ledger
          │
          ▼
[Golden Analytical Database: data/recovery_intelligence.duckdb]
  ├── golden_payments (Settled, cleaned, linked to account attributes)
  ├── golden_accounts (DPD buckets, borrower linkage flags)
  ├── golden_monthly_metrics (Raw vs Clean vs Daily Run-Rates)
  └── dq_impact_ledger (Machine-readable audit trail)
          │
          ▼
[Analytical Engine & FastAPI Backend: backend/]
  ├── /api/kpi/summary (Executive verdict, Welch's t-test p=0.932, Bootstrap 95% CI)
  ├── /api/metrics/stress-test (8 analytical scenarios side-by-side)
  ├── /api/metrics/evidence-trace (Lineage, audit counts, SQL queries)
  └── /api/strategy/sandbox (Targeting rules + A/B RCT pilot design)
          │
          ▼
[React + Vite + Recharts Frontend: frontend/]`}
        </div>
      </div>

      {/* Metric Definitions & Evidence Trace Links */}
      <div className="section-card">
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color="var(--accent-teal)" />
            <h3 className="section-title">Authoritative Metric Definitions</h3>
          </div>
        </div>

        <div className="table-responsive">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Metric Code</th>
                <th>Formal Name</th>
                <th>Mathematical Formula</th>
                <th>Observation Window</th>
                <th>Trace</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="badge">MTR-CLAIM-01</span></td>
                <td style={{ fontWeight: 600 }}>Management Raw Claim</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.825rem' }}>
                  (Sum(Mar_Raw_Success) - Sum(Feb_Raw_Success)) / Sum(Feb_Raw_Success)
                </td>
                <td>Feb 2026 (28d) vs Mar 2026 (31d)</td>
                <td>
                  <button className="btn-trace" onClick={() => onOpenTrace('claim_11_pct')}>
                    <Search size={12} /> Trace
                  </button>
                </td>
              </tr>
              <tr>
                <td><span className="badge">MTR-RUNRATE-01</span></td>
                <td style={{ fontWeight: 600, color: 'var(--accent-teal)' }}>
                  Daily Recovery Run-Rate (Primary Defensible)
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.825rem' }}>
                  Sum(Clean_Settled_Amount) / Days_In_Calendar_Month
                </td>
                <td>Daily rate: Feb (28d) vs Mar (31d)</td>
                <td>
                  <button className="btn-trace" onClick={() => onOpenTrace('daily_run_rate')}>
                    <Search size={12} /> Trace
                  </button>
                </td>
              </tr>
              <tr>
                <td><span className="badge">MTR-RECOVRATE-01</span></td>
                <td style={{ fontWeight: 600 }}>Portfolio Recovery Rate</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.825rem' }}>
                  Sum(Clean_Settled_Amount) / Sum(Total_Portfolio_Outstanding_Balance)
                </td>
                <td>Active portfolio book ($10.49B)</td>
                <td>
                  <button className="btn-trace" onClick={() => onOpenTrace('portfolio_recovery_rate')}>
                    <Search size={12} /> Trace
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Limitations & Caveats */}
      <div className="section-card">
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} color="var(--warning-amber)" />
            <h3 className="section-title">Documented Limitations & Assumptions</h3>
          </div>
        </div>
        <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Calendar Exogeneity:</strong> Collections call centers and automated SMS/WhatsApp gateways run continuously across weekends. Normalizing by total days in the month (28 vs 31) is the standard treasury accounting convention.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Unobserved Self-Cure:</strong> The dataset does not contain an uncontacted random control holdout. As a result, we cannot identify what fraction of paying accounts would have paid organically without outreach.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Orphan Key Preservation:</strong> 455 accounts lack borrower identifiers, and 2,913 accounts reference borrower IDs not in the borrowers table. These balances were retained in the portfolio denominator to prevent artificial recovery rate inflation.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Timezone Boundary Effects:</strong> Timestamp strings were ingested with UTC offsets. Transactions occurring within 5.5 hours of midnight on month boundaries shift between months depending on regional perspective.
          </li>
        </ul>
      </div>
    </div>
  );
}
