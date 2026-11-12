
import { describe, it, expect } from 'vitest';
import { analyzeAdvancedCircuit } from '../advancedCircuitEngine.js';

describe('Advanced Circuit Engine - MNA', () => {
  it('solves a mixed series-parallel resistor network', () => {
    const result = analyzeAdvancedCircuit({
      groundNode: 'GND',
      voltageSources: [
        {
          name: 'V1',
          positive: 'N1',
          negative: 'GND',
          voltage: 12,
        },
      ],
      resistors: [
        { name: 'R1', fromNode: 'N1', toNode: 'N2', resistance: 100 },
        { name: 'R2', fromNode: 'N2', toNode: 'GND', resistance: 200 },
        { name: 'R3', fromNode: 'N2', toNode: 'GND', resistance: 300 },
      ],
    });

    expect(result.nodeVoltages.N1).toBeCloseTo(12);
    expect(result.nodeVoltages.N2).toBeCloseTo(6.5454545);
    expect(result.resistors[0].current).toBeCloseTo(0.05454545);
    expect(result.resistors[1].current).toBeCloseTo(0.03272727);
    expect(result.resistors[2].current).toBeCloseTo(0.02181818);
    expect(result.totalResistorPower).toBeCloseTo(0.65454545);
    expect(result.totalSourcePower).toBeCloseTo(-0.65454545);
    expect(result.powerBalanceError).toBeCloseTo(0);
    expect(result.maxKclResidual).toBeLessThan(1e-10);

    // KCL at node N2: incoming current = outgoing currents
expect(
  result.resistors[0].current
).toBeCloseTo(
  result.resistors[1].current + result.resistors[2].current
);

// KVL through loop 1: R1 + R2 voltage drops = source voltage
expect(
  result.resistors[0].voltageDrop +
  result.resistors[1].voltageDrop
).toBeCloseTo(12);

// KVL through loop 2: R1 + R3 voltage drops = source voltage
expect(
  result.resistors[0].voltageDrop +
  result.resistors[2].voltageDrop
).toBeCloseTo(12);
  });

  it('solves a single resistor connected to a voltage source', () => {
    const result = analyzeAdvancedCircuit({
      groundNode: 'GND',
      voltageSources: [
        { positive: 'N1', negative: 'GND', voltage: 10 },
      ],
      resistors: [
        { fromNode: 'N1', toNode: 'GND', resistance: 100 },
      ],
    });

    expect(result.nodeVoltages.N1).toBeCloseTo(10);
    expect(result.resistors[0].current).toBeCloseTo(0.1);
    expect(result.resistors[0].power).toBeCloseTo(1);
  });

  it('rejects an empty resistor list', () => {
    expect(() =>
      analyzeAdvancedCircuit({ resistors: [] })
    ).toThrow('Add at least one resistor.');
  });

  it('rejects non-positive resistance', () => {
    expect(() =>
      analyzeAdvancedCircuit({
        resistors: [
          { fromNode: 'N1', toNode: 'GND', resistance: 0 },
        ],
      })
    ).toThrow('Resistor 1 must have positive resistance.');
  });

  it('rejects a resistor connected to the same node', () => {
    expect(() =>
      analyzeAdvancedCircuit({
        resistors: [
          { fromNode: 'N1', toNode: 'N1', resistance: 100 },
        ],
      })
    ).toThrow('Resistor 1 cannot connect a node to itself.');
  });

  it('rejects a floating or singular circuit', () => {
    expect(() =>
      analyzeAdvancedCircuit({
        groundNode: 'GND',
        resistors: [
          { fromNode: 'N1', toNode: 'N2', resistance: 100 },
        ],
        voltageSources: [],
      })
    ).toThrow('Circuit matrix is singular.');
  });

  it('solves a circuit with two series voltage sources', () => {
  const result = analyzeAdvancedCircuit({
    groundNode: 'GND',
    voltageSources: [
      {
        name: 'V1',
        positive: 'N1',
        negative: 'GND',
        voltage: 5,
      },
      {
        name: 'V2',
        positive: 'N2',
        negative: 'N1',
        voltage: 3,
      },
    ],
    resistors: [
      {
        name: 'R1',
        fromNode: 'N2',
        toNode: 'GND',
        resistance: 100,
      },
    ],
  });

  expect(result.nodeVoltages.N1).toBeCloseTo(5);
  expect(result.nodeVoltages.N2).toBeCloseTo(8);
  expect(result.resistors[0].current).toBeCloseTo(0.08);
  expect(result.resistors[0].power).toBeCloseTo(0.64);
  expect(result.powerBalanceError).toBeCloseTo(0);
  expect(result.maxKclResidual).toBeLessThan(1e-10);
  });

  it('solves a three-node resistor network using nodal analysis', () => {
  const result = analyzeAdvancedCircuit({
    groundNode: 'GND',
    voltageSources: [
      {
        name: 'V1',
        positive: 'N1',
        negative: 'GND',
        voltage: 12,
      },
    ],
    resistors: [
      { name: 'R1', fromNode: 'N1', toNode: 'N2', resistance: 100 },
      { name: 'R2', fromNode: 'N2', toNode: 'N3', resistance: 200 },
      { name: 'R3', fromNode: 'N3', toNode: 'GND', resistance: 300 },
    ],
  });

  expect(result.nodeVoltages.N1).toBeCloseTo(12);
  expect(result.nodeVoltages.N2).toBeCloseTo(10);
  expect(result.nodeVoltages.N3).toBeCloseTo(6);

  expect(result.resistors[0].current).toBeCloseTo(0.02);
  expect(result.resistors[1].current).toBeCloseTo(0.02);
  expect(result.resistors[2].current).toBeCloseTo(0.02);

  expect(result.resistors[0].voltageDrop).toBeCloseTo(2);
  expect(result.resistors[1].voltageDrop).toBeCloseTo(4);
  expect(result.resistors[2].voltageDrop).toBeCloseTo(6);

  expect(result.totalResistorPower).toBeCloseTo(0.24);
  expect(result.maxKclResidual).toBeLessThan(1e-10);
  expect(result.powerBalanceError).toBeCloseTo(0);
  });
  
  
it('handles a negative voltage source correctly', () => {
  const result = analyzeAdvancedCircuit({
    groundNode: 'GND',
    voltageSources: [
      {
        name: 'V1',
        positive: 'N1',
        negative: 'GND',
        voltage: -10,
      },
    ],
    resistors: [
      {
        name: 'R1',
        fromNode: 'N1',
        toNode: 'GND',
        resistance: 100,
      },
    ],
  });

  expect(result.nodeVoltages.N1).toBeCloseTo(-10);
  expect(result.resistors[0].current).toBeCloseTo(-0.1);
  expect(result.resistors[0].power).toBeCloseTo(1);
  expect(result.powerBalanceError).toBeCloseTo(0);
  expect(result.maxKclResidual).toBeLessThan(1e-10);
  });

});

