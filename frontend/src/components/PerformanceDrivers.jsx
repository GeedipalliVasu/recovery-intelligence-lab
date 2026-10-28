import React from 'react';
import { Layers, PieChart as PieIcon, BarChart2, CheckCircle2, SplitSquareVertical } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

export default function PerformanceDrivers({ driversData }) {
  if (!driversData) return null;

  const { 
    by_risk_segment, 
    by_loan_type, 
    by_dpd_bucket, 
    by_payment_method, 
    concentration_deciles,
    mix_shift_decomposition 
  } = driversData;

  const riskChartData = by_risk_segment.map(r => ({
    name: r.segment,
    FebDaily: Math.round(r.feb_daily_rate / 1000),
    MarDaily: Math.round(r.mar_daily_rate / 1000)
  }));

  const loanChartData = by_loan_type.map(l => ({
    name: l.loan_type,
    Feb: Math.round(l.feb_total / 1_000_000),
    Mar: Math.round(l.mar_total / 1_000_000)
  }));

  return (
    <div>
      {/* Mix-Shift & Simpson's Paradox Audit Banner */}
      <div className="section-card" style={{ borderLeft: '4px solid var(--accent-teal)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <SplitSquareVertical size={20} color="var(--accent-teal)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {mix_shift_decomposition.title}
          </h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '850px' }}>
            {mix_shift_decomposition.explanation}
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-muted)', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PRODUCTIVITY EFFECT</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-teal)' }}>
                +{mix_shift_decomposition.within_segment_productivity_effect_pct}%
              </div>
            </div>
            <div style={{ background: 'var(--bg-muted)', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PORTFOLIO MIX EFFECT</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                +{mix_shift_decomposition.portfolio_composition_mix_effect_pct}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Risk Segment & Loan Type */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Risk Segments */}
        <div className="section-card">
          <div className="section-header">
            <div>
              <h3 className="section-title">
                <Layers size={18} color="var(--accent-teal)" />
                <span>Performance by Risk Segment</span>
              </h3>
              <p className="section-subtitle">Daily normalized collections ($k/day) across risk tiers.</p>
            </div>
          </div>

          <div style={{ height: 260, width: '100%', marginBottom: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" label={{ value: '$k/day', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                <Tooltip formatter={(v) => `$${v.toLocaleString()}k/day`} />
                <Legend />
                <Bar dataKey="FebDaily" name="Feb ($k/day)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="MarDaily" name="Mar ($k/day)" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="table-responsive">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Risk Tier</th>
                  <th>Feb Daily</th>
                  <th>Mar Daily</th>
                  <th>Daily Growth</th>
                  <th>Raw Growth</th>
                </tr>
              </thead>
              <tbody>
                {by_risk_segment.map(r => (
                  <tr key={r.segment}>
                    <td style={{ fontWeight: 600 }}>{r.segment}</td>
                    <td className="tabular-nums">${r.feb_daily_rate.toLocaleString(undefined, { maximumFractionDigits: 0 })}/d</td>
                    <td className="tabular-nums">${r.mar_daily_rate.toLocaleString(undefined, { maximumFractionDigits: 0 })}/d</td>
                    <td className="tabular-nums" style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>
                      {r.daily_growth_pct > 0 ? `+${r.daily_growth_pct}%` : `${r.daily_growth_pct}%`}
                    </td>
                    <td className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      +{r.raw_growth_pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Loan Types */}
        <div className="section-card">
          <div className="section-header">
            <div>
              <h3 className="section-title">
                <BarChart2 size={18} color="var(--accent-teal)" />
                <span>Performance by Loan Type</span>
              </h3>
              <p className="section-subtitle">Monthly clean volumes ($M) by product category.</p>
            </div>
          </div>

          <div style={{ height: 260, width: '100%', marginBottom: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loanChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" label={{ value: '$M Total', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                <Tooltip formatter={(v) => `$${v}M`} />
                <Legend />
                <Bar dataKey="Feb" name="Feb Total ($M)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Mar" name="Mar Total ($M)" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="table-responsive">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Feb Total</th>
                  <th>Mar Total</th>
                  <th>Daily Growth</th>
                  <th>Raw Growth</th>
                </tr>
              </thead>
              <tbody>
                {by_loan_type.map(l => (
                  <tr key={l.loan_type}>
                    <td style={{ fontWeight: 600 }}>{l.loan_type}</td>
                    <td className="tabular-nums">${(l.feb_total / 1e6).toFixed(2)}M</td>
                    <td className="tabular-nums">${(l.mar_total / 1e6).toFixed(2)}M</td>
                    <td className="tabular-nums" style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>
                      {l.daily_growth_pct > 0 ? `+${l.daily_growth_pct}%` : `${l.daily_growth_pct}%`}
                    </td>
                    <td className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      +{l.raw_growth_pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grid: DPD Buckets & Recovery Concentration */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        {/* DPD Delinquency Buckets */}
        <div className="section-card">
          <div className="section-header">
            <h3 className="section-title">
              <span>Performance by Delinquency Bucket (DPD)</span>
            </h3>
          </div>
          <div className="table-responsive">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Delinquency Tier</th>
                  <th>Feb Total</th>
                  <th>Mar Total</th>
                  <th>Daily Growth</th>
                  <th>Raw Growth</th>
                </tr>
              </thead>
              <tbody>
                {by_dpd_bucket.map(d => (
                  <tr key={d.dpd_bucket}>
                    <td style={{ fontWeight: 600 }}>{d.dpd_bucket}</td>
                    <td className="tabular-nums">${(d.feb_total / 1e6).toFixed(2)}M</td>
                    <td className="tabular-nums">${(d.mar_total / 1e6).toFixed(2)}M</td>
                    <td className="tabular-nums" style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>
                      {d.daily_growth_pct > 0 ? `+${d.daily_growth_pct}%` : `${d.daily_growth_pct}%`}
                    </td>
                    <td className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      +{d.raw_growth_pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recovery Concentration (Deciles) */}
        <div className="section-card">
          <div className="section-header">
            <div>
              <h3 className="section-title">
                <span>Recovery Concentration (Pareto Deciles)</span>
              </h3>
              <p className="section-subtitle">Evaluating reliance on top payment settlements in March 2026.</p>
            </div>
          </div>
          <div className="table-responsive">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Payment Decile</th>
                  <th>Tx Count</th>
                  <th>Decile Total ($M)</th>
                  <th>Share of Monthly Recovery</th>
                </tr>
              </thead>
              <tbody>
                {concentration_deciles.slice(0, 5).map(dec => (
                  <tr key={dec.decile}>
                    <td style={{ fontWeight: 600 }}>Decile {dec.decile} (Top {dec.decile * 10}%)</td>
                    <td className="tabular-nums">{dec.tx_count.toLocaleString()}</td>
                    <td className="tabular-nums">${(dec.decile_total / 1e6).toFixed(2)}M</td>
                    <td className="tabular-nums" style={{ fontWeight: 600, color: 'var(--accent-teal)' }}>
                      {dec.pct_of_recovery.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            The top 20% of payments account for ~26.4% of recovered dollars, indicating a balanced retail distribution without whale dependency.
          </div>
        </div>
      </div>
    </div>
  );
}
