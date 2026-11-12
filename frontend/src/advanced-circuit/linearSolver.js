
/**
 * CircuitSage AI - Linear Equation Solver
 *
 * Solves A * x = b using Gaussian elimination
 * with scaled partial pivoting.
 */

export function solveLinearSystem(
  matrix,
  vector,
  { relativeTolerance = 1e-12 } = {}
) {
  if (!Array.isArray(matrix) || !Array.isArray(vector)) {
    throw new Error('Matrix and vector must be arrays.');
  }

  const n = vector.length;

  if (n === 0 || matrix.length !== n) {
    throw new Error('Matrix dimensions must match the vector.');
  }

  if (
    !Number.isFinite(relativeTolerance) ||
    relativeTolerance <= 0
  ) {
    throw new Error('Relative tolerance must be positive and finite.');
  }

  const A = matrix.map((row, index) => {
    if (!Array.isArray(row) || row.length !== n) {
      throw new Error('Matrix must be square.');
    }

    if (!row.every(Number.isFinite)) {
      throw new Error(`Matrix row ${index + 1} contains invalid values.`);
    }

    return [...row];
  });

  if (!vector.every(Number.isFinite)) {
    throw new Error('Vector contains invalid values.');
  }

  const b = [...vector];

  // Scale each row using its largest absolute coefficient.
  const scales = A.map(row =>
    Math.max(...row.map(Math.abs))
  );

  if (scales.some(scale => scale === 0)) {
    throw new Error('Matrix is singular.');
  }

  // Forward elimination with scaled partial pivoting.
  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    let bestRatio = -1;

    for (let row = col; row < n; row++) {
      const ratio = Math.abs(A[row][col]) / scales[row];

      if (ratio > bestRatio) {
        bestRatio = ratio;
        pivotRow = row;
      }
    }

    if (
      Math.abs(A[pivotRow][col]) <=
      relativeTolerance * scales[pivotRow]
    ) {
      throw new Error('Matrix is singular or numerically unstable.');
    }

    [A[col], A[pivotRow]] = [A[pivotRow], A[col]];
    [b[col], b[pivotRow]] = [b[pivotRow], b[col]];
    [scales[col], scales[pivotRow]] = [
      scales[pivotRow],
      scales[col],
    ];

    const pivot = A[col][col];

    for (let row = col + 1; row < n; row++) {
      const factor = A[row][col] / pivot;

      if (!Number.isFinite(factor)) {
        throw new Error('Numerical instability during elimination.');
      }

      A[row][col] = 0;

      for (let j = col + 1; j < n; j++) {
        A[row][j] -= factor * A[col][j];
      }

      b[row] -= factor * b[col];

      if (
        !A[row].every(Number.isFinite) ||
        !Number.isFinite(b[row])
      ) {
        throw new Error('Non-finite value during elimination.');
      }
    }
  }

  // Back substitution.
  const solution = Array(n).fill(0);

  for (let row = n - 1; row >= 0; row--) {
    let sum = b[row];

    for (let col = row + 1; col < n; col++) {
      sum -= A[row][col] * solution[col];
    }

    solution[row] = sum / A[row][row];

    if (!Number.isFinite(solution[row])) {
      throw new Error('Solution contains non-finite values.');
    }
  }

  return solution;
}
