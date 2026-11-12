
import { describe, it, expect } from 'vitest';
import { analyzeAdvancedCircuit } from '../advancedCircuitEngine.js';

describe('MNA Circuit Validation', () => {
  it('rejects a null resistor', () => {
    expect(() =>
      analyzeAdvancedCircuit({
        resistors: [null],
        voltageSources: [],
      })
    ).toThrow('Resistor 1 is invalid.');
  });

  it('rejects a null voltage source', () => {
    expect(() =>
      analyzeAdvancedCircuit({
        resistors: [
          { fromNode: 'N1', toNode: 'GND', resistance: 100 },
        ],
        voltageSources: [null],
      })
    ).toThrow('Voltage source 1 is invalid.');
  });

  it('rejects a floating resistor network', () => {
    expect(() =>
      analyzeAdvancedCircuit({
        groundNode: 'GND',
        resistors: [
          { name: 'R1', fromNode: 'N1', toNode: 'N2', resistance: 100 },
          { name: 'R2', fromNode: 'N2', toNode: 'N3', resistance: 200 },
        ],
        voltageSources: [],
      })
    ).toThrow(
      'Circuit contains nodes disconnected from ground: N1, N2, N3.'
    );
  });

  it('rejects a floating voltage source network', () => {
    expect(() =>
      analyzeAdvancedCircuit({
        groundNode: 'GND',
        resistors: [
          { name: 'R1', fromNode: 'N1', toNode: 'GND', resistance: 100 },
        ],
        voltageSources: [
          { name: 'V1', positive: 'N2', negative: 'N3', voltage: 5 },
        ],
      })
    ).toThrow(
      'Circuit contains nodes disconnected from ground: N2, N3.'
    );
  });

  it('accepts a circuit connected to ground through a voltage source', () => {
    const result = analyzeAdvancedCircuit({
      groundNode: 'GND',
      resistors: [
        { name: 'R1', fromNode: 'N1', toNode: 'GND', resistance: 100 },
      ],
      voltageSources: [
        { name: 'V1', positive: 'N1', negative: 'GND', voltage: 10 },
      ],
    });

    expect(result.nodeVoltages.N1).toBeCloseTo(10);
    expect(result.resistors[0].current).toBeCloseTo(0.1);
  });
});
