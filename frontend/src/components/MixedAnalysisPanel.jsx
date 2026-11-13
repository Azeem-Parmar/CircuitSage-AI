
import { useState } from 'react';
import {
  Activity,
  AlertCircle,
  Play,
  RotateCcw,
  Zap,
  Plus,
  Trash2,
  GitBranch,
  Layers,
} from 'lucide-react';

import MixedCircuitSchematic from './MixedCircuitSchematic';

import { analyzeMixedCircuit } from '../circuit/mixedCircuitEngine';

let nextNodeId = 10;

const initialNetwork = {
  id: 'root',
  type: 'series',
  children: [
    {
      id: 'r1',
      type: 'resistor',
      name: 'R1',
      resistance: 100,
    },
    {
      id: 'parallel-1',
      type: 'parallel',
      children: [
        {
          id: 'r2',
          type: 'resistor',
          name: 'R2',
          resistance: 200,
        },
        {
          id: 'r3',
          type: 'resistor',
          name: 'R3',
          resistance: 300,
        },
      ],
    },
  ],
};

function collectResistorNames(node, names = []) {
  if (node.type === 'resistor') {
    names.push(node.name);
    return names;
  }

  node.children.forEach((child) => collectResistorNames(child, names));
  return names;
}

function getNextResistorName(network) {
  const names = new Set(collectResistorNames(network));
  let number = 1;

  while (names.has(`R${number}`)) {
    number += 1;
  }

  return `R${number}`;
}

function createResistor(name) {
  return {
    id: `node-${nextNodeId++}`,
    type: 'resistor',
    name,
    resistance: 100,
  };
}

function createGroup(type) {
  const firstId = nextNodeId++;
  const secondId = nextNodeId++;

  return {
    id: `group-${nextNodeId++}`,
    type,
    children: [
      {
        id: `node-${firstId}`,
        type: 'resistor',
        name: '',
        resistance: 100,
      },
      {
        id: `node-${secondId}`,
        type: 'resistor',
        name: '',
        resistance: 100,
      },
    ],
  };
}

function assignMissingNames(node, network) {
  const usedNames = new Set(collectResistorNames(network));

  function walk(current) {
    if (current.type === 'resistor') {
      if (!current.name) {
        let number = 1;

        while (usedNames.has(`R${number}`)) {
          number += 1;
        }

        current.name = `R${number}`;
        usedNames.add(current.name);
      }

      return;
    }

    current.children.forEach(walk);
  }

  walk(node);
  return node;
}

function updateNode(node, targetId, updater) {
  if (node.id === targetId) {
    return updater(node);
  }

  if (node.type === 'resistor') {
    return node;
  }

  return {
    ...node,
    children: node.children.map((child) =>
      updateNode(child, targetId, updater)
    ),
  };
}

function removeNode(node, targetId) {
  if (node.type === 'resistor') {
    return node;
  }

  return {
    ...node,
    children: node.children
      .filter((child) => child.id !== targetId)
      .map((child) => removeNode(child, targetId)),
  };
}

function countResistors(node) {
  if (node.type === 'resistor') {
    return 1;
  }

  return node.children.reduce(
    (total, child) => total + countResistors(child),
    0
  );
}

function countGroups(node) {
  if (node.type === 'resistor') {
    return 0;
  }

  return 1 + node.children.reduce(
    (total, child) => total + countGroups(child),
    0
  );
}

function NetworkNodeEditor({
  node,
  network,
  onUpdate,
  onRemove,
  canRemove,
  isRoot = false,
}) {
  if (node.type === 'resistor') {
    return (
      <div className="mixed-resistor-node">
        <div className="mixed-node-heading">
          <div className="mixed-node-title">
            <Zap size={16} />
            <strong>{node.name}</strong>
            <span>Resistor</span>
          </div>

          {canRemove && (
            <button
              type="button"
              className="mixed-icon-button mixed-delete-button"
              onClick={() => onRemove(node.id)}
              aria-label={`Remove ${node.name}`}
              title={`Remove ${node.name}`}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>

        <label className="mixed-resistance-field">
          Resistance (Ω)
          <input
            type="number"
            min="0"
            step="1"
            value={node.resistance}
            onChange={(event) =>
              onUpdate(node.id, {
                resistance:
                  event.target.value === ''
                    ? ''
                    : Number(event.target.value),
              })
            }
            placeholder="Enter resistance"
          />
        </label>
      </div>
    );
  }

  return (
    <div
      className={`mixed-group-node mixed-group-${node.type}`}
      data-group-id={node.id}
    >
      <div className="mixed-group-heading">
        <div className="mixed-node-title">
          {node.type === 'series' ? (
            <GitBranch size={17} />
          ) : (
            <Layers size={17} />
          )}
          <strong>{isRoot ? 'Main Network' : `${node.type} Group`}</strong>
          <span>{node.children.length} elements</span>
        </div>

        <div className="mixed-group-controls">
          <select
            className="mixed-group-select"
            value={node.type}
            onChange={(event) =>
              onUpdate(node.id, { type: event.target.value })
            }
            aria-label="Group connection type"
          >
            <option value="series">Series</option>
            <option value="parallel">Parallel</option>
          </select>

          {canRemove && (
            <button
              type="button"
              className="mixed-icon-button mixed-delete-button"
              onClick={() => onRemove(node.id)}
              aria-label="Remove group"
              title="Remove group"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="mixed-group-children">
        {node.children.map((child) => (
          <NetworkNodeEditor
            key={child.id}
            node={child}
            network={network}
            onUpdate={onUpdate}
            onRemove={onRemove}
            canRemove={node.children.length > 2}
          />
        ))}
      </div>

      <div className="mixed-group-actions">
        <button
          type="button"
          className="mixed-small-action"
          onClick={() => onUpdate(node.id, {
            addChild: 'resistor',
          })}
        >
          <Plus size={14} /> Add resistor
        </button>

        <button
          type="button"
          className="mixed-small-action"
          onClick={() => onUpdate(node.id, {
            addChild: 'series',
          })}
        >
          <Plus size={14} /> Add series group
        </button>

        <button
          type="button"
          className="mixed-small-action"
          onClick={() => onUpdate(node.id, {
            addChild: 'parallel',
          })}
        >
          <Plus size={14} /> Add parallel group
        </button>
      </div>

      {isRoot && (
        <p className="mixed-editor-hint">
          Each series or parallel group must contain at least two elements.
        </p>
      )}
    </div>
  );
}

function prepareNetwork(node, sourceNetwork) {
  if (node.type === 'resistor') {
    return {
      type: 'resistor',
      name: node.name,
      resistance: Number(node.resistance),
    };
  }

  const prepared = {
    type: node.type,
    children: node.children.map((child) =>
      prepareNetwork(child, sourceNetwork)
    ),
  };

  return assignMissingNames(prepared, sourceNetwork);
}

function MixedAnalysisPanel() {
  const [voltage, setVoltage] = useState(12);
  const [network, setNetwork] = useState(initialNetwork);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const updateVoltage = (value) => {
    setVoltage(value === '' ? '' : Number(value));
    setResults(null);
    setError('');
  };

  const updateNodeData = (targetId, changes) => {
    setNetwork((previous) => {
      if (changes.addChild) {
        const childType = changes.addChild;

        if (childType === 'resistor') {
          const name = getNextResistorName(previous);
          const child = createResistor(name);

          return updateNode(previous, targetId, (node) => ({
            ...node,
            children: [...node.children, child],
          }));
        }

        const group = createGroup(childType);
        const namedGroup = assignMissingNames(group, previous);

        return updateNode(previous, targetId, (node) => ({
          ...node,
          children: [...node.children, namedGroup],
        }));
      }

      return updateNode(previous, targetId, (node) => ({
        ...node,
        ...changes,
      }));
    });

    setResults(null);
    setError('');
  };

  const handleRemove = (targetId) => {
    setNetwork((previous) => removeNode(previous, targetId));
    setResults(null);
    setError('');
  };

  const handleAnalyze = () => {
    try {
      const preparedNetwork = prepareNetwork(network, network);

      const analysis = analyzeMixedCircuit({
        voltage: Number(voltage),
        network: preparedNetwork,
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
    nextNodeId = 10;
    setVoltage(12);
    setNetwork(initialNetwork);
    setResults(null);
    setError('');
  };

  const resistorCount = countResistors(network);
  const groupCount = countGroups(network);

  return (
    <>
      <div className="circuit-builder-banner">
        <div className="circuit-builder-banner-icon">
          <Activity size={24} />
        </div>

        <div>
          <h3>Mixed Circuit Workspace</h3>
          <p>Build and analyze custom nested series-parallel networks.</p>
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
              <h3>Dynamic Network Editor</h3>
              <p>Build your own resistor network</p>
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
            onChange={(event) => updateVoltage(event.target.value)}
            placeholder="Enter supply voltage"
          />

          <div
            className="mixed-network-stats"
            aria-label={`${resistorCount} resistors and ${groupCount} groups`}
          >
            <span className="mixed-network-stat">
              {resistorCount} Resistors
            </span>
            <span className="mixed-network-stat">
              {groupCount} Groups
            </span>
          </div>

          <NetworkNodeEditor
            node={network}
            network={network}
            onUpdate={updateNodeData}
            onRemove={handleRemove}
            canRemove={false}
            isRoot
          />

          <div className="circuit-action-buttons">
            <button
              type="button"
              className="circuit-analyze-button"
              onClick={handleAnalyze}
            >
              <Play size={16} /> Analyze Network
            </button>

            <button
              type="button"
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
                <h3>Network Topology</h3>
                <p>Live representation of your network structure</p>
              </div>
            </div>

            <MixedCircuitSchematic
              network={network}
              voltage={Number(voltage)}
              results={results}
            />
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

                <div className="mixed-breakdown-header">
                  <span>Resistor</span>
                  <span>Voltage</span>
                  <span>Current</span>
                  <span>Power</span>
                </div>

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
                  Configure your network and select Analyze Network
                  to calculate its electrical parameters.
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
