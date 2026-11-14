import { useState } from 'react';
import {
  Activity,
  Calculator,
  Zap,
  Gauge,
  Play,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

import { analyzeSeriesRLC } from './acCircuitEngine';

function ACCircuitAnalyzer() {
  const [voltage, setVoltage] = useState('12');
  const [frequency, setFrequency] = useState('50');
  const [resistance, setResistance] = useState('100');
  const [inductance, setInductance] = useState('100');
  const [capacitance, setCapacitance] = useState('100');

  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleCalculate = () => {
    setError('');
    setResults(null);

    const fields = [
      voltage,
      frequency,
      resistance,
      inductance,
      capacitance
    ];

    if (fields.some(value => value.trim() === '')) {
      setError('Please fill in all circuit parameters.');
      return;
    }

    try {
      const calculatedResults = analyzeSeriesRLC({
        voltage: Number(voltage),
        frequency: Number(frequency),
        resistance: Number(resistance),
        inductance: Number(inductance) / 1000,
        capacitance: Number(capacitance) / 1000000
      });

      setResults(calculatedResults);
    } catch (err) {
      setError(err.message || 'Unable to analyze the circuit.');
    }
  };

  const handleReset = () => {
    setVoltage('12');
    setFrequency('50');
    setResistance('100');
    setInductance('100');
    setCapacitance('100');
    setResults(null);
    setError('');
  };

  const inputFields = [
    {
      label: 'RMS Voltage',
      value: voltage,
      setter: setVoltage,
      unit: 'VOLTS'
    },
    {
      label: 'Frequency',
      value: frequency,
      setter: setFrequency,
      unit: 'HZ'
    },
    {
      label: 'Resistance',
      value: resistance,
      setter: setResistance,
      unit: 'OHMS'
    },
    {
      label: 'Inductance',
      value: inductance,
      setter: setInductance,
      unit: 'MH'
    },
    {
      label: 'Capacitance',
      value: capacitance,
      setter: setCapacitance,
      unit: 'µF'
    }
  ];

  const format = (value, digits = 4) =>
    Number(value).toFixed(digits);

  return (
    <div className="page-content ac-page">
      <div className="page-title">
        <div className="eyebrow">
          ENGINEERING TOOLS / AC ANALYSIS
        </div>

        <h1>AC Circuit Analyzer</h1>

        <p>
          Analyze series RLC circuits and calculate AC electrical parameters.
        </p>
      </div>

      <div className="ac-info-banner">
        <div className="tool-icon orange">
          <Zap size={22} />
        </div>

        <div>
          <h3>Series RLC Analysis</h3>
          <p>
            Calculate reactance, impedance, RMS current, phase angle,
            power factor and resonance.
          </p>
        </div>
      </div>

      <div className="analyzer-layout">
        <section className="panel input-panel">
          <div className="panel-heading">
            <div className="tool-icon blue">
              <Calculator size={21} />
            </div>

            <div>
              <h3>Circuit Parameters</h3>
              <p>Enter your AC circuit values</p>
            </div>
          </div>

          {inputFields.map(field => (
            <div key={field.label}>
              <label>{field.label}</label>

              <div className="field-wrap">
                <input
                  type="number"
                  step="any"
                  value={field.value}
                  onChange={event => {
                    field.setter(event.target.value);
                    setResults(null);
                    setError('');
                  }}
                />

                <span>{field.unit}</span>
              </div>
            </div>
          ))}

          <button
            className="primary-button calculate-button"
            onClick={handleCalculate}
          >
            <Play size={16} />
            Calculate AC Results
          </button>

          <button
            className="ac-reset-button"
            onClick={handleReset}
          >
            <RotateCcw size={14} />
            Reset parameters
          </button>

          <p className="helper-text">
            Assumption: All voltage values are RMS.
          </p>
        </section>

        <section className="panel results-panel">
          <div className="panel-heading">
            <div className="tool-icon green">
              <Gauge size={21} />
            </div>

            <div>
              <h3>Analysis Results</h3>
              <p>Calculated AC circuit parameters</p>
            </div>
          </div>

          {error ? (
            <div className="empty-results">
              <div className="empty-icon">
                <Activity size={30} />
              </div>

              <h3>Analysis Error</h3>
              <p>{error}</p>
            </div>
          ) : results ? (
            <>
              <div className="ac-result-highlight">
                <span>RMS Current</span>

                <strong>
                  {format(results.current)} <small>A</small>
                </strong>

                <span>{results.circuitType} circuit</span>
              </div>

              <div className="result-item">
                <span>Inductive Reactance (XL)</span>
                <strong>
                  {format(results.inductiveReactance)} <small>Ω</small>
                </strong>
              </div>

              <div className="result-item">
                <span>Capacitive Reactance (XC)</span>
                <strong>
                  {format(results.capacitiveReactance)} <small>Ω</small>
                </strong>
              </div>

              <div className="result-item">
                <span>Net Reactance</span>
                <strong>
                  {format(results.netReactance)} <small>Ω</small>
                </strong>
              </div>

              <div className="result-item">
                <span>Impedance</span>
                <strong>
                  {format(results.impedance)} <small>Ω</small>
                </strong>
              </div>

              <div className="result-item">
                <span>Phase Angle</span>
                <strong>
                  {format(results.phaseAngleDegrees, 2)} <small>°</small>
                </strong>
              </div>

              <div className="result-item">
                <span>Power Factor</span>
                <strong>{format(results.powerFactor, 4)}</strong>
              </div>

              <div className="result-item">
                <span>Real Power</span>
                <strong>
                  {format(results.realPower)} <small>W</small>
                </strong>
              </div>

              <div className="result-item">
                <span>Apparent Power</span>
                <strong>
                  {format(results.apparentPower)} <small>VA</small>
                </strong>
              </div>

              <div className="result-item">
                <span>Reactive Power</span>
                <strong>
                  {format(results.reactivePower)} <small>VAR</small>
                </strong>
              </div>

              <div className="result-item">
                <span>Resonant Frequency</span>
                <strong>
                  {results.resonantFrequency === null
                    ? 'N/A'
                    : `${format(results.resonantFrequency)} Hz`}
                </strong>
              </div>

              <div className="success-note">
                <CheckCircle2 size={17} />
                AC circuit analysis completed successfully.
              </div>
            </>
          ) : (
            <div className="empty-results">
              <div className="empty-icon">
                <Activity size={30} />
              </div>

              <h3>Awaiting Parameters</h3>

              <p>
                Enter your circuit values and calculate to see
                the AC analysis results here.
              </p>
            </div>
          )}
        </section>
      </div>

      <div className="notice">
        <Zap size={19} />

        <p>
          <strong>Engineering note:</strong> This module analyzes an
          ideal series RLC circuit under sinusoidal steady-state
          conditions. Inductance is entered in mH and capacitance
          in µF.
        </p>
      </div>
    </div>
  );
}

export default ACCircuitAnalyzer;
