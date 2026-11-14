
const TWO_PI = 2 * Math.PI;

function validatePositiveInputs(inputs) {
    for (const [name, value] of Object.entries(inputs)) {
        if (!Number.isFinite(value) || value <= 0) {
            throw new Error(`${name} must be a finite number greater than zero.`);
        }
    }
}

function validateFiniteResults(results) {
    for (const [name, value] of Object.entries(results)) {
        if (typeof value === 'number' && !Number.isFinite(value)) {
            throw new Error(
                `Calculated ${name} is outside the supported numerical range.`
            );
        }
    }

    return results;
}

// 1. PARALLEL RLC ANALYSIS
// Ideal parallel circuit: R, L and C connected across the same RMS voltage.

export function analyzeParallelRLC({
    voltage,
    frequency,
    resistance,
    inductance,
    capacitance
}) {
    validatePositiveInputs({
        'RMS voltage': voltage,
        Frequency: frequency,
        Resistance: resistance,
        Inductance: inductance,
        Capacitance: capacitance
    });

    const angularFrequency = TWO_PI * frequency;

    const inductiveReactance = angularFrequency * inductance;
    const capacitiveReactance = 1 / (angularFrequency * capacitance);

    const resistorCurrent = voltage / resistance;
    const inductorCurrent = voltage / inductiveReactance;
    const capacitorCurrent = voltage / capacitiveReactance;

    const netReactiveCurrent = capacitorCurrent - inductorCurrent;

    const totalCurrent = Math.hypot(
        resistorCurrent,
        netReactiveCurrent
    );

    const impedance = voltage / totalCurrent;

    const phaseAngleRadians = Math.atan2(
        netReactiveCurrent,
        resistorCurrent
    );

    const phaseAngleDegrees =
        phaseAngleRadians * 180 / Math.PI;

    const powerFactor = Math.cos(phaseAngleRadians);

    const realPower = voltage * resistorCurrent;
    const apparentPower = voltage * totalCurrent;
    const reactivePower = -voltage * netReactiveCurrent;

    const admittance = 1 / impedance;

    const result = {
        voltage,
        frequency,
        resistance,
        inductance,
        capacitance,
        angularFrequency,
        inductiveReactance,
        capacitiveReactance,
        resistorCurrent,
        inductorCurrent,
        capacitorCurrent,
        netReactiveCurrent,
        totalCurrent,
        impedance,
        admittance,
        phaseAngleRadians,
        phaseAngleDegrees,
        powerFactor,
        realPower,
        apparentPower,
        reactivePower,
        circuitType:
            Math.abs(netReactiveCurrent) < 1e-12
                ? 'Resistive'
                : netReactiveCurrent > 0
                    ? 'Capacitive'
                    : 'Inductive'
    };

    return validateFiniteResults(result);
}


// 2. RLC RESONANCE ANALYSIS

export function analyzeRLCResonance({
    inductance,
    capacitance
}) {
    validatePositiveInputs({
        Inductance: inductance,
        Capacitance: capacitance
    });

    const resonantFrequency =
        1 / (TWO_PI * Math.sqrt(inductance * capacitance));

    const angularResonantFrequency =
        TWO_PI * resonantFrequency;

    const result = {
        inductance,
        capacitance,
        resonantFrequency,
        angularResonantFrequency
    };

    return validateFiniteResults(result);
}


// 3. QUALITY FACTOR, BANDWIDTH AND CUTOFF FREQUENCIES
//
// Series model: R, L and C in series.
// Parallel model: ideal L, C and R in parallel.

export function analyzeRLCQualityBandwidth({
    resistance,
    inductance,
    capacitance,
    topology = 'series'
}) {
    validatePositiveInputs({
        Resistance: resistance,
        Inductance: inductance,
        Capacitance: capacitance
    });

    if (!['series', 'parallel'].includes(topology)) {
        throw new Error(
            'Topology must be either series or parallel.'
        );
    }

    const resonantFrequency =
        1 / (TWO_PI * Math.sqrt(inductance * capacitance));

    let qualityFactor;
    let bandwidth;
    let lowerCutoffFrequency;
    let upperCutoffFrequency;

    if (topology === 'series') {
        qualityFactor =
            (TWO_PI * resonantFrequency * inductance) / resistance;

        bandwidth = resistance / (TWO_PI * inductance);

        const root = Math.sqrt(
            resistance ** 2 +
            4 * inductance / capacitance
        );

        lowerCutoffFrequency =
            (-resistance + root) / (TWO_PI * 2 * inductance);

        upperCutoffFrequency =
            (resistance + root) / (TWO_PI * 2 * inductance);

    } else {
        qualityFactor =
            resistance * Math.sqrt(capacitance / inductance);

        bandwidth =
            1 / (TWO_PI * resistance * capacitance);

        const root = Math.sqrt(
            (1 / resistance) ** 2 +
            4 * capacitance / inductance
        );

        lowerCutoffFrequency =
            (-1 / resistance + root) / (TWO_PI * 2 * capacitance);

        upperCutoffFrequency =
            (1 / resistance + root) / (TWO_PI * 2 * capacitance);
    }

    const result = {
        topology,
        resistance,
        inductance,
        capacitance,
        resonantFrequency,
        qualityFactor,
        bandwidth,
        lowerCutoffFrequency,
        upperCutoffFrequency
    };

    return validateFiniteResults(result);
}


// 4. PHASOR ANALYSIS
// Converts a rectangular phasor into polar form.

export function analyzePhasor({
    real,
    imaginary
}) {
    if (!Number.isFinite(real) || !Number.isFinite(imaginary)) {
        throw new Error(
            'Phasor components must be finite numbers.'
        );
    }

    const magnitude = Math.hypot(real, imaginary);

    const phaseAngleRadians = Math.atan2(imaginary, real);

    const phaseAngleDegrees =
        phaseAngleRadians * 180 / Math.PI;

    return validateFiniteResults({
        real,
        imaginary,
        magnitude,
        phaseAngleRadians,
        phaseAngleDegrees
    });
}


// 5. FREQUENCY RESPONSE ANALYSIS
//
// Returns impedance, current and power factor at each frequency.
// Supports ideal series and parallel RLC circuits.

export function analyzeFrequencyResponse({
    voltage,
    resistance,
    inductance,
    capacitance,
    startFrequency,
    endFrequency,
    points = 50,
    topology = 'series'
}) {
    validatePositiveInputs({
        'RMS voltage': voltage,
        Resistance: resistance,
        Inductance: inductance,
        Capacitance: capacitance,
        'Start frequency': startFrequency,
        'End frequency': endFrequency
    });

    if (endFrequency <= startFrequency) {
        throw new Error(
            'End frequency must be greater than start frequency.'
        );
    }

    if (
        !Number.isInteger(points) ||
        points < 2 ||
        points > 500
    ) {
        throw new Error(
            'Frequency response points must be an integer between 2 and 500.'
        );
    }

    if (!['series', 'parallel'].includes(topology)) {
        throw new Error(
            'Topology must be either series or parallel.'
        );
    }

    const frequencyData = [];

    for (let index = 0; index < points; index++) {
        const frequency =
            startFrequency +
            (endFrequency - startFrequency) *
            index / (points - 1);

        const angularFrequency = TWO_PI * frequency;

        const inductiveReactance =
            angularFrequency * inductance;

        const capacitiveReactance =
            1 / (angularFrequency * capacitance);

        let impedance;
        let phaseAngleRadians;

        if (topology === 'series') {
            const netReactance =
                inductiveReactance - capacitiveReactance;

            impedance = Math.hypot(
                resistance,
                netReactance
            );

            phaseAngleRadians = Math.atan2(
                netReactance,
                resistance
            );
        } else {
            const conductance = 1 / resistance;

            const susceptance =
                1 / capacitiveReactance -
                1 / inductiveReactance;

            const admittance = Math.hypot(
                conductance,
                susceptance
            );

            impedance = 1 / admittance;

            phaseAngleRadians = -Math.atan2(
                susceptance,
                conductance
            );
        }

        const current = voltage / impedance;

        const powerFactor = Math.cos(phaseAngleRadians);

        const point = {
            frequency,
            inductiveReactance,
            capacitiveReactance,
            impedance,
            current,
            phaseAngleDegrees:
                phaseAngleRadians * 180 / Math.PI,
            powerFactor
        };

        validateFiniteResults(point);

        frequencyData.push(point);
    }

    return {
        topology,
        voltage,
        resistance,
        inductance,
        capacitance,
        startFrequency,
        endFrequency,
        points,
        frequencyData
    };
}

