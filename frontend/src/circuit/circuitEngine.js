
export function analyzeCircuit({
  voltage,
  resistors,
  connection = 'series',
} = {}) {
  // Validate supply voltage.
  if (!Number.isFinite(voltage) || voltage <= 0) {
    throw new Error('Voltage must be greater than zero.');
  }

  // Validate connection type.
  if (connection !== 'series' && connection !== 'parallel') {
    throw new Error('Unsupported connection type.');
  }

  // Validate resistor list.
  if (!Array.isArray(resistors) || resistors.length === 0) {
    throw new Error('Add at least one resistor.');
  }

  // Validate individual resistors.
  resistors.forEach((resistor, index) => {
    if (
      resistor === null ||
      typeof resistor !== 'object' ||
      Array.isArray(resistor)
    ) {
      throw new Error(`Resistor ${index + 1} is invalid.`);
    }

    if (
      !Number.isFinite(resistor.resistance) ||
      resistor.resistance <= 0
    ) {
      throw new Error(
        `Resistor ${index + 1} must have a positive resistance.`
      );
    }

    if (
      resistor.name !== undefined &&
      (typeof resistor.name !== 'string' ||
        resistor.name.trim().length === 0)
    ) {
      throw new Error(`Resistor ${index + 1} has an invalid name.`);
    }
  });

  let totalResistance;

  if (connection === 'series') {
    totalResistance = resistors.reduce(
      (total, resistor) => total + resistor.resistance,
      0
    );
  } else {
    const minimumResistance = Math.min(
      ...resistors.map((resistor) => resistor.resistance)
    );

    const normalizedConductance = resistors.reduce(
      (total, resistor) =>
        total + minimumResistance / resistor.resistance,
      0
    );

    totalResistance = minimumResistance / normalizedConductance;
  }

  if (!Number.isFinite(totalResistance) || totalResistance <= 0) {
    throw new Error('Unable to calculate a valid total resistance.');
  }

  const totalCurrent = voltage / totalResistance;

  if (!Number.isFinite(totalCurrent) || totalCurrent <= 0) {
    throw new Error(
      'Circuit current is outside the supported numerical range.'
    );
  }

  const results = resistors.map((resistor, index) => {
    const current =
      connection === 'series'
        ? totalCurrent
        : voltage / resistor.resistance;

    const voltageDrop =
      connection === 'series'
        ? current * resistor.resistance
        : voltage;

    const power = voltageDrop * current;

    if (
      !Number.isFinite(current) ||
      !Number.isFinite(voltageDrop) ||
      !Number.isFinite(power)
    ) {
      throw new Error(
        `Calculated values for resistor ${index + 1} are outside the supported numerical range.`
      );
    }

    return {
      name: resistor.name?.trim() || `R${index + 1}`,
      resistance: resistor.resistance,
      current,
      voltageDrop,
      power,
    };
  });

  const totalPower = voltage * totalCurrent;

  if (!Number.isFinite(totalPower)) {
    throw new Error(
      'Calculated total power is outside the supported numerical range.'
    );
  }

  return {
    connection,
    supplyVoltage: voltage,
    totalResistance,
    totalCurrent,
    totalPower,
    resistors: results,
  };
}
