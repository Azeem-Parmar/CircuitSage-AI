import { useMemo, useState } from 'react';
import {
  Activity,
  Waves,
  Gauge,
  BarChart3,
  GitCompareArrows,
  Play,
  RotateCcw,
  Zap
} from 'lucide-react';

import { analyzeSeriesRLC } from './acCircuitEngine';
import {
  analyzeParallelRLC,
  analyzeFrequencyResponse,
  analyzePhasor
} from './advancedAcEngine';

import './acSimulationStudio.css';

const DEFAULTS = {
  voltage: '12',
  frequency: '50',
  resistance: '100',
  inductance: '100',
  capacitance: '100',
  startFrequency: '10',
  endFrequency: '500',
  points: '80'
};

const TABS = [
  { id: 'waveform', label: 'Waveform Simulator', icon: Waves },
  { id: 'power', label: 'Phase & Power', icon: Gauge },
  { id: 'frequency', label: 'Frequency Response', icon: BarChart3 },
  { id: 'comparison', label: 'Series vs Parallel', icon: GitCompareArrows }
];

function number(value) {
  return Number(value);
}

function makeWavePath(amplitude, phase, color, width = 600, height = 210) {
  const center = height / 2;
  const scale = height * 0.37;
  const samples = 180;

  const points = Array.from({ length: samples + 1 }, (_, index) => {
    const x = (index / samples) * width;
    const angle = (index / samples) * Math.PI * 4;
    const y = center - Math.sin(angle - phase) * scale * amplitude;
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  });

  return (
    <path
      d={points.join(' ')}
      fill="none"
      stroke={color}
      strokeWidth="2.8"
      strokeLinecap="round"
    />
  );
}

function makeGraphPath(data, key, width = 640, height = 260) {
  if (!data?.length) return '';

  const values = data.map(point => point[key]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return data.map((point, index) => {
    const x = (index / Math.max(data.length - 1, 1)) * width;
    const y = height - 18 - ((point[key] - min) / range) * (height - 36);
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');
}

function InputField({ label, value, unit, onChange, min = '0.000001', step = 'any' }) {
  return (
    <label className="simulation-field">
      <span>{label}</span>
      <div className="simulation-input-wrap">
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={event => onChange(event.target.value)}
        />
        <small>{unit}</small>
      </div>
    </label>
  );
}

function Metric({ label, value, unit = '', accent = '' }) {
  return (
    <div className="simulation-metric">
      <span>{label}</span>
      <strong className={accent}>{value} <small>{unit}</small></strong>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="simulation-empty">
      <Activity size={28} />
      <strong>Simulation not calculated</strong>
      <span>{message}</span>
    </div>
  );
}

function PhasorDiagram({ results, topology }) {
  const isSeries = topology === 'series';

  // Series: current is the reference; display voltage phasors.
  // Parallel: supply voltage is the reference; display current phasors.
  const vectors = isSeries
    ? [
        {
          label: 'Resistor voltage',
          symbol: 'V_R',
          real: results.current * results.resistance,
          imaginary: 0,
          color: '#42d3a7'
        },
        {
          label: 'Inductor voltage',
          symbol: 'V_L',
          real: 0,
          imaginary: results.current * results.inductiveReactance,
          color: '#65b5ff'
        },
        {
          label: 'Capacitor voltage',
          symbol: 'V_C',
          real: 0,
          imaginary: -results.current * results.capacitiveReactance,
          color: '#e6aa55'
        },
        {
          label: 'Supply voltage',
          symbol: 'V_S',
          real: results.current * results.resistance,
          imaginary: results.current * results.netReactance,
          color: '#c59aff'
        }
      ]
    : [
        {
          label: 'Supply voltage reference',
          symbol: 'V',
          real: results.voltage,
          imaginary: 0,
          color: '#c59aff'
        },
        {
          label: 'Resistor current',
          symbol: 'I_R',
          real: results.resistorCurrent,
          imaginary: 0,
          color: '#42d3a7'
        },
        {
          label: 'Inductor current',
          symbol: 'I_L',
          real: 0,
          imaginary: -results.inductorCurrent,
          color: '#65b5ff'
        },
        {
          label: 'Capacitor current',
          symbol: 'I_C',
          real: 0,
          imaginary: results.capacitorCurrent,
          color: '#e6aa55'
        },
        {
          label: 'Total current',
          symbol: 'I_T',
          real: results.resistorCurrent,
          imaginary: results.netReactiveCurrent,
          color: '#c59aff'
        }
      ];

  const phasors = vectors.map(vector => ({
    ...vector,
    ...analyzePhasor({
      real: vector.real,
      imaginary: vector.imaginary
    })
  }));

  const maximum = Math.max(
    ...phasors.map(phasor => phasor.magnitude),
    1e-12
  );

  const scale = 100 / maximum;
  const originX = 125;
  const originY = 132;

  const resultant = isSeries
    ? phasors.find(phasor => phasor.symbol === 'V_S')
    : phasors.find(phasor => phasor.symbol === 'I_T');

  const unit = isSeries ? 'V' : 'A';

  return (
    <div className="simulation-chart-card">
      <div className="simulation-chart-heading">
        <div>
          <h3>Phasor Diagram</h3>
          <p>
            {isSeries
              ? 'Voltage phasors with current as reference'
              : 'Branch current phasors with voltage as reference'}
          </p>
        </div>
        <span className="simulation-chart-tag">
          {topology.toUpperCase()} RLC
        </span>
      </div>

      <svg
        className="simulation-svg simulation-phasor-svg"
        viewBox="0 0 360 265"
        role="img"
        aria-label={`${topology} RLC phasor diagram showing ${phasors.length} vectors`}
      >
        <defs>
          {phasors.map((phasor, index) => (
            <marker
              key={phasor.symbol}
              id={`phasor-arrow-${index}`}
              markerWidth="7"
              markerHeight="7"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path
                d="M0,0 L6,3 L0,6"
                fill="none"
                stroke={phasor.color}
                strokeWidth="1"
              />
            </marker>
          ))}
        </defs>

        <line
          x1="15" y1={originY} x2="340" y2={originY}
          stroke="#52647d" strokeWidth="1"
        />
        <line
          x1={originX} y1="12" x2={originX} y2="245"
          stroke="#52647d" strokeWidth="1"
        />

        <text x="326" y={originY + 16} fill="#91a4bd" fontSize="10">Real</text>
        <text x={originX + 7} y="20" fill="#91a4bd" fontSize="10">+j</text>
        <text x={originX + 7} y="242" fill="#91a4bd" fontSize="10">−j</text>

        {phasors.map((phasor, index) => {
          const x = originX + phasor.real * scale;
          const y = originY - phasor.imaginary * scale;
          const labelX = x + (phasor.real >= 0 ? 7 : -7);
          const labelY = y + (phasor.imaginary >= 0 ? -8 : 15);

          return (
            <g key={phasor.symbol}>
              <line
                x1={originX}
                y1={originY}
                x2={x}
                y2={y}
                stroke={phasor.color}
                strokeWidth={phasor.symbol === (isSeries ? 'V_S' : 'I_T') ? 3.5 : 2.3}
                strokeLinecap="round"
                markerEnd={`url(#phasor-arrow-${index})`}
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor={phasor.real < 0 ? 'end' : 'start'}
                fill={phasor.color}
                fontSize="10"
                fontWeight="600"
              >
                {phasor.symbol}
              </text>
            </g>
          );
        })}

        <circle cx={originX} cy={originY} r="3" fill="#dce7f5" />
        <text x={originX - 12} y={originY + 17} fill="#91a4bd" fontSize="9">O</text>
      </svg>

      <div className="simulation-phasor-list">
        {phasors.map(phasor => (
          <div className="simulation-phasor-row" key={phasor.symbol}>
            <span>
              <i style={{ background: phasor.color }} />
              {phasor.label}
            </span>
            <strong>
              {phasor.magnitude.toFixed(4)} {unit}
              <small>{phasor.phaseAngleDegrees.toFixed(2)}°</small>
            </strong>
          </div>
        ))}
      </div>

      <div className="simulation-phase-summary">
        <strong>{resultant.phaseAngleDegrees.toFixed(2)}°</strong>
        <span>
          Resultant {isSeries ? 'supply voltage' : 'total current'}
        </span>
        <p>
          Magnitude: {resultant.magnitude.toFixed(4)} {unit}
        </p>
      </div>
    </div>
  );
}

function ImpedanceTriangle({ results, topology }) {
  const resistance = topology === 'series'
    ? results.resistance
    : results.impedance * Math.cos(results.phaseAngleRadians);

  const reactance = topology === 'series'
    ? results.netReactance
    : results.impedance * Math.sin(results.phaseAngleRadians);

  const impedance = results.impedance;

  const scale = Math.min(
    210 / Math.max(impedance, 1e-12),
    82 / Math.max(Math.abs(reactance), 1e-12)
  );

  const originX = 55;
  const originY = 135;
  const endX = originX + resistance * scale;
  const endY = originY - reactance * scale;

  return (
    <div className="simulation-chart-card">
      <div className="simulation-chart-heading">
        <div>
          <h3>Impedance Triangle</h3>
          <p>Resistance, reactance and total impedance</p>
        </div>
        <span className="simulation-chart-tag">
          {topology.toUpperCase()} RLC
        </span>
      </div>

      <svg
        className="simulation-svg simulation-triangle-svg"
        viewBox="0 0 340 190"
        role="img"
        aria-label="Impedance triangle showing resistance, signed reactance and impedance"
      >
        <line x1="25" y1={originY} x2="315" y2={originY}
          stroke="#52647d" strokeWidth="1" />
        <line x1={originX} y1="12" x2={originX} y2="178"
          stroke="#52647d" strokeWidth="1" />

        <line x1={originX} y1={originY} x2={endX} y2={originY}
          stroke="#42d3a7" strokeWidth="3" />
        <line x1={endX} y1={originY} x2={endX} y2={endY}
          stroke="#e6aa55" strokeWidth="3" />
        <line x1={originX} y1={originY} x2={endX} y2={endY}
          stroke="#65b5ff" strokeWidth="3" />

        <text x={(originX + endX) / 2} y={originY + 17}
          textAnchor="middle" fill="#42d3a7" fontSize="11">R</text>
        <text x={Math.min(endX + 8, 290)}
          y={Math.max(14, Math.min(endY - 7, 176))}
          fill="#e6aa55" fontSize="11">X</text>
        <text x={(originX + endX) / 2 + 5}
          y={(originY + endY) / 2 - 7}
          fill="#65b5ff" fontSize="11">Z</text>
        <text x="15" y="15" fill="#91a4bd" fontSize="9">+X</text>
        <text x="15" y="181" fill="#91a4bd" fontSize="9">−X</text>
      </svg>

      <div className="simulation-metric-grid">
        <Metric label="Resistance" value={resistance.toFixed(4)} unit="Ω" />
        <Metric label="Net reactance" value={reactance.toFixed(4)} unit="Ω" />
        <Metric label="Impedance" value={impedance.toFixed(4)} unit="Ω" />
        <Metric label="Phase angle" value={results.phaseAngleDegrees.toFixed(2)} unit="°" />
      </div>
    </div>
  );
}

function PowerTriangle({ results }) {
  const p = results.realPower;
  const q = results.reactivePower;
  const s = results.apparentPower;

  const originX = 45;
  const originY = 135;

  const scale = Math.min(
    210 / Math.max(s, 1e-12),
    q === 0 ? Infinity : 95 / Math.abs(q)
  );

  const x = originX + p * scale;
  const y = originY - q * scale;

  return (
    <div className="simulation-chart-card">
      <div className="simulation-chart-heading">
        <div>
          <h3>Power Triangle</h3>
          <p>Real, reactive and apparent power</p>
        </div>
        <span className="simulation-chart-tag">RMS values</span>
      </div>

      <svg
        className="simulation-svg simulation-power-svg"
        viewBox="0 0 340 270"
        role="img"
        aria-label={`Power triangle: ${p.toFixed(2)} watts real power, ${q.toFixed(2)} VAR reactive power, and ${s.toFixed(2)} VA apparent power`}
      >
        <line x1="25" y1={originY} x2="315" y2={originY}
          stroke="#52647d" strokeWidth="1.2" />
        <line x1={originX} y1="20" x2={originX} y2="250"
          stroke="#52647d" strokeWidth="1.2" />

        <line
          x1={originX}
          y1={originY}
          x2={x}
          y2={originY}
          stroke="#38c9a2"
          strokeWidth="3"
        />

        <line
          x1={x}
          y1={originY}
          x2={x}
          y2={y}
          stroke="#e6aa55"
          strokeWidth="3"
        />

        <line
          x1={originX}
          y1={originY}
          x2={x}
          y2={y}
          stroke="#65b5ff"
          strokeWidth="3"
        />

        <text x={originX - 10} y={originY + 16}
          fill="#aabbd1" fontSize="10">0</text>

        <text x={(originX + x) / 2} y={originY + 17}
          textAnchor="middle" fill="#38c9a2" fontSize="11">P</text>

        <text x={Math.min(x + 7, 295)}
          y={q >= 0 ? Math.max(18, y - 8) : Math.min(258, y + 15)}
          fill="#e6aa55" fontSize="11">Q</text>

        <text x={(originX + x) / 2 + 5}
          y={(originY + y) / 2 - (q >= 0 ? 8 : -14)}
          fill="#65b5ff" fontSize="11">S</text>

        <text x="180" y="263" fill="#8fa4bd" fontSize="10">
          Real power (W)
        </text>

        <text x="8" y="17" fill="#8fa4bd" fontSize="10">
          +Q
        </text>

        <text x="8" y="260" fill="#8fa4bd" fontSize="10">
          −Q
        </text>
      </svg>

      <div className="simulation-legend">
        <span><i className="legend-real" /> Real power</span>
        <span><i className="legend-reactive" /> Reactive power</span>
        <span><i className="legend-apparent" /> Apparent power</span>
      </div>

      <div className="simulation-metric-grid">
        <Metric label="Real power" value={p.toFixed(3)} unit="W" />
        <Metric label="Reactive power" value={q.toFixed(3)} unit="VAR" />
        <Metric label="Apparent power" value={s.toFixed(3)} unit="VA" />
        <Metric label="Power factor" value={results.powerFactor.toFixed(4)} />
      </div>
    </div>
  );
}

function ACSimulationStudio() {
  const [tab, setTab] = useState('waveform');
  const [inputs, setInputs] = useState(DEFAULTS);
  const [topology, setTopology] = useState('series');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const update = (key, value) => {
    setInputs(previous => ({ ...previous, [key]: value }));
    setResults(null);
    setError('');
  };

  const calculate = () => {
    setError('');
    setResults(null);

    try {
      const values = {
        voltage: number(inputs.voltage),
        frequency: number(inputs.frequency),
        resistance: number(inputs.resistance),
        inductance: number(inputs.inductance) / 1000,
        capacitance: number(inputs.capacitance) / 1000000
      };

      const series = analyzeSeriesRLC(values);
      const parallel = analyzeParallelRLC(values);

      const frequencyResponse = analyzeFrequencyResponse({
        ...values,
        startFrequency: number(inputs.startFrequency),
        endFrequency: number(inputs.endFrequency),
        points: number(inputs.points),
        topology
      });

      setResults({ series, parallel, frequencyResponse });
    } catch (err) {
      setError(err.message || 'Unable to run AC simulation.');
    }
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setTopology('series');
    setResults(null);
    setError('');
  };

  const activeResults = results
    ? (topology === 'series' ? results.series : results.parallel)
    : null;

  const waveform = useMemo(() => {
    if (!results) return null;

    const data = results.series;
    const phase = data.phaseAngleRadians;
    const peakVoltage = data.voltage * Math.sqrt(2);
    const peakCurrent = data.current * Math.sqrt(2);

    return { phase, peakVoltage, peakCurrent, ...data };
  }, [results]);

  const responseData = results?.frequencyResponse.frequencyData || [];
  const impedancePath = makeGraphPath(responseData, 'impedance');
  const currentPath = makeGraphPath(responseData, 'current');

  const resonance = results?.frequencyResponse;
  const resonanceInRange = resonance?.resonanceInRange ?? false;

  const nearestResonanceSample = resonanceInRange
    ? responseData.reduce((nearest, point) =>
        Math.abs(point.frequency - resonance.resonantFrequency) <
        Math.abs(nearest.frequency - resonance.resonantFrequency)
          ? point
          : nearest
      , responseData[0])
    : null;

  const graphY = (key, value) => {
    const values = responseData.map(point => point[key]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    return 260 - 18 - ((value - min) / range) * (260 - 36);
  };

  const resonanceX = resonanceInRange
    ? ((resonance.resonantFrequency - responseData[0].frequency) /
        (responseData[responseData.length - 1].frequency -
          responseData[0].frequency)) * 640
    : null;

  const resonanceImpedanceY = nearestResonanceSample
    ? graphY('impedance', nearestResonanceSample.impedance)
    : null;

  const resonanceCurrentY = nearestResonanceSample
    ? graphY('current', nearestResonanceSample.current)
    : null;

  return (
    <div className="page-content simulation-page">
      <div className="page-title">
        <div className="eyebrow">ENGINEERING TOOLS / AC SIMULATION</div>
        <h1>AC Simulation Studio</h1>
        <p>Visualize AC waveforms, phase relationships, power and frequency response.</p>
      </div>

      <div className="simulation-banner">
        <div className="simulation-banner-icon"><Zap size={22} /></div>
        <div>
          <h3>Interactive AC Engineering Lab</h3>
          <p>Explore ideal series and parallel RLC behavior using calculated circuit parameters.</p>
        </div>
      </div>

      <section className="panel simulation-controls">
        <div className="panel-heading">
          <div className="tool-icon blue"><Gauge size={21} /></div>
          <div>
            <h3>Circuit Parameters</h3>
            <p>Enter values to generate the simulation</p>
          </div>
        </div>

        <div className="simulation-input-grid">
          <InputField label="RMS Voltage" value={inputs.voltage} unit="V" onChange={v => update('voltage', v)} />
          <InputField label="Frequency" value={inputs.frequency} unit="Hz" onChange={v => update('frequency', v)} />
          <InputField label="Resistance" value={inputs.resistance} unit="Ω" onChange={v => update('resistance', v)} />
          <InputField label="Inductance" value={inputs.inductance} unit="mH" onChange={v => update('inductance', v)} />
          <InputField label="Capacitance" value={inputs.capacitance} unit="µF" onChange={v => update('capacitance', v)} />
          <InputField label="Sweep start" value={inputs.startFrequency} unit="Hz" onChange={v => update('startFrequency', v)} />
          <InputField label="Sweep end" value={inputs.endFrequency} unit="Hz" onChange={v => update('endFrequency', v)} />
          <InputField label="Graph points" value={inputs.points} unit="samples" step="1" onChange={v => update('points', v)} />
        </div>

        <div className="simulation-control-footer">
          <label className="simulation-select-label">
            Frequency response topology
            <select value={topology} onChange={event => { setTopology(event.target.value); setResults(null); }}>
              <option value="series">Series RLC</option>
              <option value="parallel">Parallel RLC</option>
            </select>
          </label>
          <div className="simulation-actions">
            <button type="button" className="primary-button" onClick={calculate}>
              <Play size={16} /> Run Simulation
            </button>
            <button type="button" className="ac-reset-button" onClick={reset}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>
        {error && <p className="simulation-error">{error}</p>}
      </section>

      <div className="simulation-tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            className={tab === id ? 'active' : ''}
            onClick={() => setTab(id)}
          >
            <Icon size={16} /><span>{label}</span>
          </button>
        ))}
      </div>

      {!results ? (
        <EmptyState message="Enter circuit parameters and select Run Simulation to explore the visualizations." />
      ) : (
        <>
          {tab === 'waveform' && (
            <div className="simulation-content-grid">
              <section className="panel simulation-chart-card">
                <div className="simulation-chart-heading">
                  <div><h3>Voltage & Current Waveforms</h3><p>Two cycles of sinusoidal steady-state response</p></div>
                  <span className="simulation-chart-tag">{waveform.circuitType}</span>
                </div>
                <svg className="simulation-wave-svg" viewBox="0 0 600 210" role="img" aria-label="Voltage and current sinusoidal waveforms">
                  <line x1="0" y1="105" x2="600" y2="105" stroke="#42536b" strokeDasharray="5 5" />
                  {[0, 1, 2, 3, 4].map(n => <line key={n} x1={n * 150} y1="8" x2={n * 150} y2="202" stroke="#28394f" strokeDasharray="3 6" />)}
                  {makeWavePath(1, 0, '#65b5ff')}
                  {makeWavePath(0.72, waveform.phase, '#42d3a7')}
                </svg>
                <div className="simulation-legend">
                  <span><i className="legend-voltage" /> Voltage</span>
                  <span><i className="legend-current" /> Current (normalized)</span>
                </div>
                <div className="simulation-metric-grid">
                  <Metric label="Peak voltage" value={waveform.peakVoltage.toFixed(3)} unit="V" />
                  <Metric label="Peak current" value={waveform.peakCurrent.toFixed(4)} unit="A" />
                  <Metric label="Phase angle" value={waveform.phaseAngleDegrees.toFixed(2)} unit="°" />
                  <Metric label="Power factor" value={waveform.powerFactor.toFixed(4)} />
                </div>
                <p className="simulation-note">Current is normalized for display. Its phase shift is calculated from the series RLC impedance angle.</p>
              </section>
            </div>
          )}

          {tab === 'power' && (
            <div className="simulation-content-grid">
              <ImpedanceTriangle
                results={activeResults}
                topology={topology}
              />

              <PowerTriangle results={activeResults} />

              <PhasorDiagram
                results={activeResults}
                topology={topology}
              />

              <section className="panel simulation-chart-card">
                <div className="simulation-chart-heading">
                  <div>
                    <h3>Phase Relationship</h3>
                    <p>{topology.toUpperCase()} RLC voltage-current phase</p>
                  </div>
                  <span className="simulation-chart-tag">
                    {activeResults.circuitType}
                  </span>
                </div>

                <div className="simulation-phase-summary">
                  <strong>{activeResults.phaseAngleDegrees.toFixed(2)}°</strong>
                  <span>{activeResults.circuitType} behavior</span>
                  <p>
                    {activeResults.circuitType === 'Inductive'
                      ? 'Current lags the applied voltage.'
                      : activeResults.circuitType === 'Capacitive'
                        ? 'Current leads the applied voltage.'
                        : 'Voltage and current are in phase.'}
                  </p>
                </div>

                <div className="simulation-metric-grid">
                  <Metric
                    label="Power factor"
                    value={activeResults.powerFactor.toFixed(4)}
                  />
                  <Metric
                    label="Impedance"
                    value={activeResults.impedance.toFixed(3)}
                    unit="Ω"
                  />
                  <Metric
                    label="RMS current"
                    value={(topology === 'series'
                      ? activeResults.current
                      : activeResults.totalCurrent).toFixed(4)}
                    unit="A"
                  />
                  <Metric
                    label="Reactive power"
                    value={activeResults.reactivePower.toFixed(3)}
                    unit="VAR"
                  />
                </div>

                <section className="simulation-insights">
                  <div className="simulation-chart-heading">
                    <div>
                      <h3>Engineering Insights</h3>
                      <p>Automatic interpretation of calculated circuit behavior</p>
                    </div>
                    <span className="simulation-chart-tag">LIVE ANALYSIS</span>
                  </div>

                  <div className="simulation-insight-list">
                    <article className="simulation-insight">
                      <strong>Circuit behavior</strong>
                      <p>
                        {activeResults.circuitType === 'Inductive'
                          ? 'The circuit is inductive. Its net reactance is positive.'
                          : activeResults.circuitType === 'Capacitive'
                            ? 'The circuit is capacitive. Its net reactance is negative.'
                            : 'The circuit is resistive at the operating frequency. Its net reactive effect is approximately zero.'}
                      </p>
                    </article>

                    <article className="simulation-insight">
                      <strong>Voltage-current relationship</strong>
                      <p>
                        {activeResults.circuitType === 'Inductive'
                          ? 'Current lags voltage because the inductive effect dominates.'
                          : activeResults.circuitType === 'Capacitive'
                            ? 'Current leads voltage because the capacitive effect dominates.'
                            : 'Voltage and current are approximately in phase.'}
                        {' '}The phase difference is {Math.abs(activeResults.phaseAngleDegrees).toFixed(2)}°.
                      </p>
                    </article>

                    <article className="simulation-insight">
                      <strong>Power factor</strong>
                      <p>
                        The power factor is {activeResults.powerFactor.toFixed(4)}.
                        {' '}This means approximately {(activeResults.powerFactor * 100).toFixed(2)}% of apparent power is represented by real power.
                        {' '}The circuit has a {activeResults.circuitType.toLowerCase()} power-factor characteristic.
                      </p>
                    </article>

                    <article className="simulation-insight">
                      <strong>Resonance assessment</strong>
                      <p>
                        {activeResults.inductance > 0 && activeResults.capacitance > 0
                          ? (() => {
                              const resonantFrequency =
                                1 / (2 * Math.PI * Math.sqrt(
                                  activeResults.inductance * activeResults.capacitance
                                ));
                              const deviation = Math.abs(
                                activeResults.frequency - resonantFrequency
                              ) / resonantFrequency * 100;

                              return `Theoretical resonance is ${resonantFrequency.toFixed(3)} Hz. The operating frequency differs by ${deviation.toFixed(2)}%. ${
                                deviation <= 1
                                  ? 'The circuit is operating very close to resonance.'
                                  : deviation <= 5
                                    ? 'The circuit is operating near resonance.'
                                    : 'The circuit is away from its resonant frequency.'
                              }`;
                            })()
                          : 'The theoretical RLC resonant frequency is unavailable because both inductance and capacitance must be positive.'}
                      </p>
                    </article>

                    <article className="simulation-insight">
                      <strong>Reactive power</strong>
                      <p>
                        {Math.abs(activeResults.reactivePower) < 1e-10
                          ? 'Reactive power is approximately zero, indicating negligible net reactive energy exchange.'
                          : activeResults.reactivePower > 0
                            ? 'Reactive power is positive, indicating inductive reactive behavior.'
                            : 'Reactive power is negative, indicating capacitive reactive behavior.'}
                        {' '}Calculated reactive power: {activeResults.reactivePower.toFixed(4)} VAR.
                      </p>
                    </article>
                  </div>
                </section>
              </section>
            </div>
          )}

          {tab === 'frequency' && (
            <section className="panel simulation-chart-card">
              <div className="simulation-chart-heading">
                <div><h3>Frequency Response</h3><p>{topology.toUpperCase()} RLC · {responseData.length} calculated samples</p></div>
                <span className="simulation-chart-tag">Linear sweep</span>
              </div>
              <div className="simulation-graph-legend">
                <span><i className="legend-impedance" /> Impedance (Ω)</span>
                <span><i className="legend-current" /> Current (A)</span>
              </div>
              <svg className="simulation-response-svg" viewBox="0 0 640 260" role="img" aria-label="Frequency response graph">
                {[0, 1, 2, 3, 4].map(n => <line key={n} x1="0" y1={n * 65} x2="640" y2={n * 65} stroke="#28394f" strokeDasharray="4 5" />)}
                <path d={impedancePath} fill="none" stroke="#65b5ff" strokeWidth="3" strokeLinejoin="round" />
                <path d={currentPath} fill="none" stroke="#42d3a7" strokeWidth="3" strokeLinejoin="round" />

                {resonanceInRange && (
                  <g>
                    <line
                      x1={resonanceX}
                      y1="8"
                      x2={resonanceX}
                      y2="250"
                      stroke="#e6aa55"
                      strokeWidth="2"
                      strokeDasharray="6 5"
                    />
                    <circle
                      cx={resonanceX}
                      cy={resonanceImpedanceY}
                      r="5"
                      fill="#65b5ff"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={resonanceX}
                      cy={resonanceCurrentY}
                      r="5"
                      fill="#42d3a7"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x={Math.min(Math.max(resonanceX, 75), 565)}
                      y="17"
                      textAnchor="middle"
                      fill="#e6aa55"
                      fontSize="11"
                      fontWeight="600"
                    >
                      fr = {resonance.resonantFrequency.toFixed(2)} Hz
                    </text>
                  </g>
                )}
              </svg>
              <div className="simulation-axis-labels">
                <span>{responseData[0].frequency.toFixed(2)} Hz</span>
                <span>{responseData[responseData.length - 1].frequency.toFixed(2)} Hz</span>
              </div>
              <p className="simulation-note">Each curve is independently normalized to fit the same display area. Use the data table below for actual values.</p>

              <section className="simulation-resonance">
                <div className="simulation-chart-heading">
                  <div>
                    <h3>Resonance Analysis</h3>
                    <p>Theoretical resonance and sampled sweep extrema</p>
                  </div>
                  <span className={`simulation-resonance-status ${results.frequencyResponse.resonanceInRange ? 'is-in-range' : 'is-out-range'}`}>
                    {results.frequencyResponse.resonanceInRange
                      ? 'Resonance in sweep'
                      : 'Resonance outside sweep'}
                  </span>
                </div>

                <p className="simulation-resonance-explanation">
                  {topology === 'series'
                    ? 'Series resonance produces minimum impedance and maximum source current.'
                    : 'Parallel resonance produces maximum impedance and minimum source current.'}
                </p>

                <div className="simulation-metric-grid">
                  <Metric
                    label="Theoretical resonant frequency"
                    value={results.frequencyResponse.resonantFrequency.toFixed(3)}
                    unit="Hz"
                  />
                  <Metric
                    label={`Minimum impedance at ${results.frequencyResponse.sampledExtrema.minimumImpedance.frequency.toFixed(2)} Hz`}
                    value={results.frequencyResponse.sampledExtrema.minimumImpedance.value.toFixed(4)}
                    unit="Ω"
                  />
                  <Metric
                    label={`Maximum impedance at ${results.frequencyResponse.sampledExtrema.maximumImpedance.frequency.toFixed(2)} Hz`}
                    value={results.frequencyResponse.sampledExtrema.maximumImpedance.value.toFixed(4)}
                    unit="Ω"
                  />
                  <Metric
                    label={`Minimum current at ${results.frequencyResponse.sampledExtrema.minimumCurrent.frequency.toFixed(2)} Hz`}
                    value={results.frequencyResponse.sampledExtrema.minimumCurrent.value.toFixed(5)}
                    unit="A"
                  />
                  <Metric
                    label={`Maximum current at ${results.frequencyResponse.sampledExtrema.maximumCurrent.frequency.toFixed(2)} Hz`}
                    value={results.frequencyResponse.sampledExtrema.maximumCurrent.value.toFixed(5)}
                    unit="A"
                  />
                </div>

                <p className="simulation-note">
                  Sampled extrema are taken from the calculated frequency points and may differ from exact theoretical resonance.
                </p>
              </section>

              <div className="simulation-table-wrap">
                <table>
                  <thead><tr><th>Frequency (Hz)</th><th>Impedance (Ω)</th><th>Current (A)</th><th>Power factor</th></tr></thead>
                  <tbody>
                    {responseData.map((point, index) => (
                      <tr key={`${point.frequency}-${index}`}>
                        <td>{point.frequency.toFixed(2)}</td>
                        <td>{point.impedance.toFixed(4)}</td>
                        <td>{point.current.toFixed(5)}</td>
                        <td>{point.powerFactor.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === 'comparison' && (
            <section className="panel simulation-chart-card">
              <div className="simulation-chart-heading">
                <div><h3>Series vs Parallel RLC</h3><p>Both circuits use the same RMS source and component values</p></div>
              </div>
              <div className="simulation-comparison-grid">
                <div>
                  <h4>Series RLC</h4>
                  <Metric label="Impedance" value={results.series.impedance.toFixed(4)} unit="Ω" />
                  <Metric label="Current" value={results.series.current.toFixed(5)} unit="A" />
                  <Metric label="Phase angle" value={results.series.phaseAngleDegrees.toFixed(2)} unit="°" />
                  <Metric label="Power factor" value={results.series.powerFactor.toFixed(4)} />
                  <Metric label="Reactive power" value={results.series.reactivePower.toFixed(4)} unit="VAR" />
                  <strong className="simulation-type">{results.series.circuitType}</strong>
                </div>
                <div>
                  <h4>Parallel RLC</h4>
                  <Metric label="Impedance" value={results.parallel.impedance.toFixed(4)} unit="Ω" />
                  <Metric label="Current" value={results.parallel.totalCurrent.toFixed(5)} unit="A" />
                  <Metric label="Phase angle" value={results.parallel.phaseAngleDegrees.toFixed(2)} unit="°" />
                  <Metric label="Power factor" value={results.parallel.powerFactor.toFixed(4)} />
                  <Metric label="Reactive power" value={results.parallel.reactivePower.toFixed(4)} unit="VAR" />
                  <strong className="simulation-type">{results.parallel.circuitType}</strong>
                </div>
              </div>
              <p className="simulation-note">Ideal lumped-element models. The same component values produce different equivalent impedances and source currents depending on topology.</p>
            </section>
          )}

          {activeResults && (
            <div className="simulation-status-line">
              <CheckCircleText /> Simulation calculated successfully · {topology} frequency sweep
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CheckCircleText() {
  return <Activity size={15} aria-hidden="true" />;
}

export default ACSimulationStudio;
