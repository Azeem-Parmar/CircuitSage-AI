
import { useState } from 'react';
import {
  Activity,
  AlertCircle,
  Play,
  RotateCcw,
  Zap,
} from 'lucide-react';

import { analyzeMixedCircuit } from '../circuit/mixedCircuitEngine';

const initialValues = {
  voltage: 12,
  r1: 100,
  r2: 200,
  r3: 300,
};

function MixedAnalysisPanel() {
  const [values, setValues] = useState(initialValues);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const updateValue = (field, value) => {
    setValues((previous) => ({
      ...previous,
      [field]: value === '' ? '' : Number(value),
    }));

    setResults(null);
    setError('');
  };

  const handleAnalyze = () => {
    try {
      const network = {
        type: 'series',
        children: [
          {
            type: 'resistor',
            name: 'R1',
            resistance: Number(values.r1),
          },
          {
            type: 'parallel',
            children: [
              {
                type: 'resistor',
                name: 'R2',
                resistance: Number(values.r2),
              },
              {
                type: 'resistor',
                name: 'R3',
                resistance: Number(values.r3),
              },
            ],
          },
        ],
      };

      const analysis = analyzeMixedCircuit({
        voltage: Number(values.voltage),
        network,
      });

      setResults(analysis);
      setError('');
    } catch (err) {
      setResults(null);
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to analyze this mixed circuit.'
      );
    }
  };

  const resetCircuit = () => {
    setValues(initialValues);
    setResults(null);
    setError('');
  };

  const fields = [
    { key: 'r1', label: 'R1 – Series resistor' },
    { key: 'r2', label: 'R2 – Parallel branch 1' },
    { key: 'r3', label: 'R3 – Parallel branch 2' },
  ];

  return (
    <>
      <div className="circuit-builder-banner">
        <div className="circuit-builder-banner-icon">
          <Activity size={24} />
        </div>

        <div>
          <h3>Mixed Circuit Workspace</h3>
          <p>Analyze series and parallel resistor combinations.</p>
        </div>

        <span className="circuit-builder-status">
          <span /> READY
        </span>
      </div>

      <div className="circuit-builder-layout">
        <section className="panel circuit-config-panel">
          <div className="waveform-section-heading">
            <Zap size={19} />
            <div>
              <h3>Circuit Configuration</h3>
              <p>R1 in series with R2 and R3 in parallel</p>
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
            value={values.voltage}
            onChange={(event) =>
              updateValue('voltage', event.target.value)
            }
            placeholder="Enter supply voltage"
          />

          <div className="circuit-resistor-heading">
            <div>
              <h3>Resistor Values</h3>
              <p>Adjust each resistor independently</p>
            </div>
          </div>

          {fields.map((field) => (
            <div className="circuit-resistor-row" key={field.key}>
              <div className="circuit-resistor-symbol">
                <Zap size={17} />
              </div>

              <div className="circuit-resistor-input">
                <label>{field.label}</label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={values[field.key]}
                  onChange={(event) =>
                    updateValue(field.key, event.target.value)
                  }
                  placeholder="Resistance in ohms"
                />
              </div>

              <span className="circuit-ohm-label">Ω</span>
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
            <div className="circuit-error" role="alert">
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
                <h3>Mixed Circuit Schematic</h3>
                <p>Series-parallel network representation</p>
              </div>
            </div>

            <svg
              viewBox="0 0 520 270"
              className="circuit-schematic"
              role="img"
              aria-label="R1 in series with R2 and R3 in parallel"
            >
              <g
                fill="none"
                stroke="#60adff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Source and series path */}
                <path d="M35 130 H95" />
                <path d="M95 130 l8 -12 l12 24 l12 -24 l12 24 l8 -12 H185" />

                {/* Parallel network rails */}
                <path d="M185 130 V65 H245" />
                <path d="M185 130 V195 H245" />

                {/* Parallel resistors */}
                <path d="M245 65 l8 -12 l12 24 l12 -24 l12 24 l8 -12 H365" />
                <path d="M245 195 l8 -12 l12 24 l12 -24 l12 24 l8 -12 H365" />

                {/* Return rail and source connection */}
                <path d="M365 65 V195" />
                <path d="M365 130 H455 V220 H35 V130" />
              </g>

              <g fill="#b8d8fa" fontSize="13">
                <text x="140" y="100" textAnchor="middle">R1</text>
                <text x="305" y="40" textAnchor="middle">R2</text>
                <text x="305" y="170" textAnchor="middle">R3</text>
              </g>

              <g fill="#e9b96d">
                <circle cx="185" cy="130" r="4" />
                <circle cx="365" cy="130" r="4" />
              </g>

              <g fill="#91a4bd" fontSize="12">
                <text x="35" y="105">DC Source: {values.voltage || 0} V</text>
                <text x="275" y="250" textAnchor="middle">
                  R1 SERIES (R2 || R3)
                </text>
              </g>
            </svg>

            <p className="circuit-schematic-caption">
              R1 is connected in series with a parallel combination of R2 and R3.
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

                {results.resistors.map((resistor) => (
                  <div
                    className="circuit-breakdown-row"
                    key={resistor.name}
                  >
                    <strong>{resistor.name}</strong>
                    <span>{resistor.voltageDrop.toFixed(3)} V</span>
                    <span>{resistor.current.toFixed(4)} A</span>
                    <span>{resistor.power.toFixed(3)} W</span>
                  </div>
                ))}
              </>
            ) : (
              <div className="circuit-empty-results">
                <Activity size={32} />
                <h4>Awaiting analysis</h4>
                <p>
                  Configure your resistor values and select Analyze Circuit
                  to calculate the network.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default MixedAnalysisPanel;
