
import { describe, it, expect } from 'vitest';
import { solveLinearSystem } from '../linearSolver.js';

describe('Linear Solver - Gaussian Elimination', () => {
  it('solves a basic 2x2 linear system', () => {
    // 2x + y = 5
    // x + 3y = 6
    const result = solveLinearSystem(
      [
        [2, 1],
        [1, 3],
      ],
      [5, 6]
    );

    expect(result[0]).toBeCloseTo(1.8);
    expect(result[1]).toBeCloseTo(1.4);
  });

  it('performs pivot row swapping correctly', () => {
    // 0x + 2y = 4
    // 3x + 4y = 11
    const result = solveLinearSystem(
      [
        [0, 2],
        [3, 4],
      ],
      [4, 11]
    );

    expect(result[0]).toBeCloseTo(1);
    expect(result[1]).toBeCloseTo(2);
  });

  it('handles matrices with different numerical scales', () => {
    const result = solveLinearSystem(
      [
        [1e-12, 0],
        [0, 1e12],
      ],
      [2e-12, 3e12]
    );

    expect(result[0]).toBeCloseTo(2);
    expect(result[1]).toBeCloseTo(3);
  });

  it('rejects a singular matrix', () => {
    expect(() =>
      solveLinearSystem(
        [
          [1, 2],
          [2, 4],
        ],
        [3, 6]
      )
    ).toThrow('Matrix is singular or numerically unstable.');
  });

  it('rejects an empty matrix', () => {
    expect(() =>
      solveLinearSystem([], [])
    ).toThrow('Matrix dimensions must match the vector.');
  });

  it('rejects a non-square matrix', () => {
    expect(() =>
      solveLinearSystem(
        [
          [1, 2],
          [3, 4, 5],
        ],
        [5, 6]
      )
    ).toThrow('Matrix must be square.');
  });

  it('rejects non-finite matrix values', () => {
    expect(() =>
      solveLinearSystem(
        [
          [1, Infinity],
          [2, 3],
        ],
        [4, 5]
      )
    ).toThrow('Matrix row 1 contains invalid values.');
  });

  it('rejects non-finite vector values', () => {
    expect(() =>
      solveLinearSystem(
        [
          [1, 2],
          [3, 4],
        ],
        [5, NaN]
      )
    ).toThrow('Vector contains invalid values.');
  });

  it('rejects invalid relative tolerance', () => {
    expect(() =>
      solveLinearSystem(
        [
          [1, 0],
          [0, 1],
        ],
        [1, 2],
        { relativeTolerance: 0 }
      )
    ).toThrow('Relative tolerance must be positive and finite.');
  });
});
