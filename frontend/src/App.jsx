import { useState, useEffect } from 'react';
import {
  Activity, LayoutDashboard, CircuitBoard, Cpu, BookOpen,
  Settings, Search, Bell, Plus, ArrowUpRight, Zap,
  Calculator, Waves, Menu, X, ChevronRight, Play,
  CheckCircle2, Lightbulb, Gauge
} from 'lucide-react';
import './App.css';
import ComponentLibrary from './components/ComponentLibrary';
import WaveformStudio from './components/WaveformStudio';
import CircuitBuilder from './components/CircuitBuilder';

function App() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [voltage, setVoltage] = useState('12');
  const [resistance, setResistance] = useState('100');

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [, setCalculated] = useState(false);
  useEffect(() => {
    let isMounted = true;

    const checkBackend = async () => {
      try {
        const response = await fetch(
          'http://127.0.0.1:8000/health'
        );

        if (!response.ok) {
          throw new Error('Backend unavailable');
        }

        const data = await response.json();

        if (data.status !== 'healthy') {
          throw new Error('Backend unhealthy');
        }

        if (isMounted) {
          setBackendStatus('connected');
        }
      } catch {
        if (isMounted) {
          setBackendStatus('disconnected');
        }
      }
    };

    checkBackend();

    const intervalId = setInterval(checkBackend, 15000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);



  const handleCalculate = async () => {
    const voltageValue = Number(voltage);
    const resistanceValue = Number(resistance);

    setError('');
    setResults(null);
    setCalculated(false);

    if (
      voltage.trim() === '' ||
      resistance.trim() === ''
    ) {
      setError('Please enter both voltage and resistance.');
      return;
    }

    if (!Number.isFinite(voltageValue) || voltageValue < 0) {
      setError('Voltage must be a valid non-negative number.');
      return;
    }

    if (
      !Number.isFinite(resistanceValue) ||
      resistanceValue <= 0
    ) {
      setError('Resistance must be a valid number greater than zero.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/analyze',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            voltage: voltageValue,
            resistance: resistanceValue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === 'string'
            ? data.detail
            : 'Circuit analysis request failed.'
        );
      }

      if (
        !Number.isFinite(data.current) ||
        !Number.isFinite(data.power)
      ) {
        throw new Error('Backend returned invalid calculation results.');
      }

      setResults(data);
      setCalculated(true);
    } catch (err) {
      setError(err.message || 'Unable to connect to backend.');
    } finally {
      setLoading(false);
    }
  };



  const navigation = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Circuit Analyzer', icon: CircuitBoard },
    { name: 'Circuit Builder', icon: CircuitBoard },
    { name: 'Components', icon: Cpu },
    { name: 'Waveform Studio', icon: Waves },
    { name: 'Documentation', icon: BookOpen },
  ];

  const openAnalyzer = () => {
    setActiveTab('Circuit Analyzer');
    setMobileMenu(false);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-icon"><CircuitBoard size={25} /></div>
          <div>
            <h2>CircuitSage<span> AI</span></h2>
            <small>ENGINEERING INTELLIGENCE</small>
          </div>
          <button className="mobile-close" onClick={() => setMobileMenu(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {navigation.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${activeTab === name ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(name);
                setMobileMenu(false);
              }}
            >
              <Icon size={19} />
              <span>{name}</span>
              {name === 'Circuit Analyzer' && <span className="nav-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="pro-card">
            <div className="pro-icon"><Lightbulb size={20} /></div>
            <h4>Engineering smarter</h4>
            <p>Analyze circuits and understand their behaviour.</p>
            <button onClick={openAnalyzer}>Start analyzing <ArrowUpRight size={15} /></button>
          </div>
          <button className="nav-item settings-link" onClick={() => setActiveTab('Settings')}>
            <Settings size={19} /> <span>Settings</span>
          </button>
          <div className="profile">
            <div className="avatar">CS</div>
            <div><strong>Engineer</strong><small>Personal workspace</small></div>
          </div>
        </div>
      </aside>

      {mobileMenu && <div className="mobile-overlay" onClick={() => setMobileMenu(false)} />}

      <main className="main-area">
        <header className="topbar">
          <button className="menu-toggle" onClick={() => setMobileMenu(true)}>
            <Menu size={22} />
          </button>
          <div className="breadcrumb">Workspace <ChevronRight size={15} /> <strong>{activeTab}</strong></div>
          <div className="topbar-actions">
            <div className="search-box">
              <Search size={17} />
              <input placeholder="Search tools..." />
              <kbd>⌘ K</kbd>
            </div>
            <button className="icon-button" aria-label="Notifications"><Bell size={19} /></button>
            <div className="top-avatar">CS</div>
          </div>
        </header>

        {activeTab === 'Overview' && (
          <div className="page-content">
            <div className="welcome-row">
              <div>
                <div className="eyebrow"><span className="status-pulse" /> ENGINEERING WORKSPACE</div>
                <h1>Welcome to <span>CircuitSage AI.</span></h1>
                <p>Your intelligent workspace for circuit analysis, simulation and learning.</p>
              </div>
              <button className="primary-button" onClick={openAnalyzer}>
                <Plus size={18} /> New Analysis
              </button>
            </div>

            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-top"><span>Analysis workspace</span><CircuitBoard size={19} /></div>
                <h2>Ready</h2>
                <p><span className="green-text"><CheckCircle2 size={14} /> Operational</span> <span>Start your first analysis</span></p>
              </div>
              <div className="stat-card">
                <div className="stat-top"><span>Calculation engine</span><Calculator size={19} /></div>
                <h2>Ohm's Law</h2>
                <p><span className="green-text">Available</span><span>Basic calculation module</span></p>
              </div>
              <div className="stat-card">
                <div className="stat-top"><span>Backend status</span><Activity size={19} /></div>
                <h2>
                  {backendStatus === 'checking'
                    ? 'Checking...'
                    : backendStatus === 'connected'
                      ? 'Online'
                      : 'Offline'}
                </h2>

                <p>
                  <span
                    className={
                      backendStatus === 'connected'
                        ? 'green-text'
                        : ''
                    }
                  >
                    {backendStatus === 'checking'
                      ? 'Checking connection'
                      : backendStatus === 'connected'
                        ? 'Connected'
                        : 'Disconnected'}
                  </span>

                  <span>FastAPI backend status</span>
                </p>
              </div>
            </section>

            <section className="section-heading">
              <div><h2>Quick access</h2><p>Choose a tool to get started.</p></div>
            </section>

            <section className="tools-grid">
              <button className="tool-card" onClick={openAnalyzer}>
                <div className="tool-icon blue"><CircuitBoard size={23} /></div>
                <div><h3>Circuit Analyzer</h3><p>Analyze electrical circuits and calculate parameters.</p></div>
                <ArrowUpRight size={18} className="tool-arrow" />
              </button>
              <button className="tool-card" onClick={() => setActiveTab('Components')}>
                <div className="tool-icon purple"><Cpu size={23} /></div>
                <div><h3>Component Library</h3><p>Explore electronic components and their properties.</p></div>
                <ArrowUpRight size={18} className="tool-arrow" />
              </button>
              <button className="tool-card" onClick={() => setActiveTab('Waveform Studio')}>
                <div className="tool-icon orange"><Waves size={23} /></div>
                <div><h3>Waveform Studio</h3><p>Explore signals and electrical waveforms.</p></div>
                <ArrowUpRight size={18} className="tool-arrow" />
              </button>
              <button className="tool-card" onClick={() => setActiveTab('Documentation')}>
                <div className="tool-icon green"><BookOpen size={23} /></div>
                <div><h3>Learning Center</h3><p>Understand circuit concepts and engineering theory.</p></div>
                <ArrowUpRight size={18} className="tool-arrow" />
              </button>
            </section>

            <section className="section-heading lower-heading">
              <div><h2>Getting started</h2><p>Your first steps in CircuitSage AI.</p></div>
            </section>

            <div className="getting-started">
              <div className="getting-icon"><Zap size={24} /></div>
              <div className="getting-copy">
                <h3>Run your first circuit calculation</h3>
                <p>Enter voltage and resistance values to calculate current and power using Ohm's law.</p>
              </div>
              <button className="secondary-button" onClick={openAnalyzer}>Open analyzer <ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        {activeTab === 'Circuit Analyzer' && (
          <div className="page-content">
            <div className="page-title">
              <div className="eyebrow">ENGINEERING TOOLS / ANALYSIS</div>
              <h1>Circuit Analyzer</h1>
              <p>Calculate basic electrical parameters using Ohm's law.</p>
            </div>
            <div className="analyzer-layout">
              <section className="panel input-panel">
                <div className="panel-heading"><div className="tool-icon blue"><Calculator size={21} /></div><div><h3>Ohm's Law Calculator</h3><p>Enter your circuit parameters</p></div></div>
                <label>Voltage (V)</label>
                <div className="field-wrap">
                  <input
                    type="number"
                    min="0"
                    value={voltage}
                    onChange={e => {
                      setVoltage(e.target.value);
                      setResults(null);
                      setError('');
                      setCalculated(false);
                    }}
                  />
                  <span>VOLTS</span>
                </div>
                <label>Resistance (Ω)</label>
                <div className="field-wrap">
                  <input
                    type="number"
                    min="0"
                    value={resistance}
                    onChange={e => {
                      setResistance(e.target.value);
                      setResults(null);
                      setError('');
                      setCalculated(false);
                    }}
                  />
                  <span>OHMS</span>
                </div>
                <button
                  className="primary-button calculate-button"
                  onClick={handleCalculate}
                  disabled={loading}
                >
                  <Play size={16} />
                  {loading ? 'Analyzing...' : 'Calculate results'}
                </button>
                <p className="helper-text">Formula: I = V / R &nbsp; · &nbsp; P = V × I</p>
              </section>
              <section className="panel results-panel">
                <div className="panel-heading"><div className="tool-icon green"><Gauge size={21} /></div><div><h3>Analysis results</h3><p>Calculated electrical parameters</p></div></div>
                {loading ? (
                  <div className="empty-results">
                    <div className="empty-icon">
                      <Activity size={30} />
                    </div>
                    <h3>Analyzing Circuit...</h3>
                    <p>Please wait while the backend processes your circuit.</p>
                  </div>
                ) : error ? (
                  <div className="empty-results">
                    <div className="empty-icon">
                      <Activity size={30} />
                    </div>
                    <h3>
                      {error === 'Please enter both voltage and resistance.' ||
                        error.startsWith('Voltage must') ||
                        error.startsWith('Resistance must')
                        ? 'Invalid Input'
                        : 'Analysis Failed'}
                    </h3>
                    <p>{error}</p>
                  </div>
                ) : results ? (
                  <>
                    <div className="result-item">
                      <span>Current</span>
                      <strong>{Number(results.current).toFixed(4)} <small>A</small></strong>
                    </div>

                    <div className="result-item">
                      <span>Power</span>
                      <strong>{Number(results.power).toFixed(4)} <small>W</small></strong>
                    </div>

                    <div className="result-item">
                      <span>Voltage</span>
                      <strong>{Number(results.voltage).toFixed(2)} <small>V</small></strong>
                    </div>

                    <div className="result-item">
                      <span>Resistance</span>
                      <strong>{Number(results.resistance).toFixed(2)} <small>Ω</small></strong>
                    </div>

                    <div className="success-note">
                      <CheckCircle2 size={17} />
                      Calculation completed successfully.
                    </div>
                  </>
                ) : (
                  <div className="empty-results">
                    <div className="empty-icon">
                      <Activity size={30} />
                    </div>
                    <h3>Awaiting input</h3>
                    <p>Enter valid voltage and resistance values, then calculate to see your results here.</p>
                  </div>
                )}
              </section>
            </div>
            <div className="notice"><Lightbulb size={19} /><p><strong>Engineering note:</strong> This is a basic DC resistive calculation. Advanced circuit analysis and simulation modules will be added in upcoming development stages.</p></div>
          </div>
        )}

        {activeTab === 'Components' && (
          <ComponentLibrary />
        )}

        {activeTab === 'Waveform Studio' && (
          <WaveformStudio />
        )}

        {activeTab === 'Circuit Builder' && (
          <CircuitBuilder />
        )}


        {activeTab !== 'Overview' &&
          activeTab !== 'Circuit Analyzer' &&
          activeTab !== 'Components' &&
          activeTab !== 'Waveform Studio' &&
          activeTab !== 'Circuit Builder' && (
            <div className="page-content placeholder-page">
              <div className="eyebrow">CIRCUITSAGE AI / WORKSPACE</div>
              <div className="placeholder-icon"><CircuitBoard size={35} /></div>
              <h1>{activeTab}</h1>
              <p>This module is planned for the next development stage.</p>
              <button className="primary-button" onClick={openAnalyzer}>Go to Circuit Analyzer <ArrowUpRight size={17} /></button>
            </div>
          )}

        <footer className="footer">
          <span>© 2026 CircuitSage AI</span>
          <span><span className="status-pulse" /> Engineering workspace</span>
          <span>Version 1.0.0</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
