
import { describe, it, expect } from 'vitest';
import { analyzeCircuit } from '../circuitEngine.js';

describe('Circuit Engine', () => {
  describe('Series Circuit', () => {
    it('calculates total resistance and current correctly', () => {
      const result = analyzeCircuit({
        voltage: 12,
        resistors: [
          { name: 'R1', resistance: 100 },
          { name: 'R2', resistance: 200 },
        ],
        connection: 'series',
      });

      expect(result.totalResistance).toBe(300);
      expect(result.totalCurrent).toBeCloseTo(0.04);
      expect(result.totalPower).toBeCloseTo(0.48);
    });

    it('calculates individual voltage drops correctly', () => {
      const result = analyzeCircuit({
        voltage: 12,
        resistors: [
          { resistance: 100 },
          { resistance: 200 },
        ],
        connection: 'series',
      });

      expect(result.resistors[0].voltageDrop).toBeCloseTo(4);
      expect(result.resistors[1].voltageDrop).toBeCloseTo(8);
      expect(result.resistors[0].current).toBeCloseTo(0.04);
    });
  });

  describe('Parallel Circuit', () => {
    it('calculates total resistance and current correctly', () => {
      const result = analyzeCircuit({
        voltage: 12,
        resistors: [
          { name: 'R1', resistance: 100 },
          { name: 'R2', resistance: 100 },
        ],
        connection: 'parallel',
      });

      expect(result.totalResistance).toBeCloseTo(50);
      expect(result.totalCurrent).toBeCloseTo(0.24);
      expect(result.totalPower).toBeCloseTo(2.88);
    });

    it('calculates individual branch currents correctly', () => {
      const result = analyzeCircuit({
        voltage: 12,
        resistors: [
          { resistance: 100 },
          { resistance: 200 },
        ],
        connection: 'parallel',
      });

      expect(result.resistors[0].current).toBeCloseTo(0.12);
      expect(result.resistors[1].current).toBeCloseTo(0.06);
      expect(result.resistors[0].voltageDrop).toBe(12);
      expect(result.resistors[1].voltageDrop).toBe(12);
    });
  });

  describe('Input Validation', () => {
    it('rejects zero voltage', () => {
      expect(() =>
        analyzeCircuit({
          voltage: 0,
          resistors: [{ resistance: 100 }],
        })
      ).toThrow('Voltage must be greater than zero.');
    });

    it('rejects negative voltage', () => {
      expect(() =>
        analyzeCircuit({
          voltage: -12,
          resistors: [{ resistance: 100 }],
        })
      ).toThrow('Voltage must be greater than zero.');
    });

    it('rejects an empty resistor list', () => {
      expect(() =>
        analyzeCircuit({
          voltage: 12,
          resistors: [],
        })
      ).toThrow('Add at least one resistor.');
    });

    it('rejects zero resistance', () => {
      expect(() =>
        analyzeCircuit({
          voltage: 12,
          resistors: [{ resistance: 0 }],
        })
      ).toThrow('Resistor 1 must have a positive resistance.');
    });

    it('rejects negative resistance', () => {
      expect(() =>
        analyzeCircuit({
          voltage: 12,
          resistors: [{ resistance: -100 }],
        })
      ).toThrow('Resistor 1 must have a positive resistance.');
    });

    it('rejects unsupported connection types', () => {
      expect(() =>
        analyzeCircuit({
          voltage: 12,
          resistors: [{ resistance: 100 }],
          connection: 'mixed',
        })
      ).toThrow('Unsupported connection type.');
    });
  });


  describe('Advanced Input Validation', () => {
    it('rejects a null resistor', () => {
      expect(() =>
        analyzeCircuit({
          voltage: 12,
          resistors: [null],
        })
      ).toThrow('Resistor 1 is invalid.');
    });

    it('rejects an array used as a resistor', () => {
      expect(() =>
        analyzeCircuit({
          voltage: 12,
          resistors: [[]],
        })
      ).toThrow('Resistor 1 is invalid.');
    });

    it('rejects a non-string resistor name', () => {
      expect(() =>
        analyzeCircuit({
          voltage: 12,
          resistors: [{ name: 123, resistance: 100 }],
        })
      ).toThrow('Resistor 1 has an invalid name.');
    });

    it('rejects an empty resistor name', () => {
      expect(() =>
        analyzeCircuit({
          voltage: 12,
          resistors: [{ name: '   ', resistance: 100 }],
        })
      ).toThrow('Resistor 1 has an invalid name.');
    });

    it('rejects series resistance overflow', () => {
      expect(() =>
        analyzeCircuit({
          voltage: 12,
          resistors: [
            { resistance: Number.MAX_VALUE },
            { resistance: Number.MAX_VALUE },
          ],
          connection: 'series',
        })
      ).toThrow('Unable to calculate a valid total resistance.');
    });

    it('rejects calculations that produce infinite power', () => {
      expect(() =>
        analyzeCircuit({
          voltage: Number.MAX_VALUE,
          resistors: [{ resistance: 1 }],
          connection: 'series',
        })
      ).toThrow(
        'Calculated values for resistor 1 are outside the supported numerical range.'
      );
    });

    it('rejects calculations where current underflows to zero', () => {
      expect(() =>
        analyzeCircuit({
          voltage: Number.MIN_VALUE,
          resistors: [{ resistance: Number.MAX_VALUE }],
          connection: 'series',
        })
      ).toThrow(
        'Circuit current is outside the supported numerical range.'
      );
    });

    it('trims whitespace from valid resistor names', () => {
      const result = analyzeCircuit({
        voltage: 12,
        resistors: [{ name: ' R1 ', resistance: 100 }],
      });

      expect(result.resistors[0].name).toBe('R1');
    });
  });

});
