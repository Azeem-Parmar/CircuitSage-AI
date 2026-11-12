
import { describe, it, expect } from 'vitest';
import { analyzeMixedCircuit } from '../mixedCircuitEngine.js';

const exampleNetwork = {
  type: 'series',
  children: [
    {
      type: 'resistor',
      name: 'R1',
      resistance: 100,
    },
    {
      type: 'parallel',
      children: [
        {
          type: 'resistor',
          name: 'R2',
          resistance: 200,
        },
        {
          type: 'resistor',
          name: 'R3',
          resistance: 300,
        },
      ],
    },
  ],
};

describe('Mixed Circuit Engine', () => {
  it('calculates mixed equivalent resistance correctly', () => {
    const result = analyzeMixedCircuit({
      voltage: 12,
      network: exampleNetwork,
    });

    expect(result.totalResistance).toBeCloseTo(220);
  });

  it('calculates total current correctly', () => {
    const result = analyzeMixedCircuit({
      voltage: 12,
      network: exampleNetwork,
    });

    expect(result.totalCurrent).toBeCloseTo(12 / 220);
  });

  it('calculates individual resistor voltage drops', () => {
    const result = analyzeMixedCircuit({
      voltage: 12,
      network: exampleNetwork,
    });

    expect(result.resistors[0].voltageDrop).toBeCloseTo(12 * 100 / 220);
    expect(result.resistors[1].voltageDrop).toBeCloseTo(12 * 120 / 220);
    expect(result.resistors[2].voltageDrop).toBeCloseTo(12 * 120 / 220);
  });

  it('calculates individual resistor currents', () => {
    const result = analyzeMixedCircuit({
      voltage: 12,
      network: exampleNetwork,
    });

    expect(result.resistors[0].current).toBeCloseTo(12 / 220);
    expect(result.resistors[1].current).toBeCloseTo((12 * 120 / 220) / 200);
    expect(result.resistors[2].current).toBeCloseTo((12 * 120 / 220) / 300);
  });

  it('calculates individual resistor power', () => {
    const result = analyzeMixedCircuit({
      voltage: 12,
      network: exampleNetwork,
    });

    result.resistors.forEach((resistor) => {
      expect(resistor.power).toBeCloseTo(
        resistor.voltageDrop * resistor.current
      );
    });

    const resistorPower = result.resistors.reduce(
      (total, resistor) => total + resistor.power,
      0
    );

    expect(resistorPower).toBeCloseTo(result.totalPower);
  });

  it('rejects invalid supply voltage', () => {
    expect(() =>
      analyzeMixedCircuit({
        voltage: 0,
        network: exampleNetwork,
      })
    ).toThrow('Voltage must be greater than zero.');
  });

  it('rejects an invalid resistor value', () => {
    expect(() =>
      analyzeMixedCircuit({
        voltage: 12,
        network: {
          type: 'resistor',
          name: 'R1',
          resistance: -100,
        },
      })
    ).toThrow('Resistor R1 must have a positive resistance.');
  });

  it('rejects a group with fewer than two children', () => {
    expect(() =>
      analyzeMixedCircuit({
        voltage: 12,
        network: {
          type: 'series',
          children: [
            {
              type: 'resistor',
              name: 'R1',
              resistance: 100,
            },
          ],
        },
      })
    ).toThrow('series groups must contain at least two elements.');
  });

  it('rejects duplicate resistor names', () => {
    expect(() =>
      analyzeMixedCircuit({
        voltage: 12,
        network: {
          type: 'series',
          children: [
            { type: 'resistor', name: 'R1', resistance: 100 },
            { type: 'resistor', name: 'R1', resistance: 200 },
          ],
        },
      })
    ).toThrow('Duplicate resistor name: R1.');
  });
});
