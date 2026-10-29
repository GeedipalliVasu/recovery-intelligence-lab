import React from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  Users, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  FileSpreadsheet 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  CartesianGrid 
} from 'recharts';

export default function ExecutiveOverview({ data, onOpenTrace }) {
  if (!data) return null;

  const { verdict, kpis, key_findings, timeline } = data;

  // Format monthly timeline for chart (in Cr and Lakhs/day)
  const chartData = timeline.map(item => ({
    month: item.year_month,
    rawTotal: Math.round((item.raw_success_amount / 1e7) * 100) / 100,
    cleanTotal: Math.round((item.clean_success_amount / 1e7) * 100) / 100,
    dailyRate: Math.round((item.daily_run_rate_clean / 1e5) * 100) / 100,
    payingAccounts: item.clean_paying_accounts,
    days: item.days_in_period
  }));

  return (
    <div>
      {/* Executive Verdict Banner */}
      <div className="verdict-banner unsupported">
        <div className="verdict-header">
          <div className="verdict-title">
            <AlertTriangle size={20} color="var(--warning-amber)" />
            <span>EXECUTIVE VERDICT: {verdict.headline_title}</span>
          </div>
          <span className="verdict-pill">UNSUPPORTED / CALENDAR ARTIFACT</span>
        </div>
        <p className="verdict-desc">{verdict.summary}</p>
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            className="btn-trace" 
            onClick={() => onOpenTrace('claim_11_pct')}
            id="btn-trace-headline"
          >
            <Search size={14} />
            <span>Audit Evidence Trace (11% Claim)</span>
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Confidence: {verdict.confidence_level} | Welch's t-test p = {kpis.statistical_audit.p_value}
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">
            <span>Management Raw Claim</span>
            <AlertTriangle size={14} color="var(--warning-amber)" />
          </div>
          <div className="kpi-value-row">
            <div className="kpi-value">+{kpis.management_raw_growth_pct}%</div>
            <span className="kpi-delta warning">Artifact</span>
          </div>
          <div className="kpi-subtext">
            Feb: ₹{(kpis.feb_2026.raw_success_amt / 1e7).toFixed(2)} Cr → Mar: ₹{(kpis.mar_2026.raw_success_amt / 1e7).toFixed(2)} Cr (Unadjusted)
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--accent-teal)' }}>
          <div className="kpi-label">
            <span>True Daily Recovery Rate</span>
            <CheckCircle2 size={14} color="var(--accent-teal)" />
          </div>
          <div className="kpi-value-row">
            <div className="kpi-value" style={{ color: 'var(--accent-teal)' }}>
              +{kpis.calendar_normalized_growth_pct}%
            </div>
            <span className="kpi-delta neutral">Flat</span>
          </div>
          <div className="kpi-subtext">
            Feb: ₹{(kpis.feb_2026.daily_run_rate / 1e5).toFixed(2)}L/day → Mar: ₹{(kpis.mar_2026.daily_run_rate / 1e5).toFixed(2)}L/day
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Calendar Day Baseline</span>
            <Calendar size={14} color="var(--text-secondary)" />
          </div>
          <div className="kpi-value-row">
            <div className="kpi-value">+10.71%</div>
            <span className="kpi-delta neutral">Exogenous</span>
          </div>
          <div className="kpi-subtext">
            March (31 days) vs February (28 days) = +3 extra operational days
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Paying Account Penetration</span>
            <Users size={14} color="var(--text-secondary)" />
          </div>
          <div className="kpi-value-row">
            <div className="kpi-value">+0.55%</div>
            <span className="kpi-delta neutral">Daily</span>
          </div>
          <div className="kpi-subtext">
            Feb: {(kpis.feb_2026.paying_accounts / 28).toFixed(1)} accts/day → Mar: {(kpis.mar_2026.paying_accounts / 31).toFixed(1)} accts/day
          </div>
        </div>
      </div>

      {/* Comparison & Evidence Table */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <h3 className="section-title">
              <FileSpreadsheet size={18} color="var(--accent-teal)" />
              <span>February vs March 2026: The Anatomy of the 11% Claim</span>
            </h3>
            <p className="section-subtitle">
              Decomposing the headline number into operational duration, duplicate removal, and daily run rates.
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Analytical Dimension</th>
                <th>February 2026 (28 Days)</th>
                <th>March 2026 (31 Days)</th>
                <th>MoM Change</th>
                <th>Operational Reality</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Raw Success Rupee Volume</td>
                <td className="tabular-nums">₹{kpis.feb_2026.raw_success_amt.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td className="tabular-nums">₹{kpis.mar_2026.raw_success_amt.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td className="tabular-nums" style={{ fontWeight: 700, color: 'var(--warning-amber)' }}>
                  +{kpis.management_raw_growth_pct}%
                </td>
                <td><span className="badge-misleading">Conflates Days</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Clean Settled Recovery (Deduped)</td>
                <td className="tabular-nums">₹{kpis.feb_2026.clean_success_amt.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td className="tabular-nums">₹{kpis.mar_2026.clean_success_amt.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td className="tabular-nums" style={{ fontWeight: 700 }}>
                  +{kpis.clean_growth_pct}%
                </td>
                <td><span className="badge-misleading">Still Unnormalized</span></td>
              </tr>
              <tr style={{ background: 'var(--accent-teal-light)' }}>
                <td style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>
                  Normalized Daily Run-Rate (₹/day)
                </td>
                <td className="tabular-nums" style={{ fontWeight: 600 }}>
                  ₹{kpis.feb_2026.daily_run_rate.toLocaleString(undefined, { maximumFractionDigits: 0 })}/day
                </td>
                <td className="tabular-nums" style={{ fontWeight: 600 }}>
                  ₹{kpis.mar_2026.daily_run_rate.toLocaleString(undefined, { maximumFractionDigits: 0 })}/day
                </td>
                <td className="tabular-nums" style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>
                  +{kpis.calendar_normalized_growth_pct}%
                </td>
                <td><span className="badge-defensible">Defensible (p = 0.932)</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Distinct Paying Accounts</td>
                <td className="tabular-nums">{kpis.feb_2026.paying_accounts.toLocaleString()} (77.6/day)</td>
                <td className="tabular-nums">{kpis.mar_2026.paying_accounts.toLocaleString()} (78.0/day)</td>
                <td className="tabular-nums">
                  +11.3% raw (+0.55% daily)
                </td>
                <td><span className="badge-defensible">Identical Intensity</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Portfolio Recovery Rate</td>
                <td className="tabular-nums">{kpis.feb_2026.recovery_rate_pct}%</td>
                <td className="tabular-nums">{kpis.mar_2026.recovery_rate_pct}%</td>
                <td className="tabular-nums">
                  +0.179 pp (+11.0% rel)
                </td>
                <td><span className="badge-defensible">Rate Growth is Calendar-Bound</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Timeline Chart */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <h3 className="section-title">
              <TrendingUp size={18} color="var(--accent-teal)" />
              <span>Historical Recovery Run-Rate Trend (Jan - Jul 2026)</span>
            </h3>
            <p className="section-subtitle">
              Comparing raw monthly volume (bars, in ₹ Cr) against the normalized daily collection rate (line, in ₹ L/day).
            </p>
          </div>
          <button className="btn-trace" onClick={() => onOpenTrace('daily_run_rate')}>
            <Search size={14} />
            <span>Trace Daily Run-Rate Formula</span>
          </button>
        </div>

        <div style={{ height: 320, width: '100%', marginTop: '1rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis yAxisId="left" stroke="#64748b" label={{ value: 'Monthly Total (₹ Cr)', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
              <YAxis yAxisId="right" orientation="right" domain={[50, 70]} stroke="#0f766e" label={{ value: 'Daily Run Rate (₹ L/day)', angle: 90, position: 'insideRight', fill: '#0f766e' }} />
              <Tooltip 
                formatter={(val, name) => [
                  name === 'dailyRate' ? `₹${val} L/day` : `₹${val} Cr`, 
                  name === 'cleanTotal' ? 'Clean Monthly Total' : 'Daily Run Rate'
                ]}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar yAxisId="left" dataKey="cleanTotal" fill="#cbd5e1" name="Clean Monthly Total (₹ Cr)" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="dailyRate" stroke="#0f766e" strokeWidth={3} dot={{ r: 5 }} name="Daily Run Rate (₹ L/day)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5 Verified Key Findings */}
      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">
            <CheckCircle2 size={18} color="var(--accent-teal)" />
            <span>Verified Analytical Findings</span>
          </h3>
        </div>
        <div className="findings-list">
          {key_findings.map(kf => (
            <div key={kf.id} className="finding-item">
              <span className="finding-id">{kf.id}</span>
              <div className="finding-content">
                <h4>{kf.title}</h4>
                <p>{kf.finding}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
