import React, { useState } from 'react';
import { ShieldAlert, AlertCircle, Database, CheckCircle, FileText, Filter } from 'lucide-react';

export default function DataQualityLedger({ ledgerData }) {
  const [filterHeadline, setFilterHeadline] = useState(false);

  if (!ledgerData) return null;

  const { total_issues, total_financial_impact, issues } = ledgerData;

  const displayedIssues = filterHeadline 
    ? issues.filter(i => i.changes_headline) 
    : issues;

  return (
    <div>
      {/* Overview Cards */}
      <div className="section-card" style={{ borderLeft: '4px solid var(--danger-red)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <ShieldAlert size={22} color="var(--danger-red)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Data Quality Impact Ledger & Anomaly Audit
              </h2>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '900px' }}>
              The supplied synthetic dataset contains intentional corruptions, broken relational keys, webhook duplications,
              and inverted timestamps. Every anomaly has been audited, quantified for monetary impact, and resolved via
              deterministic reconciliation rules in the golden pipeline.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <div style={{ background: 'var(--bg-muted)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ISSUES IDENTIFIED</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {total_issues}
              </div>
            </div>
            <div style={{ background: 'var(--bg-muted)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL MONETARY IMPACT</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger-red)' }}>
                ${(total_financial_impact / 1e6).toFixed(1)}M
              </div>
            </div>
          </div>
        </div>

        {/* Filter Toggle */}
        <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            className={`btn-trace ${!filterHeadline ? 'active' : ''}`}
            style={{ background: !filterHeadline ? 'var(--accent-teal)' : 'var(--bg-muted)', color: !filterHeadline ? '#fff' : 'var(--text-secondary)' }}
            onClick={() => setFilterHeadline(false)}
          >
            All Documented Issues ({issues.length})
          </button>
          <button 
            className={`btn-trace ${filterHeadline ? 'active' : ''}`}
            style={{ background: filterHeadline ? 'var(--danger-red)' : 'var(--bg-muted)', color: filterHeadline ? '#fff' : 'var(--text-secondary)' }}
            onClick={() => setFilterHeadline(true)}
          >
            Headline-Altering Only ({issues.filter(i => i.changes_headline).length})
          </button>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="section-card">
        <div className="table-responsive">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Issue ID & Category</th>
                <th>Source Table</th>
                <th>Affected Rows</th>
                <th>Monetary Impact</th>
                <th>Alters 11% Claim?</th>
                <th>Reconciliation Treatment</th>
                <th>Operational Limitation</th>
              </tr>
            </thead>
            <tbody>
              {displayedIssues.map(issue => (
                <tr key={issue.issue_id} style={{ background: issue.changes_headline ? '#fffdf7' : 'inherit' }}>
                  <td>
                    <span className="badge" style={{ marginBottom: '0.2rem', display: 'inline-block' }}>
                      {issue.issue_id}
                    </span>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {issue.category}
                    </div>
                  </td>

                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.825rem', background: 'var(--bg-muted)', padding: '0.2rem 0.4rem', borderRadius: 'var(--radius-sm)' }}>
                      {issue.table_name}.csv
                    </span>
                  </td>

                  <td className="tabular-nums" style={{ fontWeight: 600 }}>
                    {issue.affected_rows.toLocaleString()}
                  </td>

                  <td className="tabular-nums" style={{ fontWeight: 600, color: issue.monetary_impact > 0 ? 'var(--danger-red)' : 'var(--text-muted)' }}>
                    {issue.monetary_impact > 0 ? `$${issue.monetary_impact.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'N/A'}
                  </td>

                  <td>
                    {issue.changes_headline ? (
                      <span className="badge-misleading">YES (Critical)</span>
                    ) : (
                      <span className="badge-defensible">NO</span>
                    )}
                  </td>

                  <td style={{ maxWidth: '320px', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{issue.treatment}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Rationale: {issue.rationale}
                    </div>
                  </td>

                  <td style={{ maxWidth: '240px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {issue.limitation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
