
export function analyzeSeriesRLC({
    voltage,
    frequency,
    resistance,
    inductance,
    capacitance
}) {
    const inputs = [
        ['RMS voltage', voltage, true],
        ['Frequency', frequency, true],
        ['Resistance', resistance, true],
        ['Inductance', inductance, false],
        ['Capacitance', capacitance, false]
    ];

    for (const [name, value, allowZero] of inputs) {
        if (!Number.isFinite(value)) {
            throw new Error(`${name} must be a finite number.`);
        }

        if (allowZero ? value <= 0 : value < 0) {
            throw new Error(
                allowZero
                    ? `${name} must be greater than zero.`
                    : `${name} cannot be negative.`
            );
        }
    }

    if (inductance === 0 && capacitance === 0) {
        throw new Error(
            'Inductance and capacitance cannot both be zero.'
        );
    }

    const angularFrequency = 2 * Math.PI * frequency;
    const inductiveReactance = angularFrequency * inductance;
    const capacitiveReactance = capacitance === 0
        ? 0
        : 1 / (angularFrequency * capacitance);

    const rawNetReactance =
        inductiveReactance - capacitiveReactance;

    const reactanceTolerance =
        16 * Number.EPSILON *
        Math.max(inductiveReactance, capacitiveReactance);

    const netReactance =
        Math.abs(rawNetReactance) <= reactanceTolerance
            ? 0
            : rawNetReactance;

    const impedance = Math.hypot(resistance, netReactance);

    const current = voltage / impedance;

    const phaseAngleRadians = Math.atan2(
        netReactance,
        resistance
    );

    const phaseAngleDegrees =
        (phaseAngleRadians * 180) / Math.PI;

    const powerFactor = Math.cos(phaseAngleRadians);

    const realPower = current ** 2 * resistance;
    const apparentPower = voltage * current;
    const reactivePower = current ** 2 * netReactance;

    const values = {
        angularFrequency,
        inductiveReactance,
        capacitiveReactance,
        netReactance,
        impedance,
        current,
        phaseAngleRadians,
        phaseAngleDegrees,
        powerFactor,
        realPower,
        apparentPower,
        reactivePower
    };

    for (const [name, value] of Object.entries(values)) {
        if (!Number.isFinite(value)) {
            throw new Error(
                `Calculated ${name} is outside the supported numerical range.`
            );
        }
    }

    const resonantFrequency =
        inductance > 0 && capacitance > 0
            ? 1 / (2 * Math.PI * Math.sqrt(inductance * capacitance))
            : null;

    if (
        resonantFrequency !== null &&
        !Number.isFinite(resonantFrequency)
    ) {
        throw new Error(
            'Calculated resonant frequency is outside the supported numerical range.'
        );
    }

    let circuitType = 'Resistive';

    if (netReactance > 0) {
        circuitType = 'Inductive';
    } else if (netReactance < 0) {
        circuitType = 'Capacitive';
    }

    return {
        voltage,
        frequency,
        resistance,
        inductance,
        capacitance,
        angularFrequency,
        inductiveReactance,
        capacitiveReactance,
        netReactance,
        impedance,
        current,
        phaseAngleRadians,
        phaseAngleDegrees,
        powerFactor,
        realPower,
        apparentPower,
        reactivePower,
        resonantFrequency,
        circuitType
    };
}
