import React, { useState, useEffect } from 'react';
import { Target, AlertTriangle, Play, RefreshCw, FlaskConical, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function StrategySandbox() {
  const [priorityRule, setPriorityRule] = useState('HIGH_BALANCE_EARLY_DPD');
  const [capacity, setCapacity] = useState(10000);
  const [minDpd, setMinDpd] = useState(1);
  const [maxDpd, setMaxDpd] = useState(90);
  
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiBase = window.location.port === '8000' ? '' : 'http://127.0.0.1:8000';
      const res = await fetch(
        `${apiBase}/api/strategy/sandbox?priority_rule=${priorityRule}&contact_capacity=${capacity}&min_dpd=${minDpd}&max_dpd=${maxDpd}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSimResult(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch simulation results. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [priorityRule, capacity, minDpd, maxDpd]);

  return (
    <div>
      {/* Strategy Simulator Header */}
      <div className="section-card" style={{ borderLeft: '4px solid var(--accent-teal)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <Target size={22} color="var(--accent-teal)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Collection Strategy Sandbox: Interactive Prioritization & RCT Pilot Design
          </h2>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Explore debt allocation rules across collector capacity constraints. This module simulates historical 
          performance under transparent portfolio filters and pairs them with an orthogonal A/B randomized experiment protocol.
        </p>
      </div>

      {/* Interactive Controls */}
      <div className="section-card">
        <h3 className="section-title" style={{ marginBottom: '1rem' }}>
          <span>Targeting Strategy & Operational Capacity Sliders</span>
        </h3>

        <div className="strategy-controls-grid">
          <div className="control-group">
            <label htmlFor="priority-select">Prioritization Rule</label>
            <select 
              id="priority-select" 
              value={priorityRule} 
              onChange={(e) => setPriorityRule(e.target.value)}
            >
              <option value="HIGH_BALANCE_EARLY_DPD">High Balance + Early Delinquency (DPD 1-30 First)</option>
              <option value="HIGH_RISK_FIRST">High Risk & NPA Accounts First</option>
              <option value="LOW_RISK_QUICK_WINS">Low Risk Quick-Wins (High Willingness)</option>
              <option value="PURE_BALANCE_DESC">Pure Balance Descending</option>
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="capacity-slider">
              Monthly Contact Capacity: <strong>{capacity.toLocaleString()} accounts</strong>
            </label>
            <input 
              id="capacity-slider" 
              type="range" 
              min={1000} 
              max={25000} 
              step={1000}
              value={capacity} 
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
          </div>

          <div className="control-group">
            <label htmlFor="dpd-min">Min DPD: <strong>{minDpd} days</strong></label>
            <input 
              id="dpd-min" 
              type="range" 
              min={0} 
              max={60} 
              step={5}
              value={minDpd} 
              onChange={(e) => setMinDpd(Number(e.target.value))}
            />
          </div>

          <div className="control-group">
            <label htmlFor="dpd-max">Max DPD: <strong>{maxDpd} days</strong></label>
            <input 
              id="dpd-max" 
              type="range" 
              min={60} 
              max={180} 
              step={10}
              value={maxDpd} 
              onChange={(e) => setMaxDpd(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Live Simulation Output Cards */}
        {loading && (
          <div className="state-container">
            <div className="spinner"></div>
            <div>Calculating strategy simulation on golden dataset...</div>
          </div>
        )}

        {error && (
          <div style={{ color: 'var(--danger-red)', padding: '1rem', background: 'var(--danger-red-bg)', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}

        {simResult && !loading && (
          <div>
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-label">Targeted Accounts</div>
                <div className="kpi-value-row">
                  <div className="kpi-value">
                    {simResult.workload_and_coverage.accounts_targeted.toLocaleString()}
                  </div>
                </div>
                <div className="kpi-subtext">
                  Coverage: {simResult.workload_and_coverage.portfolio_account_coverage_pct}% of total portfolio
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-label">Targeted Outstanding Balance</div>
                <div className="kpi-value-row">
                  <div className="kpi-value">
                    ${(simResult.workload_and_coverage.outstanding_balance_targeted / 1e6).toFixed(1)}M
                  </div>
                </div>
                <div className="kpi-subtext">
                  Coverage: {simResult.workload_and_coverage.portfolio_balance_coverage_pct}% of portfolio debt
                </div>
              </div>

              <div className="kpi-card" style={{ borderLeft: '3px solid var(--accent-teal)' }}>
                <div className="kpi-label">Historical Observed Recovery</div>
                <div className="kpi-value-row">
                  <div className="kpi-value" style={{ color: 'var(--accent-teal)' }}>
                    ${(simResult.historical_observed_outcomes.historical_settled_recovery / 1e6).toFixed(1)}M
                  </div>
                </div>
                <div className="kpi-subtext">
                  Historical Rate: {simResult.historical_observed_outcomes.historical_recovery_rate_pct}%
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-label">Historical Paying Debtors</div>
                <div className="kpi-value-row">
                  <div className="kpi-value">
                    {simResult.historical_observed_outcomes.historical_paying_accounts.toLocaleString()}
                  </div>
                </div>
                <div className="kpi-subtext">
                  Penetration: {simResult.historical_observed_outcomes.debtor_penetration_rate_pct}% of targeted
                </div>
              </div>
            </div>

            {/* MANDATORY Causal Disclaimer Banner */}
            <div className="verdict-banner" style={{ background: '#fffbeb', borderColor: 'var(--warning-amber-border)', borderLeftColor: 'var(--warning-amber)' }}>
              <div className="verdict-header">
                <div className="verdict-title">
                  <AlertTriangle size={20} color="var(--warning-amber)" />
                  <span style={{ color: 'var(--warning-amber)' }}>{simResult.causal_disclaimer.warning}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {simResult.causal_disclaimer.message}
              </p>
            </div>

            {/* Randomized Control Trial (RCT) Experiment Design */}
            <div className="section-card" style={{ background: 'var(--bg-muted)' }}>
              <div className="section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FlaskConical size={20} color="var(--accent-teal)" />
                  <h3 className="section-title">
                    Proposed Randomized Controlled Trial (RCT) Pilot Protocol
                  </h3>
                </div>
                <span className="badge-defensible">Scientifically Valid</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TREATMENT ARM (80%)</div>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                    {simResult.randomized_experiment_protocol.allocation.treatment_arm}
                  </p>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONTROL HOLDOUT ARM (20%)</div>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                    {simResult.randomized_experiment_protocol.allocation.control_arm}
                  </p>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PRIMARY METRIC & MDE</div>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                    {simResult.randomized_experiment_protocol.primary_outcome}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', marginTop: '0.3rem', fontWeight: 600 }}>
                    {simResult.randomized_experiment_protocol.statistical_power}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', background: 'var(--bg-card)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.3rem' }}>
                  OPERATIONAL GUARDRAILS & STOPPING CRITERIA
                </div>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  {simResult.randomized_experiment_protocol.guardrails_and_stopping_rules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
