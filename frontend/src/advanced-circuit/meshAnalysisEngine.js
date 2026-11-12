
/**
 * CircuitSage AI - Mesh Analysis Engine
 *
 * Supports:
 * - Multiple meshes
 * - Shared resistor branches
 * - Independent ideal DC voltage sources
 *
 * Resistor direction:
 * - 1: follows the mesh traversal
 * - -1: opposes the mesh traversal
 *
 * Voltage rise:
 * - Positive when the source raises voltage
 *   along the mesh traversal.
 */

import { solveLinearSystem } from './linearSolver.js';

function validateMeshes(meshes) {
  if (!Array.isArray(meshes) || meshes.length === 0) {
    throw new Error('Add at least one mesh.');
  }

  const resistorMap = new Map();
  const sourceNames = new Set();

  meshes.forEach((mesh, meshIndex) => {
    if (!mesh || typeof mesh !== 'object' || Array.isArray(mesh)) {
      throw new Error(`Mesh ${meshIndex + 1} is invalid.`);
    }

    if (!Array.isArray(mesh.resistors) || mesh.resistors.length === 0) {
      throw new Error(`Mesh ${meshIndex + 1} must contain resistors.`);
    }

    if (
      mesh.voltageSources !== undefined &&
      !Array.isArray(mesh.voltageSources)
    ) {
      throw new Error(`Mesh ${meshIndex + 1} has invalid voltage sources.`);
    }

    mesh.resistors.forEach((resistor, resistorIndex) => {
      if (
        !resistor ||
        typeof resistor !== 'object' ||
        Array.isArray(resistor)
      ) {
        throw new Error(
          `Mesh ${meshIndex + 1}, resistor ${resistorIndex + 1} is invalid.`
        );
      }

      const name = resistor.name;

      if (typeof name !== 'string' || !name.trim()) {
        throw new Error(
          `Mesh ${meshIndex + 1}, resistor ${resistorIndex + 1} needs a name.`
        );
      }

      if (
        !Number.isFinite(resistor.resistance) ||
        resistor.resistance <= 0
      ) {
        throw new Error(`${name} must have positive resistance.`);
      }

      const direction = resistor.direction ?? 1;

      if (direction !== 1 && direction !== -1) {
        throw new Error(`${name} direction must be 1 or -1.`);
      }

      if (resistorMap.has(name)) {
        const existing = resistorMap.get(name);

        if (existing.resistance !== resistor.resistance) {
          throw new Error(`${name} has inconsistent resistance values.`);
        }
      } else {
        resistorMap.set(name, {
          name,
          resistance: resistor.resistance,
          directions: new Array(meshes.length).fill(0),
        });
      }

      const branch = resistorMap.get(name);

      if (branch.directions[meshIndex] !== 0) {
        throw new Error(`${name} appears more than once in one mesh.`);
      }

      branch.directions[meshIndex] = direction;
    });

    (mesh.voltageSources ?? []).forEach((source, sourceIndex) => {
      if (
        !source ||
        typeof source !== 'object' ||
        Array.isArray(source) ||
        !Number.isFinite(source.voltageRise) ||
        typeof source.name !== 'string' ||
        !source.name.trim()
      ) {
        throw new Error(
          `Mesh ${meshIndex + 1}, voltage source ${sourceIndex + 1} is invalid.`
        );
      }

      if (sourceNames.has(source.name)) {
        throw new Error(`Duplicate voltage source name: ${source.name}.`);
      }

      sourceNames.add(source.name);
    });
  });

  return resistorMap;
}

function ensureFiniteResults(values, description) {
  if (!values.every(Number.isFinite)) {
    throw new Error(`${description} contains non-finite values.`);
  }
}

export function analyzeMeshCircuit({ meshes }) {
  const resistorMap = validateMeshes(meshes);
  const meshCount = meshes.length;

  const matrix = Array.from(
    { length: meshCount },
    () => Array(meshCount).fill(0)
  );

  const rhs = Array(meshCount).fill(0);

  // Build the mesh resistance matrix and source vector.
  for (let i = 0; i < meshCount; i++) {
    const mesh = meshes[i];

    for (const resistor of mesh.resistors) {
      const directionI = resistor.direction ?? 1;
      const branch = resistorMap.get(resistor.name);

      for (let j = 0; j < meshCount; j++) {
        const directionJ = branch.directions[j];

        if (directionJ !== 0) {
          matrix[i][j] +=
            resistor.resistance * directionI * directionJ;
        }
      }
    }

    for (const source of mesh.voltageSources ?? []) {
      rhs[i] += source.voltageRise;
    }
  }

  let solution;

  try {
    solution = solveLinearSystem(matrix, rhs);
  } catch (error) {
    if (
      error.message.includes('singular') ||
      error.message.includes('numerically unstable')
    ) {
      throw new Error('Mesh matrix is singular.', { cause: error });
    }

    throw error;
  }

  ensureFiniteResults(solution, 'Mesh solution');

  const meshCurrents = meshes.map((mesh, index) => ({
    name: mesh.name || `Mesh ${index + 1}`,
    current: solution[index],
  }));

  // Calculate current and power in each unique resistor branch.
  const resistorResults = Array.from(resistorMap.values()).map(branch => {
    const current = branch.directions.reduce(
      (sum, direction, index) => sum + direction * solution[index],
      0
    );

    const voltageDrop = current * branch.resistance;
    const power = current * current * branch.resistance;

    ensureFiniteResults(
      [current, voltageDrop, power],
      `${branch.name} results`
    );

    return {
      name: branch.name,
      resistance: branch.resistance,
      current,
      voltageDrop,
      power,
    };
  });

  const totalResistorPower = resistorResults.reduce(
    (sum, resistor) => sum + resistor.power,
    0
  );

  const totalSourcePowerSupplied = meshes.reduce(
    (sum, mesh, index) => {
      const meshSourceVoltage = (mesh.voltageSources ?? []).reduce(
        (sourceSum, source) => sourceSum + source.voltageRise,
        0
      );

      return sum + meshSourceVoltage * solution[index];
    },
    0
  );

  const powerBalanceError =
    totalResistorPower - totalSourcePowerSupplied;

  ensureFiniteResults(
    [
      totalResistorPower,
      totalSourcePowerSupplied,
      powerBalanceError,
    ],
    'Mesh verification'
  );

  return {
    meshCurrents,
    resistors: resistorResults,
    totalResistorPower,
    totalSourcePowerSupplied,
    powerBalanceError,
  };
}
