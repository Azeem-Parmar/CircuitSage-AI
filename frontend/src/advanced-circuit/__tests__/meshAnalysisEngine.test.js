
import { describe, it, expect } from 'vitest';
import { analyzeMeshCircuit } from '../meshAnalysisEngine.js';

describe('Mesh Analysis Engine', () => {
  it('solves two meshes sharing a resistor', () => {
    const result = analyzeMeshCircuit({
      meshes: [
        {
          name: 'Mesh 1',
          resistors: [
            { name: 'R1', resistance: 2, direction: 1 },
            { name: 'Rshared', resistance: 4, direction: 1 },
          ],
          voltageSources: [
            { name: 'V1', voltageRise: 10 },
          ],
        },
        {
          name: 'Mesh 2',
          resistors: [
            { name: 'Rshared', resistance: 4, direction: -1 },
            { name: 'R2', resistance: 6, direction: 1 },
          ],
          voltageSources: [],
        },
      ],
    });

    expect(result.meshCurrents[0].current).toBeCloseTo(25 / 11);
    expect(result.meshCurrents[1].current).toBeCloseTo(10 / 11);

    expect(result.resistors[0].current).toBeCloseTo(25 / 11);
    expect(result.resistors[1].current).toBeCloseTo(15 / 11);
    expect(result.resistors[2].current).toBeCloseTo(10 / 11);

    expect(result.totalResistorPower).toBeCloseTo(250 / 11);
    expect(result.totalSourcePowerSupplied).toBeCloseTo(250 / 11);
    expect(result.powerBalanceError).toBeCloseTo(0);
  });

  it('rejects an empty mesh list', () => {
    expect(() =>
      analyzeMeshCircuit({ meshes: [] })
    ).toThrow('Add at least one mesh.');
  });

  it('rejects non-positive resistance', () => {
    expect(() =>
      analyzeMeshCircuit({
        meshes: [
          {
            resistors: [
              { name: 'R1', resistance: 0 },
            ],
          },
        ],
      })
    ).toThrow('R1 must have positive resistance.');
  });

  it('rejects invalid resistor direction', () => {
    expect(() =>
      analyzeMeshCircuit({
        meshes: [
          {
            resistors: [
              { name: 'R1', resistance: 100, direction: 0 },
            ],
          },
        ],
      })
    ).toThrow('R1 direction must be 1 or -1.');
  });

  it('matches MNA branch currents for the same two-mesh circuit', async () => {
    const { analyzeAdvancedCircuit } = await import(
      '../advancedCircuitEngine.js'
    );

    const mnaResult = analyzeAdvancedCircuit({
      groundNode: 'GND',
      voltageSources: [
        { name: 'V1', positive: 'N1', negative: 'GND', voltage: 10 },
      ],
      resistors: [
        { name: 'R1', fromNode: 'N1', toNode: 'N2', resistance: 2 },
        { name: 'Rshared', fromNode: 'N2', toNode: 'GND', resistance: 4 },
        { name: 'R2', fromNode: 'GND', toNode: 'N2', resistance: 6 },
      ],
    });

    const meshResult = analyzeMeshCircuit({
      meshes: [
        {
          name: 'Mesh 1',
          resistors: [
            { name: 'R1', resistance: 2, direction: 1 },
            { name: 'Rshared', resistance: 4, direction: 1 },
          ],
          voltageSources: [
            { name: 'V1', voltageRise: 10 },
          ],
        },
        {
          name: 'Mesh 2',
          resistors: [
            { name: 'Rshared', resistance: 4, direction: -1 },
            { name: 'R2', resistance: 6, direction: 1 },
          ],
          voltageSources: [],
        },
      ],
    });

    const mnaSharedCurrent = mnaResult.resistors.find(
      resistor => resistor.name === 'Rshared'
    ).current;

    const meshSharedCurrent = meshResult.resistors.find(
      resistor => resistor.name === 'Rshared'
    ).current;

    expect(mnaResult.resistors.find(r => r.name === 'R1').current)
      .toBeCloseTo(meshResult.resistors.find(r => r.name === 'R1').current);

    expect(mnaSharedCurrent).toBeCloseTo(meshSharedCurrent);

    expect(
      Math.abs(mnaResult.resistors.find(r => r.name === 'R2').current)
    ).toBeCloseTo(
      Math.abs(meshResult.resistors.find(r => r.name === 'R2').current)
    );

    expect(mnaResult.totalResistorPower).toBeCloseTo(
      meshResult.totalResistorPower
    );
  });

  it('handles a negative voltage rise correctly', () => {
    const result = analyzeMeshCircuit({
      meshes: [
        {
          name: 'Mesh 1',
          resistors: [
            { name: 'R1', resistance: 100, direction: 1 },
          ],
          voltageSources: [
            { name: 'V1', voltageRise: -10 },
          ],
        },
      ],
    });

    expect(result.meshCurrents[0].current).toBeCloseTo(-0.1);
    expect(result.resistors[0].current).toBeCloseTo(-0.1);
    expect(result.resistors[0].voltageDrop).toBeCloseTo(-10);
    expect(result.resistors[0].power).toBeCloseTo(1);
    expect(result.totalSourcePowerSupplied).toBeCloseTo(1);
    expect(result.powerBalanceError).toBeCloseTo(0);
  });

  it('handles a reversed resistor reference direction', () => {
    const result = analyzeMeshCircuit({
      meshes: [
        {
          name: 'Mesh 1',
          resistors: [
            { name: 'R1', resistance: 100, direction: -1 },
          ],
          voltageSources: [
            { name: 'V1', voltageRise: 10 },
          ],
        },
      ],
    });

    expect(result.meshCurrents[0].current).toBeCloseTo(0.1);
    expect(result.resistors[0].current).toBeCloseTo(-0.1);
    expect(result.resistors[0].voltageDrop).toBeCloseTo(-10);
    expect(result.resistors[0].power).toBeCloseTo(1);
    expect(result.totalResistorPower).toBeCloseTo(1);
    expect(result.totalSourcePowerSupplied).toBeCloseTo(1);
    expect(result.powerBalanceError).toBeCloseTo(0);
  });

  it('solves two meshes with independent voltage sources', () => {
    const result = analyzeMeshCircuit({
      meshes: [
        {
          name: 'Mesh 1',
          resistors: [
            { name: 'R1', resistance: 10, direction: 1 },
            { name: 'Rshared', resistance: 5, direction: 1 },
          ],
          voltageSources: [
            { name: 'V1', voltageRise: 20 },
          ],
        },
        {
          name: 'Mesh 2',
          resistors: [
            { name: 'Rshared', resistance: 5, direction: -1 },
            { name: 'R2', resistance: 10, direction: 1 },
          ],
          voltageSources: [
            { name: 'V2', voltageRise: 10 },
          ],
        },
      ],
    });

    expect(result.meshCurrents[0].current).toBeCloseTo(1.75);
    expect(result.meshCurrents[1].current).toBeCloseTo(1.25);

    expect(result.resistors[0].current).toBeCloseTo(1.75);
    expect(result.resistors[1].current).toBeCloseTo(0.5);
    expect(result.resistors[2].current).toBeCloseTo(1.25);

    expect(result.totalResistorPower).toBeCloseTo(47.5);
    expect(result.totalSourcePowerSupplied).toBeCloseTo(47.5);
    expect(result.powerBalanceError).toBeCloseTo(0);
  });
});
