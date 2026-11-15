import { describe, it, expect } from 'vitest';

import {
    analyzeParallelRLC,
    analyzeRLCResonance,
    analyzeRLCQualityBandwidth,
    analyzePhasor,
    analyzeFrequencyResponse
} from '../advancedAcEngine.js';

describe('Advanced AC Circuit Engine', () => {

    describe('Parallel RLC Analysis', () => {
        const input = {
            voltage: 120,
            frequency: 60,
            resistance: 120,
            inductance: 0.1,
            capacitance: 100e-6
        };

        it('calculates parallel RLC branch currents', () => {
            const result = analyzeParallelRLC(input);

            expect(result.resistorCurrent).toBeCloseTo(1);
            expect(result.inductorCurrent).toBeGreaterThan(0);
            expect(result.capacitorCurrent).toBeGreaterThan(0);
            expect(result.totalCurrent).toBeGreaterThan(1);
        });

        it('calculates impedance and power factor', () => {
            const result = analyzeParallelRLC(input);

            expect(result.impedance).toBeGreaterThan(0);
            expect(result.admittance).toBeCloseTo(
                1 / result.impedance
            );
            expect(result.powerFactor).toBeGreaterThan(0);
            expect(result.powerFactor).toBeLessThanOrEqual(1);
        });

        it('returns positive reactive power for an inductive circuit', () => {
            const result = analyzeParallelRLC({
                ...input,
                frequency: 30
            });

            expect(result.circuitType).toBe('Inductive');
            expect(result.reactivePower).toBeGreaterThan(0);
        });

        it('returns negative reactive power for a capacitive circuit', () => {
            const result = analyzeParallelRLC(input);

            expect(result.circuitType).toBe('Capacitive');
            expect(result.reactivePower).toBeLessThan(0);
        });

        it('identifies parallel resonance', () => {
            const inductance = 0.1;
            const capacitance = 100e-6;

            const frequency =
                1 / (2 * Math.PI * Math.sqrt(inductance * capacitance));

            const result = analyzeParallelRLC({
                ...input,
                frequency
            });

            expect(result.circuitType).toBe('Resistive');
            expect(result.totalCurrent).toBeCloseTo(1);
            expect(result.impedance).toBeCloseTo(120);
            expect(result.powerFactor).toBeCloseTo(1);
            expect(result.reactivePower).toBeCloseTo(0, 8);
        });

        it('classifies tiny but significant reactive current correctly', () => {
            const result = analyzeParallelRLC({
                voltage: 1e-12,
                frequency: 30,
                resistance: 120,
                inductance: 0.1,
                capacitance: 100e-6
            });

            expect(result.netReactiveCurrent).toBeLessThan(0);
            expect(result.circuitType).toBe('Inductive');
            expect(result.reactivePower).toBeGreaterThan(0);
        });

        it('treats floating-point cancellation at resonance as resistive', () => {
            const inductance = 0.1;
            const capacitance = 100e-6;
            const frequency =
                1 / (2 * Math.PI * Math.sqrt(inductance * capacitance));

            const result = analyzeParallelRLC({
                voltage: 120,
                frequency,
                resistance: 120,
                inductance,
                capacitance
            });

            expect(result.netReactiveCurrent).toBe(0);
            expect(result.circuitType).toBe('Resistive');
            expect(result.reactivePower).toBe(0);
        });

        it('rejects invalid parallel circuit inputs', () => {
            expect(() =>
                analyzeParallelRLC({
                    ...input,
                    resistance: 0
                })
            ).toThrow();

            expect(() =>
                analyzeParallelRLC({
                    ...input,
                    frequency: Infinity
                })
            ).toThrow();
        });
    });


    describe('RLC Resonance', () => {
        it('calculates resonant frequency correctly', () => {
            const result = analyzeRLCResonance({
                inductance: 0.1,
                capacitance: 100e-6
            });

            expect(result.resonantFrequency).toBeCloseTo(50.3292, 3);
            expect(result.angularResonantFrequency).toBeCloseTo(
                2 * Math.PI * result.resonantFrequency
            );
        });

        it('rejects invalid component values', () => {
            expect(() =>
                analyzeRLCResonance({
                    inductance: 0,
                    capacitance: 100e-6
                })
            ).toThrow();
        });
    });


    describe('Quality Factor and Bandwidth', () => {
        const input = {
            resistance: 10,
            inductance: 0.1,
            capacitance: 100e-6
        };

        it('calculates series quality factor and bandwidth', () => {
            const result = analyzeRLCQualityBandwidth({
                ...input,
                topology: 'series'
            });

            expect(result.qualityFactor).toBeGreaterThan(0);
            expect(result.bandwidth).toBeCloseTo(
                input.resistance / (2 * Math.PI * input.inductance)
            );

            expect(result.upperCutoffFrequency).toBeGreaterThan(
                result.lowerCutoffFrequency
            );
        });

        it('calculates parallel quality factor and bandwidth', () => {
            const result = analyzeRLCQualityBandwidth({
                ...input,
                topology: 'parallel'
            });

            expect(result.qualityFactor).toBeCloseTo(
                input.resistance *
                Math.sqrt(input.capacitance / input.inductance)
            );

            expect(result.bandwidth).toBeCloseTo(
                1 / (2 * Math.PI * input.resistance * input.capacitance)
            );

            expect(result.upperCutoffFrequency).toBeGreaterThan(
                result.lowerCutoffFrequency
            );
        });

        it('validates the topology', () => {
            expect(() =>
                analyzeRLCQualityBandwidth({
                    ...input,
                    topology: 'invalid'
                })
            ).toThrow();
        });

        it('checks the cutoff frequency bandwidth relationship', () => {
            const result = analyzeRLCQualityBandwidth({
                ...input,
                topology: 'series'
            });

            expect(
                result.upperCutoffFrequency -
                result.lowerCutoffFrequency
            ).toBeCloseTo(result.bandwidth);
        });
    });


    describe('Phasor Analysis', () => {
        it('converts rectangular phasor to polar form', () => {
            const result = analyzePhasor({
                real: 3,
                imaginary: 4
            });

            expect(result.magnitude).toBeCloseTo(5);
            expect(result.phaseAngleDegrees).toBeCloseTo(
                53.1301,
                3
            );
        });

        it('handles negative phase angles', () => {
            const result = analyzePhasor({
                real: 3,
                imaginary: -4
            });

            expect(result.magnitude).toBeCloseTo(5);
            expect(result.phaseAngleDegrees).toBeLessThan(0);
        });

        it('rejects non-finite phasor components', () => {
            expect(() =>
                analyzePhasor({
                    real: Infinity,
                    imaginary: 4
                })
            ).toThrow();
        });
    });


    describe('Frequency Response', () => {
        const input = {
            voltage: 12,
            resistance: 100,
            inductance: 0.1,
            capacitance: 100e-6,
            startFrequency: 10,
            endFrequency: 100,
            points: 5
        };

        it('generates the requested series frequency points', () => {
            const result = analyzeFrequencyResponse({
                ...input,
                topology: 'series'
            });

            expect(result.frequencyData).toHaveLength(5);
            expect(result.frequencyData[0].frequency).toBe(10);
            expect(result.frequencyData[4].frequency).toBe(100);
        });

        it('calculates valid impedance and current values', () => {
            const result = analyzeFrequencyResponse({
                ...input,
                topology: 'series'
            });

            for (const point of result.frequencyData) {
                expect(point.impedance).toBeGreaterThan(0);
                expect(point.current).toBeGreaterThan(0);
                expect(point.powerFactor).toBeGreaterThan(0);
                expect(point.powerFactor).toBeLessThanOrEqual(1);
            }
        });

        it('supports parallel frequency response', () => {
            const result = analyzeFrequencyResponse({
                ...input,
                topology: 'parallel'
            });

            expect(result.frequencyData).toHaveLength(5);

            for (const point of result.frequencyData) {
                expect(point.impedance).toBeGreaterThan(0);
                expect(point.current).toBeGreaterThan(0);
            }
        });

        it('reports series resonance and sampled extrema', () => {
            const result = analyzeFrequencyResponse({
                ...input,
                startFrequency: 20,
                endFrequency: 100,
                points: 81,
                topology: 'series'
            });

            expect(result.resonantFrequency).toBeCloseTo(50.3292, 3);
            expect(result.resonanceInRange).toBe(true);
            expect(result.resonanceBehavior).toContain('Minimum impedance');

            expect(result.sampledExtrema.minimumImpedance.value)
                .toBeLessThan(result.sampledExtrema.maximumImpedance.value);

            expect(result.sampledExtrema.maximumCurrent.value)
                .toBeGreaterThan(result.sampledExtrema.minimumCurrent.value);
        });

        it('reports parallel resonance with maximum impedance', () => {
            const result = analyzeFrequencyResponse({
                ...input,
                startFrequency: 20,
                endFrequency: 100,
                points: 81,
                topology: 'parallel'
            });

            expect(result.resonanceInRange).toBe(true);
            expect(result.resonanceBehavior).toContain('Maximum impedance');

            expect(result.sampledExtrema.maximumImpedance.value)
                .toBeGreaterThan(result.sampledExtrema.minimumImpedance.value);

            expect(result.sampledExtrema.minimumCurrent.value)
                .toBeLessThan(result.sampledExtrema.maximumCurrent.value);
        });

        it('identifies when resonance is outside the sweep range', () => {
            const result = analyzeFrequencyResponse({
                ...input,
                startFrequency: 100,
                endFrequency: 200,
                topology: 'series'
            });

            expect(result.resonanceInRange).toBe(false);
            expect(result.resonantFrequency).toBeCloseTo(50.3292, 3);
        });

        it('reports valid frequencies for all sampled extrema', () => {
            const result = analyzeFrequencyResponse({
                ...input,
                topology: 'series'
            });

            for (const extremum of Object.values(result.sampledExtrema)) {
                expect(extremum.frequency).toBeGreaterThanOrEqual(
                    result.startFrequency
                );
                expect(extremum.frequency).toBeLessThanOrEqual(
                    result.endFrequency
                );
                expect(Number.isFinite(extremum.value)).toBe(true);
            }
        });

        it('rejects an invalid frequency range', () => {
            expect(() =>
                analyzeFrequencyResponse({
                    ...input,
                    endFrequency: 10
                })
            ).toThrow();
        });

        it('rejects an invalid number of frequency points', () => {
            expect(() =>
                analyzeFrequencyResponse({
                    ...input,
                    points: 1
                })
            ).toThrow();
        });

        it('rejects unsupported topology', () => {
            expect(() =>
                analyzeFrequencyResponse({
                    ...input,
                    topology: 'invalid'
                })
            ).toThrow();
        });
    });
});
