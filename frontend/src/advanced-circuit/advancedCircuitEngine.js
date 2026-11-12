
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

import { solveLinearSystem } from './linearSolver.js';

function validateCircuit({
  resistors,
  voltageSources,
  groundNode,
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
    if (!r || typeof r !== 'object') {
      throw new Error(`Resistor ${index + 1} is invalid.`);
    }

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
    if (!source || typeof source !== 'object') {
      throw new Error(`Voltage source ${index + 1} is invalid.`);
    }

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

function validateGroundConnectivity({
  resistors,
  voltageSources,
  groundNode,
  nodes,
}) {
  const graph = new Map(
    [...nodes].map(node => [node, []])
  );

  // Resistors connect their two terminal nodes.
  resistors.forEach(resistor => {
    graph.get(resistor.fromNode).push(resistor.toNode);
    graph.get(resistor.toNode).push(resistor.fromNode);
  });

  // Ideal voltage sources also connect their terminal nodes.
  voltageSources.forEach(source => {
    graph.get(source.positive).push(source.negative);
    graph.get(source.negative).push(source.positive);
  });

  // Breadth-first search starting from ground.
  const visited = new Set([groundNode]);
  const queue = [groundNode];

  for (let index = 0; index < queue.length; index++) {
    const currentNode = queue[index];

    for (const neighbor of graph.get(currentNode)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  const disconnectedNodes = [...nodes].filter(
    node => !visited.has(node)
  );

  if (disconnectedNodes.length > 0) {
    throw new Error(
      `Circuit contains nodes disconnected from ground: ${disconnectedNodes.join(', ')}.`
    );
  }
}

function ensureFiniteResults(values, description) {
  if (!values.every(Number.isFinite)) {
    throw new Error(`${description} contains non-finite values.`);
  }
}

export function analyzeAdvancedCircuit({
  resistors,
  voltageSources = [],
  groundNode = 'GND',
}) {
  const nodes = validateCircuit({
    resistors,
    voltageSources,
    groundNode,
  });

  validateGroundConnectivity({
    resistors,
    voltageSources,
    groundNode,
    nodes,
  });

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

  // Stamp resistor conductances.
  resistors.forEach(resistor => {
    const conductance = 1 / resistor.resistance;

    ensureFiniteResults(
      [conductance],
      'Resistor conductance'
    );

    const from = nodeIndex.get(resistor.fromNode);
    const to = nodeIndex.get(resistor.toNode);

    if (from !== undefined) {
      matrix[from][from] += conductance;
    }

    if (to !== undefined) {
      matrix[to][to] += conductance;
    }

    if (from !== undefined && to !== undefined) {
      matrix[from][to] -= conductance;
      matrix[to][from] -= conductance;
    }
  });

  // Stamp ideal independent voltage sources.
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

  // Solve using the shared numerical solver.
  let solution;

  try {
    solution = solveLinearSystem(matrix, rhs);
  } catch (error) {
    if (
      error.message.includes('singular') ||
      error.message.includes('numerically unstable')
    ) {
      throw new Error('Circuit matrix is singular.', { cause: error });
    }

    throw error;
  }

  ensureFiniteResults(solution, 'Circuit solution');

  // Calculate node voltages.
  const nodeVoltages = {
    [groundNode]: 0,
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

    ensureFiniteResults(
      [voltageDrop, current, power],
      `Resistor ${index + 1} results`
    );

    return {
      name: resistor.name || `R${index + 1}`,
      fromNode: resistor.fromNode,
      toNode: resistor.toNode,
      resistance: resistor.resistance,
      voltageDrop,
      current,
      power,
    };
  });

  // Calculate voltage source branch quantities.
  const voltageSourceResults = voltageSources.map(
    (source, index) => {
      const current = solution[nodeCount + index];
      const power = source.voltage * current;

      ensureFiniteResults(
        [current, power],
        `Voltage source ${index + 1} results`
      );

      return {
        name: source.name || `V${index + 1}`,
        positive: source.positive,
        negative: source.negative,
        voltage: source.voltage,
        current,
        power,
      };
    }
  );

  // Verify KCL at every node.
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

  const powerBalanceError =
    totalResistorPower + totalSourcePower;

  ensureFiniteResults(
    [
      maxKclResidual,
      totalResistorPower,
      totalSourcePower,
      powerBalanceError,
    ],
    'Circuit verification'
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
    powerBalanceError,
  };
}
