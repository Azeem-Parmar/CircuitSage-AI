
/**
 * CircuitSage AI - Advanced Circuit Engine
 * Modified Nodal Analysis (MNA)
 *
 * Supported components:
 * - Resistors
 * - Independent ideal DC voltage sources
 *
 * Current orientation:
 * - Resistor: fromNode -> toNode
 * - Voltage source: positive -> negative
 */

function gaussianElimination(matrix, vector) {
  const n = vector.length;

  const A = matrix.map((row, i) => [...row, vector[i]]);

  for (let col = 0; col < n; col++) {
    // Find the row with the largest pivot.
    let pivotRow = col;

    for (let row = col + 1; row < n; row++) {
      if (
        Math.abs(A[row][col]) >
        Math.abs(A[pivotRow][col])
      ) {
        pivotRow = row;
      }
    }

    if (Math.abs(A[pivotRow][col]) < 1e-12) {
      throw new Error(
        'Circuit matrix is singular. Check circuit connectivity and voltage sources.'
      );
    }

    [A[col], A[pivotRow]] = [A[pivotRow], A[col]];

    // Normalize pivot row.
    const pivot = A[col][col];

    for (let j = col; j <= n; j++) {
      A[col][j] /= pivot;
    }

    // Eliminate this column from other rows.
    for (let row = 0; row < n; row++) {
      if (row === col) continue;

      const factor = A[row][col];

      for (let j = col; j <= n; j++) {
        A[row][j] -= factor * A[col][j];
      }
    }
  }

  return A.map(row => row[n]);
}

function validateCircuit({
  resistors,
  voltageSources,
  groundNode
}) {
  if (!Array.isArray(resistors) || resistors.length === 0) {
    throw new Error('Add at least one resistor.');
  }

  if (!Array.isArray(voltageSources)) {
    throw new Error('Voltage sources must be an array.');
  }

  if (
    typeof groundNode !== 'string' ||
    groundNode.trim() === ''
  ) {
    throw new Error('A valid ground node is required.');
  }

  const nodes = new Set([groundNode]);

  resistors.forEach((r, index) => {
    if (
      typeof r.fromNode !== 'string' ||
      typeof r.toNode !== 'string' ||
      r.fromNode.trim() === '' ||
      r.toNode.trim() === ''
    ) {
      throw new Error(`Resistor ${index + 1} has invalid nodes.`);
    }

    if (r.fromNode === r.toNode) {
      throw new Error(
        `Resistor ${index + 1} cannot connect a node to itself.`
      );
    }

    if (!Number.isFinite(r.resistance) || r.resistance <= 0) {
      throw new Error(
        `Resistor ${index + 1} must have positive resistance.`
      );
    }

    nodes.add(r.fromNode);
    nodes.add(r.toNode);
  });

  voltageSources.forEach((source, index) => {
    if (
      typeof source.positive !== 'string' ||
      typeof source.negative !== 'string' ||
      source.positive.trim() === '' ||
      source.negative.trim() === ''
    ) {
      throw new Error(
        `Voltage source ${index + 1} has invalid nodes.`
      );
    }

    if (source.positive === source.negative) {
      throw new Error(
        `Voltage source ${index + 1} cannot connect a node to itself.`
      );
    }

    if (!Number.isFinite(source.voltage)) {
      throw new Error(
        `Voltage source ${index + 1} must have a finite voltage.`
      );
    }

    nodes.add(source.positive);
    nodes.add(source.negative);
  });

  return nodes;
}

export function analyzeAdvancedCircuit({
  resistors,
  voltageSources = [],
  groundNode = 'GND'
}) {
  const nodes = validateCircuit({
    resistors,
    voltageSources,
    groundNode
  });

  // All non-ground nodes are unknown node voltages.
  const nodeList = [...nodes].filter(
    node => node !== groundNode
  );

  const nodeIndex = new Map(
    nodeList.map((node, index) => [node, index])
  );

  const nodeCount = nodeList.length;
  const sourceCount = voltageSources.length;
  const dimension = nodeCount + sourceCount;

  if (dimension === 0) {
    throw new Error('Circuit has no unknown electrical quantities.');
  }

  const matrix = Array.from(
    { length: dimension },
    () => Array(dimension).fill(0)
  );

  const rhs = Array(dimension).fill(0);

  // Stamp resistor conductances into the G matrix.
  resistors.forEach(resistor => {
    const g = 1 / resistor.resistance;

    const from = nodeIndex.get(resistor.fromNode);
    const to = nodeIndex.get(resistor.toNode);

    if (from !== undefined) {
      matrix[from][from] += g;
    }

    if (to !== undefined) {
      matrix[to][to] += g;
    }

    if (from !== undefined && to !== undefined) {
      matrix[from][to] -= g;
      matrix[to][from] -= g;
    }
  });

  // Stamp ideal voltage sources into the MNA matrix.
  voltageSources.forEach((source, index) => {
    const sourceIndex = nodeCount + index;

    const positive = nodeIndex.get(source.positive);
    const negative = nodeIndex.get(source.negative);

    if (positive !== undefined) {
      matrix[positive][sourceIndex] += 1;
      matrix[sourceIndex][positive] += 1;
    }

    if (negative !== undefined) {
      matrix[negative][sourceIndex] -= 1;
      matrix[sourceIndex][negative] -= 1;
    }

    rhs[sourceIndex] = source.voltage;
  });

  // Solve the MNA system.
  const solution = gaussianElimination(matrix, rhs);

  const nodeVoltages = {
    [groundNode]: 0
  };

  nodeList.forEach((node, index) => {
    nodeVoltages[node] = solution[index];
  });

  // Calculate resistor branch quantities.
  const resistorResults = resistors.map((resistor, index) => {
    const voltageDrop =
      nodeVoltages[resistor.fromNode] -
      nodeVoltages[resistor.toNode];

    const current = voltageDrop / resistor.resistance;
    const power = voltageDrop * current;

    return {
      name: resistor.name || `R${index + 1}`,
      fromNode: resistor.fromNode,
      toNode: resistor.toNode,
      resistance: resistor.resistance,
      voltageDrop,
      current,
      power
    };
  });

  // Calculate voltage source branch quantities.
  const voltageSourceResults = voltageSources.map(
    (source, index) => {
      const current = solution[nodeCount + index];

      return {
        name: source.name || `V${index + 1}`,
        positive: source.positive,
        negative: source.negative,
        voltage: source.voltage,
        current,
        power: source.voltage * current
      };
    }
  );

  // Verify KCL: sum of currents leaving each node must be zero.
  const kclResiduals = {};

  for (const node of nodes) {
    let sum = 0;

    resistorResults.forEach(branch => {
      if (branch.fromNode === node) sum += branch.current;
      if (branch.toNode === node) sum -= branch.current;
    });

    voltageSourceResults.forEach(source => {
      if (source.positive === node) sum += source.current;
      if (source.negative === node) sum -= source.current;
    });

    kclResiduals[node] = sum;
  }

  const maxKclResidual = Math.max(
    ...Object.values(kclResiduals).map(Math.abs)
  );

  const totalResistorPower = resistorResults.reduce(
    (sum, branch) => sum + branch.power,
    0
  );

  const totalSourcePower = voltageSourceResults.reduce(
    (sum, source) => sum + source.power,
    0
  );

  return {
    groundNode,
    nodeVoltages,
    resistors: resistorResults,
    voltageSources: voltageSourceResults,
    kclResiduals,
    maxKclResidual,
    totalResistorPower,
    totalSourcePower,
    powerBalanceError: totalResistorPower + totalSourcePower
  };
}
