
export function analyzeCircuit({
  voltage,
  resistors,
  connection = 'series'
}) {
  // Validate voltage
  if (!Number.isFinite(voltage) || voltage <= 0) {
    throw new Error('Voltage must be greater than zero.');
  }

  // Validate resistor list
  if (!Array.isArray(resistors) || resistors.length === 0) {
    throw new Error('Add at least one resistor.');
  }

  resistors.forEach((resistor, index) => {
    if (
      !Number.isFinite(resistor.resistance) ||
      resistor.resistance <= 0
    ) {
      throw new Error(
        `Resistor ${index + 1} must have a positive resistance.`
      );
    }
  });

  let totalResistance;

  if (connection === 'series') {
    totalResistance = resistors.reduce(
      (total, resistor) => total + resistor.resistance,
      0
    );
  } else if (connection === 'parallel') {
    totalResistance = 1 / resistors.reduce(
      (total, resistor) => total + 1 / resistor.resistance,
      0
    );
  } else {
    throw new Error('Unsupported connection type.');
  }

  const totalCurrent = voltage / totalResistance;

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

    return {
      name: resistor.name || `R${index + 1}`,
      resistance: resistor.resistance,
      current,
      voltageDrop,
      power
    };
  });

  const totalPower = voltage * totalCurrent;

  return {
    connection,
    supplyVoltage: voltage,
    totalResistance,
    totalCurrent,
    totalPower,
    resistors: results
  };
}
