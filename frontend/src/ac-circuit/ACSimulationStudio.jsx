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
  analyzeFrequencyResponse
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

function PowerTriangle({ results }) {
  const p = results.realPower;
  const q = results.reactivePower;
  const s = results.apparentPower;
  const max = Math.max(Math.abs(p), Math.abs(q), s, 1);
  const scale = 210 / max;
  const x = 45 + p * scale;
  const y = 235 - q * scale;

  return (
    <div className="simulation-chart-card">
      <div className="simulation-chart-heading">
        <div>
          <h3>Power Triangle</h3>
          <p>Real, reactive and apparent power</p>
        </div>
        <span className="simulation-chart-tag">RMS values</span>
      </div>

      <svg className="simulation-svg" viewBox="0 0 340 270" role="img" aria-label="Power triangle showing real and reactive power">
        <defs>
          <marker id="powerArrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="#65b5ff" />
          </marker>
        </defs>
        <line x1="35" y1="235" x2="310" y2="235" stroke="#52647d" strokeWidth="1.2" />
        <line x1="45" y1="250" x2="45" y2="20" stroke="#52647d" strokeWidth="1.2" />
        <line x1="45" y1="235" x2={x} y2="235" stroke="#38c9a2" strokeWidth="3" />
        <line x1={x} y1="235" x2={x} y2={y} stroke="#e6aa55" strokeWidth="3" />
        <line x1="45" y1="235" x2={x} y2={y} stroke="#65b5ff" strokeWidth="3" markerEnd="url(#powerArrow)" />
        <text x="180" y="257" fill="#8fa4bd" fontSize="10">Real power (W)</text>
        <text x="9" y="18" fill="#8fa4bd" fontSize="10">Q</text>
        <text x="48" y="224" fill="#aabbd1" fontSize="9">0</text>
        <text x={Math.min(x, 245)} y="224" fill="#38c9a2" fontSize="10">P</text>
        <text x={Math.min(x + 5, 260)} y={Math.max(16, y - 7)} fill="#e6aa55" fontSize="10">Q</text>
        <text x={Math.min(x / 2 + 45, 240)} y={Math.max(25, y / 2 + 235 / 2 - 8)} fill="#65b5ff" fontSize="10">S</text>
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
              <PowerTriangle results={results.series} />
              <section className="panel simulation-chart-card">
                <div className="simulation-chart-heading">
                  <div><h3>Phase Relationship</h3><p>Series RLC voltage-current phase</p></div>
                </div>
                <div className="simulation-phase-summary">
                  <strong>{results.series.phaseAngleDegrees.toFixed(2)}°</strong>
                  <span>{results.series.circuitType} behavior</span>
                  <p>{results.series.circuitType === 'Inductive'
                    ? 'Current lags the applied voltage.'
                    : results.series.circuitType === 'Capacitive'
                      ? 'Current leads the applied voltage.'
                      : 'Voltage and current are in phase.'}</p>
                </div>
                <div className="simulation-metric-grid">
                  <Metric label="Power factor" value={results.series.powerFactor.toFixed(4)} />
                  <Metric label="Impedance" value={results.series.impedance.toFixed(3)} unit="Ω" />
                  <Metric label="RMS current" value={results.series.current.toFixed(4)} unit="A" />
                  <Metric label="Net reactance" value={results.series.netReactance.toFixed(3)} unit="Ω" />
                </div>
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
