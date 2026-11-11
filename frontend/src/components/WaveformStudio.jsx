
import { useMemo, useState } from 'react';
import {
  Waves, Activity, Settings2, RotateCcw,
  TrendingUp, Zap
} from 'lucide-react';

import { generateWaveform } from '../waveform/waveformEngine';

const waveformTypes = [
  { id: 'sine', label: 'Sine Wave' },
  { id: 'square', label: 'Square Wave' },
  { id: 'triangle', label: 'Triangle Wave' },
  { id: 'sawtooth', label: 'Sawtooth Wave' }
];

function WaveformStudio() {
  const [type, setType] = useState('sine');
  const [amplitude, setAmplitude] = useState(5);
  const [frequency, setFrequency] = useState(50);
  const [phase, setPhase] = useState(0);
  const [offset, setOffset] = useState(0);
  const [cycles, setCycles] = useState(2);

  const points = useMemo(() => {
    try {
      return generateWaveform({
        type,
        amplitude,
        frequency,
        phase,
        offset,
        cycles,
        samples: 1000
      });
    } catch {
      return [];
    }
  }, [type, amplitude, frequency, phase, offset, cycles]);

  const graph = {
    width: 900,
    height: 360,
    left: 65,
    right: 25,
    top: 25,
    bottom: 45
  };

  const graphWidth = graph.width - graph.left - graph.right;
  const graphHeight = graph.height - graph.top - graph.bottom;

  const values = points.map(point => point.value);
  const range = Math.max(
    1,
    Math.abs(amplitude) + Math.abs(offset),
    ...values.map(value => Math.abs(value))
  ) * 1.15;

  const xPosition = index =>
    graph.left + (index / Math.max(points.length - 1, 1)) * graphWidth;

  const yPosition = value =>
    graph.top + ((range - value) / (2 * range)) * graphHeight;

  const path = points.map((point, index) =>
    `${index === 0 ? 'M' : 'L'} ${xPosition(index).toFixed(2)} ${yPosition(point.value).toFixed(2)}`
  ).join(' ');

  const zeroY = yPosition(0);
  const offsetY = yPosition(offset);

  const resetControls = () => {
    setType('sine');
    setAmplitude(5);
    setFrequency(50);
    setPhase(0);
    setOffset(0);
    setCycles(2);
  };

  const controls = [
    {
      label: 'Amplitude',
      value: amplitude,
      unit: 'V',
      min: 0,
      max: 20,
      step: 0.5,
      onChange: setAmplitude
    },
    {
      label: 'Frequency',
      value: frequency,
      unit: 'Hz',
      min: 1,
      max: 1000,
      step: 1,
      onChange: setFrequency
    },
    {
      label: 'Phase',
      value: phase,
      unit: '°',
      min: 0,
      max: 360,
      step: 5,
      onChange: setPhase
    },
    {
      label: 'DC Offset',
      value: offset,
      unit: 'V',
      min: -10,
      max: 10,
      step: 0.5,
      onChange: setOffset
    },
    {
      label: 'Cycles',
      value: cycles,
      unit: '',
      min: 1,
      max: 10,
      step: 1,
      onChange: setCycles
    }
  ];

  return (
    <div className="page-content waveform-page">
      <div className="page-title">
        <div className="eyebrow">ENGINEERING TOOLS / SIGNAL ANALYSIS</div>
        <h1>Waveform Studio</h1>
        <p>Generate and visualize electrical signals with interactive controls.</p>
      </div>

      <div className="waveform-summary">
        <div className="waveform-summary-icon">
          <Waves size={23} />
        </div>
        <div>
          <h3>Signal Generator</h3>
          <p>Interactive mathematical waveform visualization</p>
        </div>
        <span className="waveform-live">
          <span /> LIVE
        </span>
      </div>

      <section className="panel waveform-chart-panel">
        <div className="waveform-panel-heading">
          <div>
            <h3><Activity size={18} /> Signal Visualization</h3>
            <p>{waveformTypes.find(item => item.id === type)?.label}</p>
          </div>
          <span className="waveform-voltage">
            {amplitude.toFixed(1)} V
          </span>
        </div>

        <div className="waveform-svg-wrapper">
          <svg
            viewBox={`0 0 ${graph.width} ${graph.height}`}
            className="waveform-svg"
            role="img"
            aria-label={`${type} waveform with amplitude ${amplitude} volts and frequency ${frequency} hertz`}
          >
            {Array.from({ length: 9 }, (_, i) => {
              const x = graph.left + (i / 8) * graphWidth;
              return (
                <line
                  key={`v-${i}`}
                  x1={x}
                  y1={graph.top}
                  x2={x}
                  y2={graph.height - graph.bottom}
                  stroke="#263750"
                  strokeWidth="1"
                />
              );
            })}

            {Array.from({ length: 7 }, (_, i) => {
              const y = graph.top + (i / 6) * graphHeight;
              return (
                <line
                  key={`h-${i}`}
                  x1={graph.left}
                  y1={y}
                  x2={graph.width - graph.right}
                  y2={y}
                  stroke="#263750"
                  strokeWidth="1"
                />
              );
            })}

            <line
              x1={graph.left}
              y1={zeroY}
              x2={graph.width - graph.right}
              y2={zeroY}
              stroke="#8193ad"
              strokeDasharray="5 5"
              strokeWidth="1.4"
            />

            {offset !== 0 && (
              <line
                x1={graph.left}
                y1={offsetY}
                x2={graph.width - graph.right}
                y2={offsetY}
                stroke="#e9b96d"
                strokeDasharray="5 5"
                strokeWidth="1.4"
              />
            )}

            <path
              d={path}
              fill="none"
              stroke="#60adff"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            <text
              x="12"
              y={graph.top + 5}
              fill="#91a4bd"
              fontSize="12"
            >
              V
            </text>

            <text
              x={graph.width - 20}
              y={graph.height - 10}
              fill="#91a4bd"
              fontSize="12"
              textAnchor="end"
            >
              Time (s)
            </text>

            <text
              x={graph.left - 10}
              y={zeroY + 4}
              fill="#91a4bd"
              fontSize="11"
              textAnchor="end"
            >
              0
            </text>
          </svg>
        </div>

        <div className="waveform-legend">
          <span><i className="legend-signal" /> Generated signal</span>
          <span><i className="legend-zero" /> Zero reference</span>
          {offset !== 0 && (
            <span><i className="legend-offset" /> DC offset</span>
          )}
        </div>
      </section>

      <div className="waveform-workspace">
        <section className="panel waveform-controls-panel">
          <div className="waveform-section-heading">
            <Settings2 size={19} />
            <div>
              <h3>Signal Configuration</h3>
              <p>Customize your waveform parameters</p>
            </div>
          </div>

          <label className="waveform-label">Waveform Type</label>

          <div className="waveform-type-grid">
            {waveformTypes.map(item => (
              <button
                key={item.id}
                className={`waveform-type-button ${type === item.id ? 'selected' : ''}`}
                onClick={() => setType(item.id)}
              >
                <Waves size={16} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="waveform-sliders">
            {controls.map(control => (
              <div className="waveform-control" key={control.label}>
                <div className="waveform-control-heading">
                  <label htmlFor={`wave-${control.label}`}>
                    {control.label}
                  </label>
                  <strong>
                    {control.value}{control.unit ? ` ${control.unit}` : ''}
                  </strong>
                </div>

                <input
                  id={`wave-${control.label}`}
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={control.value}
                  onChange={event =>
                    control.onChange(Number(event.target.value))
                  }
                />

                <div className="waveform-range-labels">
                  <span>{control.min}</span>
                  <span>{control.max}</span>
                </div>
              </div>
            ))}
          </div>

          <button className="waveform-reset-button" onClick={resetControls}>
            <RotateCcw size={15} /> Reset parameters
          </button>
        </section>

        <section className="panel waveform-metrics-panel">
          <div className="waveform-section-heading">
            <TrendingUp size={19} />
            <div>
              <h3>Signal Parameters</h3>
              <p>Calculated signal properties</p>
            </div>
          </div>

          <div className="waveform-metric">
            <span>Peak amplitude</span>
            <strong>{amplitude.toFixed(2)} V</strong>
          </div>

          <div className="waveform-metric">
            <span>Frequency</span>
            <strong>{frequency} Hz</strong>
          </div>

          <div className="waveform-metric">
            <span>Time period</span>
            <strong>{(1 / frequency * 1000).toFixed(3)} ms</strong>
          </div>

          <div className="waveform-metric">
            <span>Phase shift</span>
            <strong>{phase}°</strong>
          </div>

          <div className="waveform-metric">
            <span>DC offset</span>
            <strong>{offset.toFixed(2)} V</strong>
          </div>

          <div className="waveform-metric">
            <span>Number of cycles</span>
            <strong>{cycles}</strong>
          </div>

          <div className="waveform-info-note">
            <Zap size={17} />
            <p>
              Adjust the controls to see how signal amplitude, frequency,
              phase and offset affect the generated waveform.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default WaveformStudio;
