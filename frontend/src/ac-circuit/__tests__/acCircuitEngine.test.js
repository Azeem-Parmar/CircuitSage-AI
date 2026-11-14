import { describe, it, expect } from 'vitest';
import { analyzeSeriesRLC } from '../acCircuitEngine.js';

describe('AC Circuit Engine', () => {
  const validInput = {
    voltage: 230,
    frequency: 50,
    resistance: 100,
    inductance: 0.2,
    capacitance: 0.0001
  };

  it('calculates an inductive circuit', () => {
    const result = analyzeSeriesRLC(validInput);

    expect(result.circuitType).toBe('Inductive');
    expect(result.phaseAngleDegrees).toBeGreaterThan(0);
    expect(result.impedance).toBeGreaterThan(100);
  });

  it('calculates a capacitive circuit', () => {
    const result = analyzeSeriesRLC({
      ...validInput,
      inductance: 0.01,
      capacitance: 0.001
    });

    expect(result.circuitType).toBe('Capacitive');
    expect(result.phaseAngleDegrees).toBeLessThan(0);
  });

  it('calculates resonance correctly', () => {
    const inductance = 0.1;
    const capacitance = 100e-6;
    const frequency =
      1 / (2 * Math.PI * Math.sqrt(inductance * capacitance));

    const result = analyzeSeriesRLC({
      voltage: 100,
      frequency,
      resistance: 50,
      inductance,
      capacitance
    });

    expect(result.circuitType).toBe('Resistive');
    expect(result.impedance).toBeCloseTo(50);
    expect(result.current).toBeCloseTo(2);
    expect(result.phaseAngleDegrees).toBeCloseTo(0);
    expect(result.powerFactor).toBeCloseTo(1);
  });

  it('calculates resonant frequency', () => {
    const result = analyzeSeriesRLC({
      voltage: 100,
      frequency: 50,
      resistance: 50,
      inductance: 0.1,
      capacitance: 100e-6
    });

    expect(result.resonantFrequency).toBeCloseTo(50.3292, 3);
  });

  it('calculates real, apparent and reactive power', () => {
    const result = analyzeSeriesRLC({
      voltage: 100,
      frequency: 50,
      resistance: 50,
      inductance: 0.1,
      capacitance: 100e-6
    });

    expect(result.realPower).toBeGreaterThan(0);
    expect(result.apparentPower).toBeGreaterThan(0);

    expect(result.apparentPower ** 2).toBeCloseTo(
      result.realPower ** 2 + result.reactivePower ** 2,
      6
    );
  });

  it('rejects zero voltage', () => {
    expect(() =>
      analyzeSeriesRLC({ ...validInput, voltage: 0 })
    ).toThrow('RMS voltage must be greater than zero.');
  });

  it('rejects negative frequency', () => {
    expect(() =>
      analyzeSeriesRLC({ ...validInput, frequency: -50 })
    ).toThrow('Frequency must be greater than zero.');
  });

  it('rejects negative resistance', () => {
    expect(() =>
      analyzeSeriesRLC({ ...validInput, resistance: -100 })
    ).toThrow('Resistance must be greater than zero.');
  });

  it('rejects negative inductance', () => {
    expect(() =>
      analyzeSeriesRLC({ ...validInput, inductance: -0.1 })
    ).toThrow('Inductance cannot be negative.');
  });

  it('rejects negative capacitance', () => {
    expect(() =>
      analyzeSeriesRLC({ ...validInput, capacitance: -0.001 })
    ).toThrow('Capacitance cannot be negative.');
  });

  it('rejects zero inductance and zero capacitance together', () => {
    expect(() =>
      analyzeSeriesRLC({
        ...validInput,
        inductance: 0,
        capacitance: 0
      })
    ).toThrow('Inductance and capacitance cannot both be zero.');
  });

  it('supports an RL circuit without a capacitor', () => {
    const result = analyzeSeriesRLC({
      ...validInput,
      capacitance: 0
    });

    expect(result.capacitiveReactance).toBe(0);
    expect(result.circuitType).toBe('Inductive');
    expect(result.resonantFrequency).toBeNull();
  });

  it('supports an RC circuit without an inductor', () => {
    const result = analyzeSeriesRLC({
      ...validInput,
      inductance: 0
    });

    expect(result.inductiveReactance).toBe(0);
    expect(result.circuitType).toBe('Capacitive');
    expect(result.resonantFrequency).toBeNull();
  });

  it('rejects non-finite input', () => {
    expect(() =>
      analyzeSeriesRLC({
        ...validInput,
        frequency: Infinity
      })
    ).toThrow('Frequency must be a finite number.');
  });
});
