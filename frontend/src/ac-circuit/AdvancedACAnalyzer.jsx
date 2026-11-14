import { useState } from 'react';
import {
  Activity,
  Calculator,
  Zap,
  Gauge,
  Play,
  RotateCcw,
  Waves,
  Radio,
  BarChart3,
  Target
} from 'lucide-react';

import {
  analyzeParallelRLC,
  analyzeRLCResonance,
  analyzeRLCQualityBandwidth,
  analyzePhasor,
  analyzeFrequencyResponse
} from './advancedAcEngine';

const sections = [
  { id: 'parallel', label: 'Parallel RLC', icon: Activity },
  { id: 'resonance', label: 'Resonance', icon: Zap },
  { id: 'quality', label: 'Q Factor & BW', icon: Gauge },
  { id: 'phasor', label: 'Phasor', icon: Radio },
  { id: 'frequency', label: 'Frequency Response', icon: BarChart3 }
];

function Field({ label, value, onChange, unit, step = 'any' }) {
  return (
    <div className="advanced-ac-field">
      <label>{label}</label>
      <div className="field-wrap">
        <input
          type="number"
          step={step}
          value={value}
          onChange={event => onChange(event.target.value)}
        />
        {unit && <span>{unit}</span>}
      </div>
    </div>
  );
}

function ResultItem({ label, value, unit = '' }) {
  return (
    <div className="result-item">
      <span>{label}</span>
      <strong>
        {value} {unit && <small>{unit}</small>}
      </strong>
    </div>
  );
}

function ResultPanel({ title, subtitle, children }) {
  return (
    <section className="panel results-panel">
      <div className="panel-heading">
        <div className="tool-icon green">
          <Gauge size={21} />
        </div>
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function EmptyResults({ message = 'Enter your parameters and calculate to see results.' }) {
  return (
    <div className="empty-results">
      <div className="empty-icon">
        <Activity size={30} />
      </div>
      <h3>Awaiting Parameters</h3>
      <p>{message}</p>
    </div>
  );
}

function AdvancedACAnalyzer() {
  const [activeSection, setActiveSection] = useState('parallel');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const [parallel, setParallel] = useState({
    voltage: '12',
    frequency: '50',
    resistance: '100',
    inductance: '100',
    capacitance: '100'
  });

  const [resonance, setResonance] = useState({
    inductance: '100',
    capacitance: '100'
  });

  const [quality, setQuality] = useState({
    resistance: '10',
    inductance: '100',
    capacitance: '100',
    topology: 'series'
  });

  const [phasor, setPhasor] = useState({
    real: '3',
    imaginary: '4'
  });

  const [frequency, setFrequency] = useState({
    voltage: '12',
    resistance: '100',
    inductance: '100',
    capacitance: '100',
    startFrequency: '10',
    endFrequency: '100',
    points: '25',
    topology: 'series'
  });

  const update = (setter, field, value) => {
    setter(previous => ({
      ...previous,
      [field]: value
    }));
    setResults(null);
    setError('');
  };

  const format = (value, digits = 4) =>
    Number(value).toFixed(digits);

  const calculate = () => {
    setError('');
    setResults(null);

    try {
      let calculated;

      if (activeSection === 'parallel') {
        calculated = analyzeParallelRLC({
          voltage: Number(parallel.voltage),
          frequency: Number(parallel.frequency),
          resistance: Number(parallel.resistance),
          inductance: Number(parallel.inductance) / 1000,
          capacitance: Number(parallel.capacitance) / 1000000
        });
      }

      if (activeSection === 'resonance') {
        calculated = analyzeRLCResonance({
          inductance: Number(resonance.inductance) / 1000,
          capacitance: Number(resonance.capacitance) / 1000000
        });
      }

      if (activeSection === 'quality') {
        calculated = analyzeRLCQualityBandwidth({
          resistance: Number(quality.resistance),
          inductance: Number(quality.inductance) / 1000,
          capacitance: Number(quality.capacitance) / 1000000,
          topology: quality.topology
        });
      }

      if (activeSection === 'phasor') {
        calculated = analyzePhasor({
          real: Number(phasor.real),
          imaginary: Number(phasor.imaginary)
        });
      }

      if (activeSection === 'frequency') {
        calculated = analyzeFrequencyResponse({
          voltage: Number(frequency.voltage),
          resistance: Number(frequency.resistance),
          inductance: Number(frequency.inductance) / 1000,
          capacitance: Number(frequency.capacitance) / 1000000,
          startFrequency: Number(frequency.startFrequency),
          endFrequency: Number(frequency.endFrequency),
          points: Number(frequency.points),
          topology: frequency.topology
        });
      }

      setResults(calculated);
    } catch (err) {
      setError(err.message || 'Unable to complete AC analysis.');
    }
  };

  const reset = () => {
    setResults(null);
    setError('');

    if (activeSection === 'parallel') {
      setParallel({
        voltage: '12',
        frequency: '50',
        resistance: '100',
        inductance: '100',
        capacitance: '100'
      });
    }

    if (activeSection === 'resonance') {
      setResonance({
        inductance: '100',
        capacitance: '100'
      });
    }

    if (activeSection === 'quality') {
      setQuality({
        resistance: '10',
        inductance: '100',
        capacitance: '100',
        topology: 'series'
      });
    }

    if (activeSection === 'phasor') {
      setPhasor({
        real: '3',
        imaginary: '4'
      });
    }

    if (activeSection === 'frequency') {
      setFrequency({
        voltage: '12',
        resistance: '100',
        inductance: '100',
        capacitance: '100',
        startFrequency: '10',
        endFrequency: '100',
        points: '25',
        topology: 'series'
      });
    }
  };

  const changeSection = section => {
    setActiveSection(section);
    setResults(null);
    setError('');
  };

  const renderInputs = () => {
    if (activeSection === 'parallel') {
      return (
        <>
          <Field label="RMS Voltage" value={parallel.voltage}
            onChange={v => update(setParallel, 'voltage', v)} unit="V" />
          <Field label="Frequency" value={parallel.frequency}
            onChange={v => update(setParallel, 'frequency', v)} unit="Hz" />
          <Field label="Resistance" value={parallel.resistance}
            onChange={v => update(setParallel, 'resistance', v)} unit="Ω" />
          <Field label="Inductance" value={parallel.inductance}
            onChange={v => update(setParallel, 'inductance', v)} unit="mH" />
          <Field label="Capacitance" value={parallel.capacitance}
            onChange={v => update(setParallel, 'capacitance', v)} unit="µF" />
        </>
      );
    }

    if (activeSection === 'resonance') {
      return (
        <>
          <Field label="Inductance" value={resonance.inductance}
            onChange={v => update(setResonance, 'inductance', v)} unit="mH" />
          <Field label="Capacitance" value={resonance.capacitance}
            onChange={v => update(setResonance, 'capacitance', v)} unit="µF" />
        </>
      );
    }

    if (activeSection === 'quality') {
      return (
        <>
          <div className="advanced-ac-field">
            <label>Circuit Topology</label>
            <select
              value={quality.topology}
              onChange={e => update(setQuality, 'topology', e.target.value)}
            >
              <option value="series">Series RLC</option>
              <option value="parallel">Parallel RLC</option>
            </select>
          </div>
          <Field label="Resistance" value={quality.resistance}
            onChange={v => update(setQuality, 'resistance', v)} unit="Ω" />
          <Field label="Inductance" value={quality.inductance}
            onChange={v => update(setQuality, 'inductance', v)} unit="mH" />
          <Field label="Capacitance" value={quality.capacitance}
            onChange={v => update(setQuality, 'capacitance', v)} unit="µF" />
        </>
      );
    }

    if (activeSection === 'phasor') {
      return (
        <>
          <Field label="Real Component" value={phasor.real}
            onChange={v => update(setPhasor, 'real', v)} unit="REAL" />
          <Field label="Imaginary Component" value={phasor.imaginary}
            onChange={v => update(setPhasor, 'imaginary', v)} unit="IMAGINARY" />
        </>
      );
    }

    return (
      <>
        <div className="advanced-ac-field">
          <label>Circuit Topology</label>
          <select
            value={frequency.topology}
            onChange={e => update(setFrequency, 'topology', e.target.value)}
          >
            <option value="series">Series RLC</option>
            <option value="parallel">Parallel RLC</option>
          </select>
        </div>
        <Field label="RMS Voltage" value={frequency.voltage}
          onChange={v => update(setFrequency, 'voltage', v)} unit="V" />
        <Field label="Resistance" value={frequency.resistance}
          onChange={v => update(setFrequency, 'resistance', v)} unit="Ω" />
        <Field label="Inductance" value={frequency.inductance}
          onChange={v => update(setFrequency, 'inductance', v)} unit="mH" />
        <Field label="Capacitance" value={frequency.capacitance}
          onChange={v => update(setFrequency, 'capacitance', v)} unit="µF" />
        <Field label="Start Frequency" value={frequency.startFrequency}
          onChange={v => update(setFrequency, 'startFrequency', v)} unit="Hz" />
        <Field label="End Frequency" value={frequency.endFrequency}
          onChange={v => update(setFrequency, 'endFrequency', v)} unit="Hz" />
        <Field label="Number of Points" value={frequency.points}
          onChange={v => update(setFrequency, 'points', v)} unit="POINTS" step="1" />
      </>
    );
  };

  const renderResults = () => {
    if (!results) return <EmptyResults />;

    if (activeSection === 'parallel') {
      return (
        <>
          <div className="ac-result-highlight">
            <span>Total RMS Current</span>
            <strong>{format(results.totalCurrent)} <small>A</small></strong>
            <span>{results.circuitType} circuit</span>
          </div>
          <ResultItem label="Resistor Branch Current" value={format(results.resistorCurrent)} unit="A" />
          <ResultItem label="Inductor Branch Current" value={format(results.inductorCurrent)} unit="A" />
          <ResultItem label="Capacitor Branch Current" value={format(results.capacitorCurrent)} unit="A" />
          <ResultItem label="Net Reactive Current" value={format(results.netReactiveCurrent)} unit="A" />
          <ResultItem label="Impedance" value={format(results.impedance)} unit="Ω" />
          <ResultItem label="Admittance" value={format(results.admittance, 6)} unit="S" />
          <ResultItem label="Phase Angle" value={format(results.phaseAngleDegrees, 2)} unit="°" />
          <ResultItem label="Power Factor" value={format(results.powerFactor)} />
          <ResultItem label="Real Power" value={format(results.realPower)} unit="W" />
          <ResultItem label="Reactive Power" value={format(results.reactivePower)} unit="VAR" />
          <ResultItem label="Apparent Power" value={format(results.apparentPower)} unit="VA" />
        </>
      );
    }

    if (activeSection === 'resonance') {
      return (
        <>
          <div className="ac-result-highlight">
            <span>Resonant Frequency</span>
            <strong>{format(results.resonantFrequency)} <small>Hz</small></strong>
            <span>Natural resonant frequency of the LC network</span>
          </div>
          <ResultItem label="Angular Resonant Frequency"
            value={format(results.angularResonantFrequency)} unit="rad/s" />
          <ResultItem label="Inductance" value={format(results.inductance * 1000)} unit="mH" />
          <ResultItem label="Capacitance" value={format(results.capacitance * 1000000)} unit="µF" />
        </>
      );
    }

    if (activeSection === 'quality') {
      return (
        <>
          <div className="ac-result-highlight">
            <span>Quality Factor (Q)</span>
            <strong>{format(results.qualityFactor)}</strong>
            <span>{results.topology.toUpperCase()} RLC model</span>
          </div>
          <ResultItem label="Resonant Frequency" value={format(results.resonantFrequency)} unit="Hz" />
          <ResultItem label="Bandwidth" value={format(results.bandwidth)} unit="Hz" />
          <ResultItem label="Lower Cutoff Frequency" value={format(results.lowerCutoffFrequency)} unit="Hz" />
          <ResultItem label="Upper Cutoff Frequency" value={format(results.upperCutoffFrequency)} unit="Hz" />
          <ResultItem label="Cutoff Frequency Difference"
            value={format(results.upperCutoffFrequency - results.lowerCutoffFrequency)} unit="Hz" />
        </>
      );
    }

    if (activeSection === 'phasor') {
      return (
        <>
          <div className="ac-result-highlight">
            <span>Phasor Magnitude</span>
            <strong>{format(results.magnitude)}</strong>
            <span>Polar representation</span>
          </div>
          <ResultItem label="Real Component" value={format(results.real)} />
          <ResultItem label="Imaginary Component" value={format(results.imaginary)} />
          <ResultItem label="Phase Angle" value={format(results.phaseAngleDegrees, 3)} unit="°" />
          <ResultItem label="Phase Angle (Radians)" value={format(results.phaseAngleRadians, 5)} unit="rad" />
          <div className="success-note">
            <Radio size={17} />
            Polar form: {format(results.magnitude)} ∠ {format(results.phaseAngleDegrees, 2)}°
          </div>
        </>
      );
    }

    return (
      <>
        <div className="ac-result-highlight">
          <span>Frequency Response</span>
          <strong>{results.frequencyData.length} <small>points</small></strong>
          <span>{results.topology.toUpperCase()} RLC frequency sweep</span>
        </div>
        <ResultItem label="Start Frequency" value={format(results.startFrequency)} unit="Hz" />
        <ResultItem label="End Frequency" value={format(results.endFrequency)} unit="Hz" />
        <ResultItem label="Frequency Interval"
          value={format((results.endFrequency - results.startFrequency) / (results.points - 1))} unit="Hz" />
        <div className="advanced-ac-table-wrap">
          <h4>Frequency Response Data</h4>
          <div className="advanced-ac-table-scroll">
            <table className="advanced-ac-table">
              <thead>
                <tr>
                  <th>Frequency (Hz)</th>
                  <th>Impedance (Ω)</th>
                  <th>Current (A)</th>
                  <th>PF</th>
                </tr>
              </thead>
              <tbody>
                {results.frequencyData.map((point, index) => (
                  <tr key={`${point.frequency}-${index}`}>
                    <td>{format(point.frequency, 2)}</td>
                    <td>{format(point.impedance, 3)}</td>
                    <td>{format(point.current, 4)}</td>
                    <td>{format(point.powerFactor, 4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  const activeLabel = sections.find(
    section => section.id === activeSection
  )?.label;

  return (
    <div className="page-content advanced-ac-page">
      <div className="page-title">
        <div className="eyebrow">
          ENGINEERING TOOLS / ADVANCED AC ANALYSIS
        </div>
        <h1>Advanced AC Analyzer</h1>
        <p>
          Explore parallel RLC circuits, resonance, phasors,
          quality factor and frequency response.
        </p>
      </div>

      <div className="ac-info-banner">
        <div className="tool-icon orange">
          <Waves size={22} />
        </div>
        <div>
          <h3>Advanced AC Engineering Workspace</h3>
          <p>
            Five independent analysis tools for sinusoidal
            steady-state circuit calculations.
          </p>
        </div>
      </div>

      <div className="advanced-ac-tabs">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`advanced-ac-tab ${activeSection === id ? 'active' : ''}`}
            onClick={() => changeSection(id)}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="analyzer-layout">
        <section className="panel input-panel">
          <div className="panel-heading">
            <div className="tool-icon blue">
              <Calculator size={21} />
            </div>
            <div>
              <h3>{activeLabel} Parameters</h3>
              <p>Enter the required engineering values</p>
            </div>
          </div>

          {renderInputs()}

          <button
            className="primary-button calculate-button"
            type="button"
            onClick={calculate}
          >
            <Play size={16} />
            Calculate Results
          </button>

          <button
            className="ac-reset-button"
            type="button"
            onClick={reset}
          >
            <RotateCcw size={14} />
            Reset parameters
          </button>

          <p className="helper-text">
            Inductance is entered in mH and capacitance in µF.
            Internal calculations use SI units.
          </p>
        </section>

        <ResultPanel
          title="Advanced Analysis Results"
          subtitle="Calculated electrical parameters"
        >
          {error ? (
            <div className="empty-results">
              <div className="empty-icon">
                <Activity size={30} />
              </div>
              <h3>Analysis Error</h3>
              <p>{error}</p>
            </div>
          ) : (
            renderResults()
          )}
        </ResultPanel>
      </div>

      <div className="notice">
        <Target size={19} />
        <p>
          <strong>Engineering note:</strong> These tools use ideal
          lumped-element RLC models under sinusoidal steady-state
          conditions. Practical component losses, parasitics and
          source impedance are not included.
        </p>
      </div>
    </div>
  );
}

export default AdvancedACAnalyzer;
