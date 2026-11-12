
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

import { analyzeMeshCircuit } from '../advanced-circuit/meshAnalysisEngine';

const createInitialMeshes = () => [
  {
    id: 1,
    name: 'Mesh 1',
    resistors: [
      { id: '1-r1', name: 'R1', resistance: 2, direction: 1 },
      { id: '1-r2', name: 'Rshared', resistance: 4, direction: 1 },
    ],
    voltageSources: [
      { id: '1-v1', name: 'V1', voltageRise: 10 },
    ],
  },
  {
    id: 2,
    name: 'Mesh 2',
    resistors: [
      { id: '2-r1', name: 'Rshared', resistance: 4, direction: -1 },
      { id: '2-r2', name: 'R2', resistance: 6, direction: 1 },
    ],
    voltageSources: [],
  },
];

export default function MeshAnalysisPanel() {
  const [meshes, setMeshes] = useState(createInitialMeshes);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [selectedExample, setSelectedExample] = useState('two_mesh');

  const loadExample = (example) => {
    const examples = {
      single_mesh: [
        {
          id: 1,
          name: 'Mesh 1',
          resistors: [
            { id: '1-r1', name: 'R1', resistance: 4, direction: 1 },
            { id: '1-r2', name: 'R2', resistance: 6, direction: 1 },
          ],
          voltageSources: [
            { id: '1-v1', name: 'V1', voltageRise: 10 },
          ],
        },
      ],
      two_mesh: [
        {
          id: 1,
          name: 'Mesh 1',
          resistors: [
            { id: '1-r1', name: 'R1', resistance: 2, direction: 1 },
            { id: '1-r2', name: 'Rshared', resistance: 4, direction: 1 },
          ],
          voltageSources: [
            { id: '1-v1', name: 'V1', voltageRise: 10 },
          ],
        },
        {
          id: 2,
          name: 'Mesh 2',
          resistors: [
            { id: '2-r1', name: 'Rshared', resistance: 4, direction: -1 },
            { id: '2-r2', name: 'R2', resistance: 6, direction: 1 },
          ],
          voltageSources: [],
        },
      ],
      three_mesh: [
        {
          id: 1,
          name: 'Mesh 1',
          resistors: [
            { id: '1-r1', name: 'R1', resistance: 4, direction: 1 },
            { id: '1-r2', name: 'R12', resistance: 2, direction: 1 },
          ],
          voltageSources: [
            { id: '1-v1', name: 'V1', voltageRise: 12 },
          ],
        },
        {
          id: 2,
          name: 'Mesh 2',
          resistors: [
            { id: '2-r1', name: 'R12', resistance: 2, direction: -1 },
            { id: '2-r2', name: 'R2', resistance: 3, direction: 1 },
            { id: '2-r3', name: 'R23', resistance: 1, direction: 1 },
          ],
          voltageSources: [],
        },
        {
          id: 3,
          name: 'Mesh 3',
          resistors: [
            { id: '3-r1', name: 'R23', resistance: 1, direction: -1 },
            { id: '3-r2', name: 'R3', resistance: 5, direction: 1 },
          ],
          voltageSources: [
            { id: '3-v1', name: 'V3', voltageRise: 6 },
          ],
        },
      ],
    };

    const preset = examples[example];
    if (!preset) return;

    setMeshes(
      preset.map((mesh) => ({
        ...mesh,
        resistors: mesh.resistors.map((resistor) => ({ ...resistor })),
        voltageSources: mesh.voltageSources.map((source) => ({ ...source })),
      }))
    );
    setResults(null);
    setError('');
    setSelectedExample(example);
  };

  const clearResults = () => {
    setResults(null);
    setError('');
  };

  const updateResistor = (meshId, resistorId, field, value) => {
    setMeshes((current) =>
      current.map((mesh) =>
        mesh.id === meshId
          ? {
              ...mesh,
              resistors: mesh.resistors.map((resistor) =>
                resistor.id === resistorId
                  ? { ...resistor, [field]: value }
                  : resistor
              ),
            }
          : mesh
      )
    );
    clearResults();
  };

  const updateSource = (meshId, sourceId, field, value) => {
    setMeshes((current) =>
      current.map((mesh) =>
        mesh.id === meshId
          ? {
              ...mesh,
              voltageSources: mesh.voltageSources.map((source) =>
                source.id === sourceId
                  ? { ...source, [field]: value }
                  : source
              ),
            }
          : mesh
      )
    );
    clearResults();
  };

  const addMesh = () => {
    const nextId = Math.max(0, ...meshes.map((mesh) => mesh.id)) + 1;

    setMeshes((current) => [
      ...current,
      {
        id: nextId,
        name: `Mesh ${nextId}`,
        resistors: [
          {
            id: `${nextId}-r1`,
            name: `R${nextId}`,
            resistance: 100,
            direction: 1,
          },
        ],
        voltageSources: [],
      },
    ]);
    clearResults();
  };

  const removeMesh = (meshId) => {
    if (meshes.length <= 1) {
      setError('At least one mesh must remain.');
      return;
    }

    setMeshes((current) => current.filter((mesh) => mesh.id !== meshId));
    clearResults();
  };

  const addResistor = (meshId) => {
    setMeshes((current) =>
      current.map((mesh) => {
        if (mesh.id !== meshId) return mesh;

        const nextId = mesh.resistors.length + 1;

        return {
          ...mesh,
          resistors: [
            ...mesh.resistors,
            {
              id: `${meshId}-r${nextId}-${Date.now()}`,
              name: `R${meshId}_${nextId}`,
              resistance: 100,
              direction: 1,
            },
          ],
        };
      })
    );
    clearResults();
  };

  const removeResistor = (meshId, resistorId) => {
    setMeshes((current) =>
      current.map((mesh) =>
        mesh.id === meshId
          ? {
              ...mesh,
              resistors: mesh.resistors.filter(
                (resistor) => resistor.id !== resistorId
              ),
            }
          : mesh
      )
    );
    clearResults();
  };

  const addSource = (meshId) => {
    setMeshes((current) =>
      current.map((mesh) => {
        if (mesh.id !== meshId) return mesh;

        const nextId = mesh.voltageSources.length + 1;

        return {
          ...mesh,
          voltageSources: [
            ...mesh.voltageSources,
            {
              id: `${meshId}-v${nextId}-${Date.now()}`,
              name: `V${meshId}_${nextId}`,
              voltageRise: 5,
            },
          ],
        };
      })
    );
    clearResults();
  };

  const removeSource = (meshId, sourceId) => {
    setMeshes((current) =>
      current.map((mesh) =>
        mesh.id === meshId
          ? {
              ...mesh,
              voltageSources: mesh.voltageSources.filter(
                (source) => source.id !== sourceId
              ),
            }
          : mesh
      )
    );
    clearResults();
  };

  const handleAnalyze = () => {
    try {
      setError('');

      const circuit = {
        meshes: meshes.map((mesh) => ({
          name: mesh.name,
          resistors: mesh.resistors.map((resistor) => ({
            name: resistor.name.trim(),
            resistance: Number(resistor.resistance),
            direction: Number(resistor.direction),
          })),
          voltageSources: mesh.voltageSources.map((source) => ({
            name: source.name.trim(),
            voltageRise: Number(source.voltageRise),
          })),
        })),
      };

      const analysis = analyzeMeshCircuit(circuit);
      setResults(analysis);
    } catch (err) {
      setResults(null);
      setError(err.message || 'Unable to analyze this circuit.');
    }
  };

  const resetCircuit = () => {
    setMeshes(createInitialMeshes());
    setSelectedExample('two_mesh');
    setResults(null);
    setError('');
  };

  return (
    <section className="mesh-panel">
      <div className="circuit-builder-banner">
        <div className="circuit-builder-banner-icon">
          <Activity size={22} />
        </div>
        <div>
          <h3>Mesh Analysis Workspace</h3>
          <p>
            Solve planar DC circuits using Kirchhoff's Voltage Law (KVL)
            and simultaneous mesh equations.
          </p>
        </div>
      </div>

      <div className="mesh-info">
        <Zap size={17} />
        <span>
          Give shared resistors the same name and resistance in every
          connected mesh. Use opposite directions for a shared branch
          when the mesh traversals oppose each other.
        </span>
      </div>

      <div className="mesh-direction-guide">
        <strong>Branch direction convention</strong>
        <span>+1: follows the mesh traversal</span>
        <span>-1: opposes the mesh traversal</span>
        <span>
          Voltage rise: positive when the source raises voltage along
          the mesh traversal.
        </span>
      </div>

      <div className="mesh-example-selector">
        <label className="circuit-field-label" htmlFor="mesh-example">
          Load Example Circuit
        </label>
        <select
          id="mesh-example"
          className="circuit-number-input"
          value={selectedExample}
          onChange={(event) => loadExample(event.target.value)}
        >
          <option value="">Choose an example...</option>
          <option value="single_mesh">Single Mesh — 2 Resistors</option>
          <option value="two_mesh">Two Meshes — Shared Resistor</option>
          <option value="three_mesh">Three Meshes — Two Shared Branches</option>
        </select>
      </div>

      <div className="mesh-section-heading">
        <div>
          <h3>Mesh Configuration</h3>
          <p>{meshes.length} mesh(es) defined</p>
        </div>
        <button className="circuit-add-button" onClick={addMesh}>
          <Plus size={16} /> Add Mesh
        </button>
      </div>

      {meshes.map((mesh) => (
        <div className="mesh-card" key={mesh.id}>
          <div className="mesh-card-heading">
            <div>
              <span className="mesh-number">MESH {mesh.id}</span>
              <h3>{mesh.name}</h3>
            </div>

            <button
              className="circuit-remove-button"
              onClick={() => removeMesh(mesh.id)}
              aria-label={`Remove ${mesh.name}`}
              title="Remove mesh"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="mesh-subheading">
            <h4>Resistor Branches</h4>
            <button
              className="circuit-add-button"
              onClick={() => addResistor(mesh.id)}
            >
              <Plus size={14} /> Add Resistor
            </button>
          </div>

          {mesh.resistors.map((resistor) => (
            <div className="mesh-component-row" key={resistor.id}>
              <label>
                Branch Name
                <input
                  value={resistor.name}
                  onChange={(event) =>
                    updateResistor(
                      mesh.id,
                      resistor.id,
                      'name',
                      event.target.value
                    )
                  }
                  placeholder="e.g. Rshared"
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
                    updateResistor(
                      mesh.id,
                      resistor.id,
                      'resistance',
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Direction
                <select
                  value={resistor.direction}
                  onChange={(event) =>
                    updateResistor(
                      mesh.id,
                      resistor.id,
                      'direction',
                      Number(event.target.value)
                    )
                  }
                >
                  <option value={1}>+1 — With mesh</option>
                  <option value={-1}>-1 — Against mesh</option>
                </select>
              </label>

              <button
                className="circuit-remove-button"
                onClick={() => removeResistor(mesh.id, resistor.id)}
                aria-label={`Remove ${resistor.name}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <div className="mesh-subheading mesh-source-heading">
            <h4>Voltage Sources</h4>
            <button
              className="circuit-add-button"
              onClick={() => addSource(mesh.id)}
            >
              <Plus size={14} /> Add Source
            </button>
          </div>

          {mesh.voltageSources.length === 0 && (
            <p className="mesh-empty-note">
              No voltage source added to this mesh.
            </p>
          )}

          {mesh.voltageSources.map((source) => (
            <div className="mesh-component-row" key={source.id}>
              <label>
                Source Name
                <input
                  value={source.name}
                  onChange={(event) =>
                    updateSource(
                      mesh.id,
                      source.id,
                      'name',
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Voltage Rise (V)
                <input
                  type="number"
                  step="any"
                  value={source.voltageRise}
                  onChange={(event) =>
                    updateSource(
                      mesh.id,
                      source.id,
                      'voltageRise',
                      event.target.value
                    )
                  }
                />
              </label>

              <div className="mesh-source-convention">
                Positive = voltage rise in mesh direction
              </div>

              <button
                className="circuit-remove-button"
                onClick={() => removeSource(mesh.id, source.id)}
                aria-label={`Remove ${source.name}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ))}

      <div className="circuit-action-buttons">
        <button className="circuit-analyze-button" onClick={handleAnalyze}>
          <Play size={17} /> Run Mesh Analysis
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
        <div className="mesh-results">
          <div className="mesh-results-heading">
            <CheckCircle2 size={19} />
            <h3>Mesh Analysis Results</h3>
          </div>

          <h4>Mesh Currents</h4>
          <div className="circuit-result-grid">
            {results.meshCurrents.map((mesh) => (
              <div className="circuit-result-card" key={mesh.name}>
                <span>{mesh.name}</span>
                <strong>{mesh.current.toFixed(6)} A</strong>
              </div>
            ))}
          </div>

          <h4>Resistor Branch Results</h4>
          <div className="nodal-result-table">
            <div className="nodal-table-row nodal-table-header">
              <span>Branch</span>
              <span>Resistance (Ω)</span>
              <span>Current (A)</span>
              <span>Power (W)</span>
            </div>

            {results.resistors.map((resistor) => (
              <div className="nodal-table-row" key={resistor.name}>
                <span>{resistor.name}</span>
                <span>{resistor.resistance.toFixed(4)}</span>
                <span>{resistor.current.toFixed(6)}</span>
                <span>{resistor.power.toFixed(6)}</span>
              </div>
            ))}
          </div>

          <h4>Electrical Verification</h4>
          <div className="circuit-result-grid">
            <div className="circuit-result-card">
              <span>Total Resistor Power</span>
              <strong>{results.totalResistorPower.toFixed(6)} W</strong>
            </div>

            <div className="circuit-result-card">
              <span>Total Source Power Supplied</span>
              <strong>
                {results.totalSourcePowerSupplied.toFixed(6)} W
              </strong>
            </div>

            <div className="circuit-result-card">
              <span>Power Balance Error</span>
              <strong>{results.powerBalanceError.toFixed(9)} W</strong>
            </div>
          </div>

          <p className="nodal-verification-note">
            A power balance error close to zero indicates that the
            calculated resistor dissipation matches the source power
            supplied, within numerical precision.
          </p>
        </div>
      )}
    </section>
  );
}
