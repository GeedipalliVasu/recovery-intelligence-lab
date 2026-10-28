import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Sliders, 
  Layers, 
  ShieldAlert, 
  Target, 
  BookOpen, 
  RefreshCw, 
  Search, 
  AlertCircle 
} from 'lucide-react';
import ExecutiveOverview from './components/ExecutiveOverview';
import ClaimStressTest from './components/ClaimStressTest';
import PerformanceDrivers from './components/PerformanceDrivers';
import DataQualityLedger from './components/DataQualityLedger';
import StrategySandbox from './components/StrategySandbox';
import Methodology from './components/Methodology';
import EvidenceTraceModal from './components/EvidenceTraceModal';

const API_BASE = window.location.port === '5173' ? 'http://127.0.0.1:8000' : '';

export default function App() {
  const [activeTab, setActiveTab] = useState('executive');
  
  // Data states
  const [kpiData, setKpiData] = useState(null);
  const [stressTestData, setStressTestData] = useState(null);
  const [driversData, setDriversData] = useState(null);
  const [ledgerData, setLedgerData] = useState(null);
  
  // Trace modal state
  const [traceMetric, setTraceMetric] = useState(null);
  const [traceData, setTraceData] = useState(null);
  
  // App loading & error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial analytical data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiRes, stressRes, driversRes, ledgerRes] = await Promise.all([
        fetch(`${API_BASE}/api/kpi/summary`),
        fetch(`${API_BASE}/api/metrics/stress-test`),
        fetch(`${API_BASE}/api/performance/drivers`),
        fetch(`${API_BASE}/api/data-quality/ledger`)
      ]);

      if (!kpiRes.ok || !stressRes.ok || !driversRes.ok || !ledgerRes.ok) {
        throw new Error('One or more analytical endpoints failed to respond.');
      }

      const [kpi, stress, drivers, ledger] = await Promise.all([
        kpiRes.json(),
        stressRes.json(),
        driversRes.json(),
        ledgerRes.json()
      ]);

      setKpiData(kpi);
      setStressTestData(stress);
      setDriversData(drivers);
      setLedgerData(ledger);
    } catch (err) {
      console.error(err);
      setError('Unable to connect to Recovery Intelligence Lab backend. Ensure the FastAPI server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch evidence trace when requested
  const handleOpenTrace = async (metricKey) => {
    try {
      const res = await fetch(`${API_BASE}/api/metrics/evidence-trace?metric=${metricKey}`);
      if (!res.ok) throw new Error('Failed to load trace');
      const data = await res.json();
      setTraceData(data);
      setTraceMetric(metricKey);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseTrace = () => {
    setTraceData(null);
    setTraceMetric(null);
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-brand">
          <div style={{ background: 'var(--accent-teal)', color: '#fff', padding: '0.4rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center' }}>
            <BarChart3 size={20} />
          </div>
          <div>
            <h1>Recovery Intelligence Lab</h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Collections Performance & Forensic Evaluation Platform
            </div>
          </div>
          <span className="badge">FORENSIC AUDIT</span>
        </div>

        <div className="header-meta">
          <span>
            <strong>Evaluation Period:</strong> Feb 2026 vs Mar 2026
          </span>
          <span>
            <strong>Dataset:</strong> 30,000 Accounts / $10.49B Book
          </span>
          <button 
            className="btn-trace" 
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            onClick={fetchData}
            title="Refresh analytics from DuckDB"
          >
            <RefreshCw size={12} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="nav-tabs" aria-label="Main Navigation">
        <button 
          id="tab-btn-executive"
          className={`nav-tab-btn ${activeTab === 'executive' ? 'active' : ''}`}
          onClick={() => setActiveTab('executive')}
        >
          <BarChart3 size={16} />
          <span>Executive Overview</span>
        </button>

        <button 
          id="tab-btn-stress-test"
          className={`nav-tab-btn ${activeTab === 'stress-test' ? 'active' : ''}`}
          onClick={() => setActiveTab('stress-test')}
        >
          <Sliders size={16} />
          <span>Claim Stress Test (8 Scenarios)</span>
        </button>

        <button 
          id="tab-btn-drivers"
          className={`nav-tab-btn ${activeTab === 'drivers' ? 'active' : ''}`}
          onClick={() => setActiveTab('drivers')}
        >
          <Layers size={16} />
          <span>Performance Drivers & Mix Shift</span>
        </button>

        <button 
          id="tab-btn-data-quality"
          className={`nav-tab-btn ${activeTab === 'data-quality' ? 'active' : ''}`}
          onClick={() => setActiveTab('data-quality')}
        >
          <ShieldAlert size={16} />
          <span>Data Quality Ledger</span>
        </button>

        <button 
          id="tab-btn-strategy"
          className={`nav-tab-btn ${activeTab === 'strategy' ? 'active' : ''}`}
          onClick={() => setActiveTab('strategy')}
        >
          <Target size={16} />
          <span>Collection Strategy Sandbox</span>
        </button>

        <button 
          id="tab-btn-methodology"
          className={`nav-tab-btn ${activeTab === 'methodology' ? 'active' : ''}`}
          onClick={() => setActiveTab('methodology')}
        >
          <BookOpen size={16} />
          <span>Methodology & Evidence</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {loading && (
          <div className="state-container">
            <div className="spinner"></div>
            <p>Loading forensic pipeline metrics from DuckDB...</p>
          </div>
        )}

        {error && (
          <div className="verdict-banner" style={{ borderLeftColor: 'var(--danger-red)', background: 'var(--danger-red-bg)' }}>
            <div className="verdict-header">
              <div className="verdict-title" style={{ color: 'var(--danger-red)' }}>
                <AlertCircle size={20} color="var(--danger-red)" />
                <span>Backend Connection Error</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{error}</p>
            <button className="btn-trace" style={{ marginTop: '0.75rem' }} onClick={fetchData}>
              Retry Connection
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {activeTab === 'executive' && (
              <ExecutiveOverview data={kpiData} onOpenTrace={handleOpenTrace} />
            )}
            {activeTab === 'stress-test' && (
              <ClaimStressTest stressTestData={stressTestData} onOpenTrace={handleOpenTrace} />
            )}
            {activeTab === 'drivers' && (
              <PerformanceDrivers driversData={driversData} />
            )}
            {activeTab === 'data-quality' && (
              <DataQualityLedger ledgerData={ledgerData} />
            )}
            {activeTab === 'strategy' && (
              <StrategySandbox />
            )}
            {activeTab === 'methodology' && (
              <Methodology onOpenTrace={handleOpenTrace} />
            )}
          </>
        )}
      </main>

      {/* Evidence Trace Modal */}
      {traceData && (
        <EvidenceTraceModal 
          traceData={traceData} 
          onClose={handleCloseTrace} 
        />
      )}
    </div>
  );
}
