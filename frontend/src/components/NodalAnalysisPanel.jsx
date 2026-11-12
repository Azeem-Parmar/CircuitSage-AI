
import { useState } from 'react';
import {
  Plus,
  Trash2,
  Play,
  RotateCcw,
  Activity,
  Zap,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

import { analyzeAdvancedCircuit } from '../advanced-circuit/advancedCircuitEngine';

const createResistor = (id) => ({
  id,
  name: `R${id}`,
  fromNode: 'N1',
  toNode: 'GND',
  resistance: 100,
});

const createVoltageSource = (id) => ({
  id,
  name: `V${id}`,
  positive: 'N1',
  negative: 'GND',
  voltage: 12,
});

function ResultCard({ label, value, unit }) {
  return (
    <div className="circuit-result-card">
      <span>{label}</span>
      <strong>
        {Number(value).toFixed(6)} {unit}
      </strong>
    </div>
  );
}

export default function NodalAnalysisPanel() {
  const [groundNode, setGroundNode] = useState('GND');
  const [resistors, setResistors] = useState([
    createResistor(1),
    { ...createResistor(2), name: 'R2', fromNode: 'N1', toNode: 'N2', resistance: 200 },
    { ...createResistor(3), name: 'R3', fromNode: 'N2', toNode: 'GND', resistance: 300 },
  ]);

  const [voltageSources, setVoltageSources] = useState([
    createVoltageSource(1),
  ]);

  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [selectedExample, setSelectedExample] = useState('');

  const loadExample = (example) => {
    const examples = {
      single_node: {
        resistors: [
          { id: 1, name: 'R1', fromNode: 'N1', toNode: 'GND', resistance: 100 },
          { id: 2, name: 'R2', fromNode: 'N1', toNode: 'GND', resistance: 200 },
        ],
        voltageSources: [
          { id: 1, name: 'V1', positive: 'N1', negative: 'GND', voltage: 10 },
        ],
      },
      two_node: {
        resistors: [
          { id: 1, name: 'R1', fromNode: 'N1', toNode: 'N2', resistance: 100 },
          { id: 2, name: 'R2', fromNode: 'N2', toNode: 'GND', resistance: 200 },
          { id: 3, name: 'R3', fromNode: 'N2', toNode: 'GND', resistance: 300 },
        ],
        voltageSources: [
          { id: 1, name: 'V1', positive: 'N1', negative: 'GND', voltage: 12 },
        ],
      },
      voltage_divider: {
        resistors: [
          { id: 1, name: 'R1', fromNode: 'N1', toNode: 'N2', resistance: 100 },
          { id: 2, name: 'R2', fromNode: 'N2', toNode: 'GND', resistance: 200 },
        ],
        voltageSources: [
          { id: 1, name: 'V1', positive: 'N1', negative: 'GND', voltage: 12 },
        ],
      },
    };

    const preset = examples[example];
    if (!preset) return;

    setGroundNode('GND');
    setResistors(preset.resistors);
    setVoltageSources(preset.voltageSources);
    setResults(null);
    setError('');
    setSelectedExample(example);
  };

  const updateResistor = (id, field, value) => {
    setResistors((current) =>
      current.map((resistor) =>
        resistor.id === id ? { ...resistor, [field]: value } : resistor
      )
    );
    setResults(null);
    setError('');
  };

  const updateSource = (id, field, value) => {
    setVoltageSources((current) =>
      current.map((source) =>
        source.id === id ? { ...source, [field]: value } : source
      )
    );
    setResults(null);
    setError('');
  };

  const addResistor = () => {
    const nextId = Math.max(0, ...resistors.map((item) => item.id)) + 1;
    setResistors((current) => [...current, createResistor(nextId)]);
    setResults(null);
  };

  const addSource = () => {
    const nextId = Math.max(0, ...voltageSources.map((item) => item.id)) + 1;
    setVoltageSources((current) => [...current, createVoltageSource(nextId)]);
    setResults(null);
  };

  const removeResistor = (id) => {
    setResistors((current) => current.filter((item) => item.id !== id));
    setResults(null);
  };

  const removeSource = (id) => {
    setVoltageSources((current) => current.filter((item) => item.id !== id));
    setResults(null);
  };

  const handleAnalyze = () => {
    try {
      setError('');
      const output = analyzeAdvancedCircuit({
        resistors,
        voltageSources,
        groundNode: groundNode.trim(),
      });
      setResults(output);
    } catch (err) {
      setResults(null);
      setError(err.message || 'Unable to analyze this circuit.');
    }
  };

  const resetCircuit = () => {
    setGroundNode('GND');
    setResistors([
      createResistor(1),
      { ...createResistor(2), name: 'R2', fromNode: 'N1', toNode: 'N2', resistance: 200 },
      { ...createResistor(3), name: 'R3', fromNode: 'N2', toNode: 'GND', resistance: 300 },
    ]);
    setVoltageSources([createVoltageSource(1)]);
    setResults(null);
    setError('');
  };

  return (
    <section className="nodal-panel">
      <div className="circuit-builder-banner">
        <div className="circuit-builder-banner-icon">
          <Activity size={22} />
        </div>
        <div>
          <h3>Nodal Analysis Workspace</h3>
          <p>
            Solve DC resistor networks using Modified Nodal Analysis (MNA),
            KCL equations and Gaussian elimination.
          </p>
        </div>
      </div>

      <div className="nodal-info">
        <Zap size={17} />
        <span>
          Define each branch by its two nodes. Use the same node name wherever
          electrical connections are shared.
        </span>
      </div>

      <div className="nodal-ground-section">
        <label className="circuit-field-label" htmlFor="nodal-example">
          Load Example Circuit
        </label>
        <select
          id="nodal-example"
          className="circuit-number-input"
          value={selectedExample}
          onChange={(event) => loadExample(event.target.value)}
        >
          <option value="">Choose an example...</option>
          <option value="single_node">Single-Node Circuit</option>
          <option value="two_node">Two-Node Circuit</option>
          <option value="voltage_divider">Voltage Divider</option>
        </select>

        <label className="circuit-field-label" htmlFor="ground-node">
          Reference Ground Node
        </label>
        <input
          id="ground-node"
          className="circuit-number-input"
          value={groundNode}
          onChange={(event) => {
            setGroundNode(event.target.value);
            setResults(null);
          }}
          placeholder="GND"
        />
      </div>

      <div className="nodal-section-heading">
        <h3>Resistors</h3>
        <button className="circuit-add-button" onClick={addResistor}>
          <Plus size={16} /> Add Resistor
        </button>
      </div>

      <div className="nodal-component-list">
        {resistors.map((resistor) => (
          <div className="nodal-component-row" key={resistor.id}>
            <div className="nodal-component-title">
              <strong>{resistor.name}</strong>
              <span>Resistor</span>
            </div>

            <label>
              From Node
              <input
                value={resistor.fromNode}
                onChange={(event) =>
                  updateResistor(resistor.id, 'fromNode', event.target.value)
                }
                placeholder="N1"
              />
            </label>

            <label>
              To Node
              <input
                value={resistor.toNode}
                onChange={(event) =>
                  updateResistor(resistor.id, 'toNode', event.target.value)
                }
                placeholder="GND"
              />
            </label>

            <label>
              Resistance (Ω)
              <input
                type="number"
                min="0"
                step="any"
                value={resistor.resistance}
                onChange={(event) =>
                  updateResistor(resistor.id, 'resistance', event.target.value)
                }
              />
            </label>

            <button
              className="circuit-remove-button"
              onClick={() => removeResistor(resistor.id)}
              aria-label={`Remove ${resistor.name}`}
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>

      <div className="nodal-section-heading">
        <h3>Independent DC Voltage Sources</h3>
        <button className="circuit-add-button" onClick={addSource}>
          <Plus size={16} /> Add Source
        </button>
      </div>

      <div className="nodal-component-list">
        {voltageSources.map((source) => (
          <div className="nodal-component-row" key={source.id}>
            <div className="nodal-component-title">
              <strong>{source.name}</strong>
              <span>Voltage Source</span>
            </div>

            <label>
              Positive Node
              <input
                value={source.positive}
                onChange={(event) =>
                  updateSource(source.id, 'positive', event.target.value)
                }
                placeholder="N1"
              />
            </label>

            <label>
              Negative Node
              <input
                value={source.negative}
                onChange={(event) =>
                  updateSource(source.id, 'negative', event.target.value)
                }
                placeholder="GND"
              />
            </label>

            <label>
              Voltage (V)
              <input
                type="number"
                step="any"
                value={source.voltage}
                onChange={(event) =>
                  updateSource(source.id, 'voltage', event.target.value)
                }
              />
            </label>

            <button
              className="circuit-remove-button"
              onClick={() => removeSource(source.id)}
              aria-label={`Remove ${source.name}`}
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>

      <div className="circuit-action-buttons">
        <button className="circuit-analyze-button" onClick={handleAnalyze}>
          <Play size={17} /> Run Nodal Analysis
        </button>
        <button className="circuit-reset-button" onClick={resetCircuit}>
          <RotateCcw size={16} /> Reset
        </button>
      </div>

      {error && (
        <div className="circuit-error">
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      {results && (
        <div className="nodal-results">
          <div className="nodal-results-heading">
            <CheckCircle2 size={19} />
            <h3>Analysis Results</h3>
          </div>

          <h4>Node Voltages</h4>
          <div className="circuit-result-grid">
            {Object.entries(results.nodeVoltages).map(([node, voltage]) => (
              <ResultCard
                key={node}
                label={node}
                value={voltage}
                unit="V"
              />
            ))}
          </div>

          <h4>Resistor Branch Results</h4>
          <div className="nodal-result-table">
            <div className="nodal-table-row nodal-table-header">
              <span>Component</span>
              <span>Voltage (V)</span>
              <span>Current (A)</span>
              <span>Power (W)</span>
            </div>
            {results.resistors.map((resistor) => (
              <div className="nodal-table-row" key={resistor.name}>
                <span>{resistor.name}</span>
                <span>{resistor.voltageDrop.toFixed(6)}</span>
                <span>{resistor.current.toFixed(6)}</span>
                <span>{resistor.power.toFixed(6)}</span>
              </div>
            ))}
          </div>

          <h4>Voltage Source Results</h4>
          <div className="nodal-result-table">
            <div className="nodal-table-row nodal-table-header">
              <span>Source</span>
              <span>Voltage (V)</span>
              <span>Current (A)</span>
              <span>Power (W)</span>
            </div>
            {results.voltageSources.map((source) => (
              <div className="nodal-table-row" key={source.name}>
                <span>{source.name}</span>
                <span>{source.voltage.toFixed(6)}</span>
                <span>{source.current.toFixed(6)}</span>
                <span>{source.power.toFixed(6)}</span>
              </div>
            ))}
          </div>

          <h4>Electrical Verification</h4>
          <div className="circuit-result-grid">
            <ResultCard
              label="Maximum KCL Residual"
              value={results.maxKclResidual}
              unit="A"
            />
            <ResultCard
              label="Power Balance Error"
              value={results.powerBalanceError}
              unit="W"
            />
            <ResultCard
              label="Total Resistor Power"
              value={results.totalResistorPower}
              unit="W"
            />
            <ResultCard
              label="Total Source Power"
              value={results.totalSourcePower}
              unit="W"
            />
          </div>

          <p className="nodal-verification-note">
            A KCL residual and power balance error close to zero indicate
            numerical consistency within the solver's precision.
          </p>
        </div>
      )}
    </section>
  );
}
