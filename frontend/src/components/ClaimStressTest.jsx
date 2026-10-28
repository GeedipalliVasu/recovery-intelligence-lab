import React, { useState } from 'react';
import { Sliders, CheckCircle2, AlertTriangle, XCircle, Search, HelpCircle } from 'lucide-react';

export default function ClaimStressTest({ stressTestData, onOpenTrace }) {
  const [filterType, setFilterType] = useState('ALL'); // ALL, DEFENSIBLE, MISLEADING

  if (!stressTestData) return null;

  const { benchmark_claim, scenarios } = stressTestData;

  const filteredScenarios = scenarios.filter(s => {
    if (filterType === 'DEFENSIBLE') return s.is_defensible;
    if (filterType === 'MISLEADING') return !s.is_defensible;
    return true;
  });

  return (
    <div>
      {/* Header Banner */}
      <div className="section-card" style={{ borderLeft: '4px solid var(--accent-teal)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Sliders size={20} color="var(--accent-teal)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Claim Stress Test: Sensitivity Across 8 Analytical Scenarios
              </h2>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '900px' }}>
              Management claims an 11% improvement based on a single naive calculation. This stress test subjects
              the claim to alternative defensible definitions, outlier trimming, deduplication, and mix-adjustments
              using actual transaction records.
            </p>
          </div>
          <div style={{ textAlign: 'right', background: 'var(--bg-muted)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MANAGEMENT CLAIM</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning-amber)' }}>
              +{benchmark_claim.claimed_growth_pct}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Primary Defensible: <strong style={{ color: 'var(--accent-teal)' }}>+{benchmark_claim.primary_defensible_growth_pct}%</strong>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn-trace ${filterType === 'ALL' ? 'active' : ''}`}
            style={{ background: filterType === 'ALL' ? 'var(--accent-teal)' : 'var(--bg-muted)', color: filterType === 'ALL' ? '#fff' : 'var(--text-secondary)' }}
            onClick={() => setFilterType('ALL')}
          >
            All Scenarios ({scenarios.length})
          </button>
          <button 
            className={`btn-trace ${filterType === 'DEFENSIBLE' ? 'active' : ''}`}
            style={{ background: filterType === 'DEFENSIBLE' ? 'var(--accent-teal)' : 'var(--bg-muted)', color: filterType === 'DEFENSIBLE' ? '#fff' : 'var(--text-secondary)' }}
            onClick={() => setFilterType('DEFENSIBLE')}
          >
            Defensible Only ({scenarios.filter(s => s.is_defensible).length})
          </button>
          <button 
            className={`btn-trace ${filterType === 'MISLEADING' ? 'active' : ''}`}
            style={{ background: filterType === 'MISLEADING' ? 'var(--accent-teal)' : 'var(--bg-muted)', color: filterType === 'MISLEADING' ? '#fff' : 'var(--text-secondary)' }}
            onClick={() => setFilterType('MISLEADING')}
          >
            Misleading / Unnormalized ({scenarios.filter(s => !s.is_defensible).length})
          </button>
        </div>
      </div>

      {/* Scenarios Comparison Table */}
      <div className="section-card">
        <div className="table-responsive">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Scenario & Analytical Formula</th>
                <th>Feb 2026</th>
                <th>Mar 2026</th>
                <th>Result</th>
                <th>Variance vs Claim</th>
                <th>Verdict & Status</th>
                <th>Trace</th>
              </tr>
            </thead>
            <tbody>
              {filteredScenarios.map(s => {
                const isPrimary = s.scenario_id === 'SCN-03';
                const isClaim = s.scenario_id === 'SCN-01';

                return (
                  <tr key={s.scenario_id} style={{ background: isPrimary ? 'var(--accent-teal-light)' : (isClaim ? '#fffdf5' : 'inherit') }}>
                    <td style={{ maxWidth: '340px' }}>
                      <div style={{ fontWeight: 600, color: isPrimary ? 'var(--accent-teal)' : 'var(--text-primary)' }}>
                        {s.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {s.definition}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem', fontStyle: 'italic' }}>
                        Window: {s.observation_window}
                      </div>
                    </td>

                    <td className="tabular-nums" style={{ whiteSpace: 'nowrap' }}>
                      {typeof s.feb_value === 'number' && s.feb_value > 1000 
                        ? `$${s.feb_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}` 
                        : `${s.feb_value} ${s.unit}`}
                    </td>

                    <td className="tabular-nums" style={{ whiteSpace: 'nowrap' }}>
                      {typeof s.mar_value === 'number' && s.mar_value > 1000 
                        ? `$${s.mar_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}` 
                        : `${s.mar_value} ${s.unit}`}
                    </td>

                    <td className="tabular-nums" style={{ fontWeight: 700, fontSize: '0.95rem', color: isPrimary ? 'var(--accent-teal)' : (s.relative_change_pct > 5 ? 'var(--warning-amber)' : 'inherit') }}>
                      {s.relative_change_pct > 0 ? `+${s.relative_change_pct}%` : `${s.relative_change_pct}%`}
                    </td>

                    <td className="tabular-nums" style={{ color: s.difference_from_claim_pp < 0 ? 'var(--text-secondary)' : 'var(--warning-amber)' }}>
                      {s.difference_from_claim_pp === 0 ? 'Baseline (0.0 pp)' : `${s.difference_from_claim_pp > 0 ? '+' : ''}${s.difference_from_claim_pp.toFixed(2)} pp`}
                    </td>

                    <td>
                      {s.is_defensible ? (
                        <span className="badge-defensible">DEFENSIBLE</span>
                      ) : (
                        <span className="badge-misleading">MISLEADING</span>
                      )}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {s.verdict}
                      </div>
                    </td>

                    <td>
                      <button 
                        className="btn-trace" 
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => onOpenTrace(isPrimary ? 'daily_run_rate' : 'claim_11_pct')}
                      >
                        <Search size={12} />
                        Audit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Limitations and Assumptions Ledger */}
      <div className="section-card">
        <h3 className="section-title">
          <HelpCircle size={18} color="var(--accent-teal)" />
          <span>Analytical Assumptions & Limitations Across Stress Scenarios</span>
        </h3>
        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
              Why Calendar Normalization is Required
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              In operational finance, comparing unadjusted 28-day months to 31-day months introduces an unavoidable 10.71% 
              duration distortion. Any dialer or collections center operating 7 days a week generates 3 extra days of revenue 
              irrespective of collector performance.
            </p>
          </div>

          <div style={{ background: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
              Duplicate Payment Webhook Inflation
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              The raw source data contains 486 duplicate rows worth $37.3M. In production, payment gateways often send 
              redundant webhook retries or ledger sync duplicates that must be resolved using deterministic primary key ordering.
            </p>
          </div>

          <div style={{ background: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
              Outlier Trimming (Whale Payments)
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Trimming the top 1% largest payments (exceeding $148,000) does not change the result: daily growth remains +0.27%, 
              confirming that the flat performance was systemic across all account sizes rather than skewed by a few enterprise settlements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
