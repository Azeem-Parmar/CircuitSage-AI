
import { useState } from 'react';
import {
  CircuitBoard,
  Plus,
  Trash2,
  Play,
  RotateCcw,
  Zap,
  Activity,
  AlertCircle,
} from 'lucide-react';

import { analyzeCircuit } from '../circuit/circuitEngine';
import NodalAnalysisPanel from './NodalAnalysisPanel';

function CircuitBuilder() {
  const [activeMode, setActiveMode] = useState('basic');

  const [voltage, setVoltage] = useState(12);
  const [connection, setConnection] = useState('series');

  const [resistors, setResistors] = useState([
    { id: 1, name: 'R1', resistance: 100 },
    { id: 2, name: 'R2', resistance: 200 },
  ]);

  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const addResistor = () => {
    const nextId = Math.max(0, ...resistors.map((r) => r.id)) + 1;

    setResistors([
      ...resistors,
      {
        id: nextId,
        name: `R${nextId}`,
        resistance: 100,
      },
    ]);

    setResults(null);
    setError('');
  };

  const removeResistor = (id) => {
    setResistors(resistors.filter((r) => r.id !== id));
    setResults(null);
    setError('');
  };

  const updateResistor = (id, value) => {
    setResistors(
      resistors.map((r) =>
        r.id === id
          ? { ...r, resistance: value === '' ? '' : Number(value) }
          : r
      )
    );

    setResults(null);
    setError('');
  };

  const handleAnalyze = () => {
    try {
      const analysis = analyzeCircuit({
        voltage: Number(voltage),
        resistors: resistors.map((r) => ({
          ...r,
          resistance: Number(r.resistance),
        })),
        connection,
      });

      setResults(analysis);
      setError('');
    } catch (err) {
      setResults(null);
      setError(err.message);
    }
  };

  const resetCircuit = () => {
    setVoltage(12);
    setConnection('series');

    setResistors([
      { id: 1, name: 'R1', resistance: 100 },
      { id: 2, name: 'R2', resistance: 200 },
    ]);

    setResults(null);
    setError('');
  };

  return (
    <div className="page-content circuit-builder-page">
      <div className="page-title">
        <div className="eyebrow">ENGINEERING TOOLS / CIRCUIT DESIGN</div>
        <h1>Circuit Builder</h1>
        <p>
          Design DC circuits and analyze their electrical properties using
          multiple analysis techniques.
        </p>
      </div>

      {/* Analysis Mode Selector */}
      <div className="circuit-mode-selector">
        <button
          className={activeMode === 'basic' ? 'active' : ''}
          onClick={() => setActiveMode('basic')}
        >
          <CircuitBoard size={17} />
          Basic Analysis
        </button>

        <button
          className={activeMode === 'nodal' ? 'active' : ''}
          onClick={() => setActiveMode('nodal')}
        >
          <Activity size={17} />
          Nodal Analysis
        </button>
      </div>

      {activeMode === 'nodal' ? (
        <NodalAnalysisPanel />
      ) : (
        <>
          <div className="circuit-builder-banner">
            <div className="circuit-builder-banner-icon">
              <CircuitBoard size={24} />
            </div>

            <div>
              <h3>DC Circuit Workspace</h3>
              <p>
                Build and analyze series and parallel resistor networks.
              </p>
            </div>

            <span className="circuit-builder-status">
              <span /> READY
            </span>
          </div>

          <div className="circuit-builder-layout">
            <section className="panel circuit-config-panel">
              <div className="waveform-section-heading">
                <CircuitBoard size={19} />
                <div>
                  <h3>Circuit Configuration</h3>
                  <p>Set your source and resistor values</p>
                </div>
              </div>

              <label className="circuit-field-label">
                Supply Voltage (V)
              </label>

              <input
                className="circuit-number-input"
                type="number"
                min="0"
                step="0.1"
                value={voltage}
                onChange={(e) => {
                  setVoltage(
                    e.target.value === '' ? '' : Number(e.target.value)
                  );
                  setResults(null);
                  setError('');
                }}
              />

              <label className="circuit-field-label">
                Connection Type
              </label>

              <div className="circuit-connection-options">
                <button
                  className={connection === 'series' ? 'selected' : ''}
                  onClick={() => {
                    setConnection('series');
                    setResults(null);
                  }}
                >
                  Series
                </button>

                <button
                  className={connection === 'parallel' ? 'selected' : ''}
                  onClick={() => {
                    setConnection('parallel');
                    setResults(null);
                  }}
                >
                  Parallel
                </button>
              </div>

              <div className="circuit-resistor-heading">
                <div>
                  <h3>Resistors</h3>
                  <p>{resistors.length} component(s) added</p>
                </div>

                <button
                  className="circuit-add-button"
                  onClick={addResistor}
                >
                  <Plus size={15} /> Add resistor
                </button>
              </div>

              {resistors.map((resistor) => (
                <div className="circuit-resistor-row" key={resistor.id}>
                  <div className="circuit-resistor-symbol">
                    <Zap size={17} />
                  </div>

                  <div className="circuit-resistor-input">
                    <label>{resistor.name}</label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={resistor.resistance}
                      onChange={(e) =>
                        updateResistor(resistor.id, e.target.value)
                      }
                      placeholder="Resistance in ohms"
                    />
                  </div>

                  <span className="circuit-ohm-label">Ω</span>

                  <button
                    className="circuit-remove-button"
                    onClick={() => removeResistor(resistor.id)}
                    aria-label={`Remove ${resistor.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <div className="circuit-action-buttons">
                <button
                  className="circuit-analyze-button"
                  onClick={handleAnalyze}
                >
                  <Play size={16} /> Analyze Circuit
                </button>

                <button
                  className="circuit-reset-button"
                  onClick={resetCircuit}
                >
                  <RotateCcw size={15} /> Reset
                </button>
              </div>

              {error && (
                <div className="circuit-error">
                  <AlertCircle size={17} />
                  {error}
                </div>
              )}
            </section>

            <div className="circuit-right-column">
              <section className="panel circuit-schematic-panel">
                <div className="waveform-section-heading">
                  <Activity size={19} />
                  <div>
                    <h3>Circuit Schematic</h3>
                    <p>
                      Visual representation of the selected network
                    </p>
                  </div>
                </div>

                <svg
                  viewBox="0 0 520 250"
                  className="circuit-schematic"
                  role="img"
                  aria-label={`${connection} resistor circuit schematic`}
                >
                  <g
                    fill="none"
                    stroke="#60adff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {connection === 'series' ? (
                      <>
                        <path d="M45 105 H95 M475 105 V190 H45 V105" />

                        {resistors.map((r, i) => {
                          const gap = 330 / resistors.length;
                          const x = 95 + i * gap;
                          const endX = x + 50;

                          const nextX =
                            i === resistors.length - 1
                              ? 475
                              : 95 + (i + 1) * gap;

                          return (
                            <g key={r.id}>
                              <path
                                d={`M${x} 105 l8 -12 l12 24 l12 -24 l12 24 l6 -12`}
                              />

                              <path d={`M${endX} 105 H${nextX}`} />

                              <text
                                x={x + 25}
                                y="78"
                                textAnchor="middle"
                                fill="#b8d8fa"
                                stroke="none"
                                fontSize="12"
                              >
                                {r.name}
                              </text>
                            </g>
                          );
                        })}
                      </>
                    ) : (
                      <>
                        <path d="M45 55 V195 M475 55 V195" />

                        {resistors.map((r, i) => {
                          const y =
                            resistors.length === 1
                              ? 125
                              : 65 + i * (120 / (resistors.length - 1));

                          return (
                            <g key={r.id}>
                              <path
                                d={`M45 ${y} H90 l8 -12 l12 24 l12 -24 l12 24 l6 -12 H475`}
                              />

                              <text
                                x="260"
                                y={y - 15}
                                textAnchor="middle"
                                fill="#b8d8fa"
                                stroke="none"
                                fontSize="12"
                              >
                                {r.name}
                              </text>
                            </g>
                          );
                        })}
                      </>
                    )}
                  </g>

                  <g fill="#e9b96d" stroke="none">
                    <circle cx="45" cy="105" r="5" />
                    <circle cx="475" cy="105" r="5" />
                  </g>

                  <text x="45" y="35" fill="#91a4bd" fontSize="12">
                    DC Source: {voltage || 0} V
                  </text>

                  <text
                    x="260"
                    y="225"
                    textAnchor="middle"
                    fill="#91a4bd"
                    fontSize="12"
                  >
                    {connection.toUpperCase()} NETWORK
                  </text>
                </svg>

                <p className="circuit-schematic-caption">
                  Schematic preview of the selected resistor configuration.
                </p>
              </section>

              <section className="panel circuit-results-panel">
                <div className="waveform-section-heading">
                  <Activity size={19} />
                  <div>
                    <h3>Analysis Results</h3>
                    <p>Calculated electrical parameters</p>
                  </div>
                </div>

                {results ? (
                  <>
                    <div className="circuit-result-grid">
                      <div className="circuit-result-card">
                        <span>Total Resistance</span>
                        <strong>
                          {results.totalResistance.toFixed(3)} Ω
                        </strong>
                      </div>

                      <div className="circuit-result-card">
                        <span>Total Current</span>
                        <strong>
                          {results.totalCurrent.toFixed(4)} A
                        </strong>
                      </div>

                      <div className="circuit-result-card">
                        <span>Total Power</span>
                        <strong>
                          {results.totalPower.toFixed(3)} W
                        </strong>
                      </div>

                      <div className="circuit-result-card">
                        <span>Supply Voltage</span>
                        <strong>
                          {results.supplyVoltage.toFixed(2)} V
                        </strong>
                      </div>
                    </div>

                    <h4 className="circuit-breakdown-title">
                      Resistor Breakdown
                    </h4>

                    {results.resistors.map((r) => (
                      <div className="circuit-breakdown-row" key={r.name}>
                        <strong>{r.name}</strong>
                        <span>{r.voltageDrop.toFixed(3)} V</span>
                        <span>{r.current.toFixed(4)} A</span>
                        <span>{r.power.toFixed(3)} W</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="circuit-empty-results">
                    <CircuitBoard size={32} />
                    <h4>Awaiting analysis</h4>
                    <p>
                      Configure your circuit and select Analyze Circuit to
                      calculate its electrical properties.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CircuitBuilder;
