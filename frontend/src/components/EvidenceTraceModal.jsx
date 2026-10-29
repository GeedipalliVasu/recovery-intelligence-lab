import React from 'react';
import { X, Code, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

export default function EvidenceTraceModal({ traceData, onClose }) {
  if (!traceData) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="badge">{traceData.metric_id}</span>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.25rem' }}>
              {traceData.metric_name}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Formula & Window */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              Mathematical Formula
            </h4>
            <div style={{ background: 'var(--bg-muted)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
              {traceData.formula}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--bg-muted)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NUMERATOR</div>
              <div style={{ fontWeight: 600 }}>{traceData.numerator?.label}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {typeof traceData.numerator?.value === 'number' 
                  ? (traceData.numerator?.unit === 'INR (₹)' || traceData.numerator?.unit === '₹' 
                      ? `₹${traceData.numerator.value.toLocaleString()}` 
                      : `${traceData.numerator.value.toLocaleString()} ${traceData.numerator.unit || ''}`)
                  : traceData.numerator?.value}
              </div>
            </div>
            <div style={{ background: 'var(--bg-muted)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DENOMINATOR</div>
              <div style={{ fontWeight: 600 }}>{traceData.denominator?.label}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {typeof traceData.denominator?.value === 'number' 
                  ? (traceData.denominator?.unit === 'INR (₹)' || traceData.denominator?.unit === '₹' 
                      ? `₹${traceData.denominator.value.toLocaleString()}` 
                      : `${traceData.denominator.value.toLocaleString()} ${traceData.denominator.unit || ''}`)
                  : traceData.denominator?.value}
              </div>
            </div>
          </div>

          {/* Audit Record Counts */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Audit Record Lineage
            </h4>
            <table className="analytics-table" style={{ background: 'var(--bg-card)' }}>
              <tbody>
                {Object.entries(traceData.audit_counts || {}).map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {k.replace(/_/g, ' ')}
                    </td>
                    <td className="tabular-nums" style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>
                      {typeof v === 'number' ? v.toLocaleString() : String(v)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Data Quality Rules Applied */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Cleaning & Reconciliation Rules
            </h4>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {traceData.data_quality_rules_applied?.map((rule, idx) => (
                <li key={idx} style={{ marginBottom: '0.3rem' }}>{rule}</li>
              ))}
            </ul>
          </div>

          {/* Executable SQL Query */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
              <Code size={16} color="var(--accent-teal)" />
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Executable DuckDB SQL Query
              </h4>
            </div>
            <pre className="code-block">{traceData.sql_query}</pre>
          </div>

          {/* Assumptions & Limitations */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
              <AlertTriangle size={16} color="var(--warning-amber)" />
              <h4 style={{ fontSize: '0.85rem', color: 'var(--warning-amber)', textTransform: 'uppercase' }}>
                Assumptions & Analytical Caveats
              </h4>
            </div>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {traceData.assumptions_and_caveats?.map((a, idx) => (
                <li key={idx} style={{ marginBottom: '0.3rem' }}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
