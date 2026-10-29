import React, { useState } from 'react';
import { 
  BookOpen, 
  Database, 
  Code, 
  ShieldCheck, 
  AlertCircle, 
  Search, 
  ArrowDown, 
  Server, 
  Cpu, 
  Layers, 
  FileSpreadsheet, 
  CheckCircle2, 
  Sliders 
} from 'lucide-react';

export default function Methodology({ onOpenTrace }) {
  const [viewMode, setViewMode] = useState('diagram'); // 'diagram' | 'spec'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Architecture & Pipeline Flow */}
      <div className="section-card">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={20} color="var(--accent-teal)" />
            <h3 className="section-title">End-to-End System Architecture</h3>
          </div>

          <div style={{ display: 'flex', background: 'var(--bg-muted)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <button 
              onClick={() => setViewMode('diagram')}
              style={{
                padding: '4px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'diagram' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'diagram' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'diagram' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              Interactive Diagram
            </button>
            <button 
              onClick={() => setViewMode('spec')}
              style={{
                padding: '4px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'spec' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'spec' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'spec' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              Pipeline Specification
            </button>
          </div>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Data moves deterministically through a 5-stage pipeline from raw immutable archives to an audited DuckDB golden store, cached FastAPI analytical REST endpoints, and an executive decision interface.
        </p>

        {viewMode === 'diagram' ? (
          /* VISUAL ARCHITECTURE DIAGRAM */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', width: '100%' }}>
            
            {/* STAGE 1 */}
            <div style={{ 
              width: '100%', 
              background: '#ffffff', 
              border: '1px solid var(--border-subtle)', 
              borderLeft: '4px solid #64748b', 
              borderRadius: 'var(--radius-md)', 
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>STAGE 01</span>
                  <FileSpreadsheet size={18} color="#64748b" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Raw Ingestion Layer (Immutable)</h4>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>collections_30k_dataset/</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                17 relational CSV tables containing ~500,000 raw operational events. Stored as immutable ground-truth sources.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['payments.csv (25.5k rows)', 'calls.csv (91.3k rows)', 'accounts.csv (30.0k rows)', 'borrowers.csv (30.6k rows)', 'agent_interactions', 'promises_to_pay'].map((tag, i) => (
                  <span key={i} style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* CONNECTOR 1 -> 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0.1rem 0' }}>
              <div style={{ height: '14px', width: '2px', background: 'var(--border-medium)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '2px 10px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <span>Forensic Ingestion & Validation</span>
                <ArrowDown size={12} color="var(--accent-teal)" />
              </div>
              <div style={{ height: '14px', width: '2px', background: 'var(--border-medium)' }}></div>
            </div>

            {/* STAGE 2 */}
            <div style={{ 
              width: '100%', 
              background: '#ffffff', 
              border: '1px solid var(--border-subtle)', 
              borderLeft: '4px solid var(--accent-teal)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ background: 'var(--accent-teal-light)', color: 'var(--accent-teal)', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>STAGE 02</span>
                  <ShieldCheck size={18} color="var(--accent-teal)" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Forensic ETL & Data Quality Engine</h4>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-teal)', fontFamily: 'monospace' }}>scripts/pipeline.py</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                <div style={{ background: 'var(--bg-muted)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Deduplication Engine</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Scrubbed 486 exact byte-duplicates (₹3.73 Cr) & 14 PK collisions (500 total rows, ₹3.84 Cr).</div>
                </div>
                <div style={{ background: 'var(--bg-muted)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Timestamp Normalization</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Parsed mixed timezone offsets (+05:30, +04:00, UTC) into standardized UTC timestamps.</div>
                </div>
                <div style={{ background: 'var(--bg-muted)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Relational Reconciliation</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Preserved 2,913 orphan borrower links to prevent denominator manipulation.</div>
                </div>
                <div style={{ background: 'var(--bg-muted)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Data Quality Impact Ledger</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Logged 10 cataloged anomalies (₹61.42 Cr monetary impact) into machine-readable ledger.</div>
                </div>
              </div>
            </div>

            {/* CONNECTOR 2 -> 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0.1rem 0' }}>
              <div style={{ height: '14px', width: '2px', background: 'var(--border-medium)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '2px 10px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <span>Vectorized Columnar Storage</span>
                <ArrowDown size={12} color="var(--accent-teal)" />
              </div>
              <div style={{ height: '14px', width: '2px', background: 'var(--border-medium)' }}></div>
            </div>

            {/* STAGE 3 */}
            <div style={{ 
              width: '100%', 
              background: '#ffffff', 
              border: '1px solid var(--border-subtle)', 
              borderLeft: '4px solid #eab308', 
              borderRadius: 'var(--radius-md)', 
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ background: '#fef9c3', color: '#854d0e', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>STAGE 03</span>
                  <Database size={18} color="#ca8a04" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Golden Analytical Layer (DuckDB)</h4>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#ca8a04', fontFamily: 'monospace' }}>data/recovery_intelligence.duckdb</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                In-process ACID-compliant columnar database enabling sub-millisecond aggregations without running external database services.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.5rem 0.75rem', background: 'var(--bg-muted)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>golden_payments</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>25,000 clean rows (17,880 settled SUCCESS)</span>
                </div>
                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.5rem 0.75rem', background: 'var(--bg-muted)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>golden_accounts</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>30,000 portfolio book with DPD and balance</span>
                </div>
                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.5rem 0.75rem', background: 'var(--bg-muted)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>golden_monthly_metrics</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Calendar-normalized timeline & daily run-rates</span>
                </div>
                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.5rem 0.75rem', background: 'var(--bg-muted)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>dq_impact_ledger</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Machine-readable log of 10 audited issues</span>
                </div>
              </div>
            </div>

            {/* CONNECTOR 3 -> 4 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0.1rem 0' }}>
              <div style={{ height: '14px', width: '2px', background: 'var(--border-medium)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '2px 10px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <span>Thread-Safe Connection Proxy & LRU Cache</span>
                <ArrowDown size={12} color="var(--accent-teal)" />
              </div>
              <div style={{ height: '14px', width: '2px', background: 'var(--border-medium)' }}></div>
            </div>

            {/* STAGE 4 */}
            <div style={{ 
              width: '100%', 
              background: '#ffffff', 
              border: '1px solid var(--border-subtle)', 
              borderLeft: '4px solid #3b82f6', 
              borderRadius: 'var(--radius-md)', 
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>STAGE 04</span>
                  <Server size={18} color="#2563eb" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Analytical Engine & REST API</h4>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#2563eb', fontFamily: 'monospace' }}>FastAPI + SciPy (backend/)</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Type-safe asynchronous endpoints with in-memory query serialization and statistical testing:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {[
                  { ep: '/api/kpi/summary', desc: "Welch t-test p=0.932" },
                  { ep: '/api/metrics/stress-test', desc: "8 Scenarios Matrix" },
                  { ep: '/api/performance/drivers', desc: "Kitagawa Mix Decomposition" },
                  { ep: '/api/strategy/sandbox', desc: "A/B RCT Pilot Protocol" },
                  { ep: '/api/metrics/evidence-trace', desc: "SQL Lineage & Audit Trail" }
                ].map((item, i) => (
                  <div key={i} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem' }}>
                    <code style={{ fontWeight: 700, color: '#1e40af' }}>{item.ep}</code>
                    <span style={{ color: '#64748b', marginLeft: '6px' }}>({item.desc})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CONNECTOR 4 -> 5 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0.1rem 0' }}>
              <div style={{ height: '14px', width: '2px', background: 'var(--border-medium)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '2px 10px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <span>Hydration & Single-Screen UI Mounting</span>
                <ArrowDown size={12} color="var(--accent-teal)" />
              </div>
              <div style={{ height: '14px', width: '2px', background: 'var(--border-medium)' }}></div>
            </div>

            {/* STAGE 5 */}
            <div style={{ 
              width: '100%', 
              background: '#ffffff', 
              border: '1px solid var(--border-subtle)', 
              borderLeft: '4px solid #10b981', 
              borderRadius: 'var(--radius-md)', 
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>STAGE 05</span>
                  <Sliders size={18} color="#059669" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Executive Presentation Layer</h4>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#059669', fontFamily: 'monospace' }}>React 18 + Recharts (frontend/)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
                <div style={{ background: 'var(--bg-muted)', padding: '0.6rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>Executive Overview</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>KPI cards with calendar distortion indicator</div>
                </div>
                <div style={{ background: 'var(--bg-muted)', padding: '0.6rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>Claim Stress Test</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>8 defensible vs misleading scenarios</div>
                </div>
                <div style={{ background: 'var(--bg-muted)', padding: '0.6rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>Performance Drivers</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Kitagawa mix-shift & attribution audits</div>
                </div>
                <div style={{ background: 'var(--bg-muted)', padding: '0.6rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>Strategy Sandbox</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Dynamic capacity targeting & ₹10 Cr ROI</div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* PIPELINE SPECIFICATION VIEW */
          <div style={{ background: '#0f172a', color: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '0.825rem', lineHeight: '1.6', overflowX: 'auto' }}>
            {`[Raw Archives: collections_30k_dataset/] (17 relational CSVs, ~500k rows)
          │
          ▼
[Forensic Ingestion: scripts/pipeline.py]
  ├── Drop duplicate rows (486 exact + 14 PK collisions = 500 rows, ₹3.84 Cr)
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
[React 18 + Vite + Recharts Frontend: frontend/dist mounted at /]`}
          </div>
        )}
      </div>

      {/* Metric Definitions & Evidence Trace Links */}
      <div className="section-card">
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color="var(--accent-teal)" />
            <h3 className="section-title">Standardized Metric Definitions</h3>
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
                <td>Active portfolio book (₹1,048.90 Cr)</td>
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

      {/* Limitations & Assumptions */}
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
