
function gaussianElimination(matrix, vector) {
  const n = vector.length;
  const a = matrix.map((row, i) => [...row, vector[i]]);

  for (let col = 0; col < n; col++) {
    let pivot = col;

    for (let row = col + 1; row < n; row++) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) {
        pivot = row;
      }
    }

    if (Math.abs(a[pivot][col]) < 1e-12) {
      throw new Error('Mesh matrix is singular.');
    }

    [a[col], a[pivot]] = [a[pivot], a[col]];

    const divisor = a[col][col];

    for (let j = col; j <= n; j++) {
      a[col][j] /= divisor;
    }

    for (let row = 0; row < n; row++) {
      if (row === col) continue;

      const factor = a[row][col];

      for (let j = col; j <= n; j++) {
        a[row][j] -= factor * a[col][j];
      }
    }
  }

  return a.map(row => row[n]);
}

function validateMeshes(meshes) {
  if (!Array.isArray(meshes) || meshes.length === 0) {
    throw new Error('Add at least one mesh.');
  }

  const resistorMap = new Map();

  meshes.forEach((mesh, meshIndex) => {
    if (!mesh || typeof mesh !== 'object') {
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
      const name = resistor?.name;

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

        if (Math.abs(existing.resistance - resistor.resistance) > 1e-12) {
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
        !Number.isFinite(source?.voltageRise) ||
        typeof source.name !== 'string' ||
        !source.name.trim()
      ) {
        throw new Error(
          `Mesh ${meshIndex + 1}, voltage source ${sourceIndex + 1} is invalid.`
        );
      }
    });
  });

  return resistorMap;
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

      for (let j = 0; j < meshCount; j++) {
        const directionJ =
          resistorMap.get(resistor.name).directions[j];

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

  const solution = gaussianElimination(matrix, rhs);

  const meshCurrents = meshes.map((mesh, index) => ({
    name: mesh.name || `Mesh ${index + 1}`,
    current: solution[index],
  }));

  // Calculate current and power in every unique resistor branch.
  const resistorResults = Array.from(resistorMap.values()).map(branch => {
    const current = branch.directions.reduce(
      (sum, direction, index) => sum + direction * solution[index],
      0
    );

    return {
      name: branch.name,
      resistance: branch.resistance,
      current,
      voltageDrop: current * branch.resistance,
      power: current * current * branch.resistance,
    };
  });

  const totalResistorPower = resistorResults.reduce(
    (sum, resistor) => sum + resistor.power,
    0
  );

  // Positive voltageRise means a source voltage rise along mesh direction.
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

  return {
    meshCurrents,
    resistors: resistorResults,
    totalResistorPower,
    totalSourcePowerSupplied,
    powerBalanceError:
      totalResistorPower - totalSourcePowerSupplied,
  };
}
