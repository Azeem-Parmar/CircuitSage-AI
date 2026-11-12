
function validateNetwork(node, names = new Set()) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) {
    throw new Error('Invalid circuit network element.');
  }

  if (node.type === 'resistor') {
    if (typeof node.name !== 'string' || !node.name.trim()) {
      throw new Error('Every resistor must have a valid name.');
    }

    if (!Number.isFinite(node.resistance) || node.resistance <= 0) {
      throw new Error(
        `Resistor ${node.name || 'unnamed'} must have a positive resistance.`
      );
    }

    const name = node.name.trim();

    if (names.has(name)) {
      throw new Error(`Duplicate resistor name: ${name}.`);
    }

    names.add(name);
    return;
  }

  if (node.type !== 'series' && node.type !== 'parallel') {
    throw new Error('Network type must be resistor, series, or parallel.');
  }

  if (!Array.isArray(node.children) || node.children.length < 2) {
    throw new Error(
      `${node.type} groups must contain at least two elements.`
    );
  }

  node.children.forEach((child) => validateNetwork(child, names));
}

function calculateEquivalentResistance(node) {
  if (node.type === 'resistor') {
    return node.resistance;
  }

  const childResistances = node.children.map(
    calculateEquivalentResistance
  );

  let equivalentResistance;

  if (node.type === 'series') {
    equivalentResistance = childResistances.reduce(
      (total, resistance) => total + resistance,
      0
    );
  } else {
    const minimumResistance = Math.min(...childResistances);

    const normalizedConductance = childResistances.reduce(
      (total, resistance) => total + minimumResistance / resistance,
      0
    );

    equivalentResistance = minimumResistance / normalizedConductance;
  }

  if (
    !Number.isFinite(equivalentResistance) ||
    equivalentResistance <= 0
  ) {
    throw new Error(
      'Unable to calculate a valid equivalent resistance.'
    );
  }

  return equivalentResistance;
}

function calculateElement(node, voltage, current, results) {
  if (node.type === 'resistor') {
    const power = voltage * current;

    if (
      !Number.isFinite(voltage) ||
      !Number.isFinite(current) ||
      !Number.isFinite(power)
    ) {
      throw new Error(
        `Calculated values for resistor ${node.name} are outside the supported numerical range.`
      );
    }

    results.push({
      name: node.name.trim(),
      resistance: node.resistance,
      voltageDrop: voltage,
      current,
      power,
    });

    return;
  }

  if (node.type === 'series') {
    node.children.forEach((child) => {
      const childResistance = calculateEquivalentResistance(child);
      const childVoltage = current * childResistance;

      calculateElement(
        child,
        childVoltage,
        current,
        results
      );
    });

    return;
  }

  if (node.type === 'parallel') {
    node.children.forEach((child) => {
      const childResistance = calculateEquivalentResistance(child);
      const childCurrent = voltage / childResistance;

      calculateElement(
        child,
        voltage,
        childCurrent,
        results
      );
    });
  }
}

export function analyzeMixedCircuit({ voltage, network } = {}) {
  if (!Number.isFinite(voltage) || voltage <= 0) {
    throw new Error('Voltage must be greater than zero.');
  }

  validateNetwork(network);

  const totalResistance = calculateEquivalentResistance(network);

  const totalCurrent = voltage / totalResistance;

  if (!Number.isFinite(totalCurrent) || totalCurrent <= 0) {
    throw new Error(
      'Circuit current is outside the supported numerical range.'
    );
  }

  const resistors = [];

  calculateElement(
    network,
    voltage,
    totalCurrent,
    resistors
  );

  const totalPower = voltage * totalCurrent;

  if (!Number.isFinite(totalPower)) {
    throw new Error(
      'Calculated total power is outside the supported numerical range.'
    );
  }

  return {
    connection: 'mixed',
    supplyVoltage: voltage,
    totalResistance,
    totalCurrent,
    totalPower,
    resistors,
  };
}
