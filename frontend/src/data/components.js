
const components = [
  {
    id: 1,
    name: "Resistor",
    category: "Passive",
    symbol: "R",
    description: "A resistor limits the flow of electric current in a circuit.",
    specs: [
      { label: "Unit", value: "Ohm (Ω)" },
      { label: "Common values", value: "220Ω, 1kΩ, 10kΩ" },
      { label: "Power rating", value: "0.25W, 0.5W, 1W" },
      { label: "Tolerance", value: "±1%, ±5%" }
    ],
    applications: ["Current limiting", "Voltage division", "Biasing circuits"]
  },
  {
    id: 2,
    name: "Potentiometer",
    category: "Passive",
    symbol: "VR",
    description: "A variable resistor used to adjust resistance and control voltage.",
    specs: [
      { label: "Unit", value: "Ohm (Ω)" },
      { label: "Common values", value: "1kΩ, 10kΩ, 100kΩ" },
      { label: "Terminals", value: "3" },
      { label: "Type", value: "Rotary / Linear" }
    ],
    applications: ["Volume control", "Voltage adjustment", "Calibration"]
  },
  {
    id: 3,
    name: "Ceramic Capacitor",
    category: "Passive",
    symbol: "C",
    description: "Stores electrical energy in an electric field using a ceramic dielectric.",
    specs: [
      { label: "Unit", value: "Farad (F)" },
      { label: "Common values", value: "10nF, 100nF, 1µF" },
      { label: "Dielectric", value: "Ceramic" },
      { label: "Polarity", value: "Non-polarized" }
    ],
    applications: ["Filtering", "Decoupling", "Noise suppression"]
  },
  {
    id: 4,
    name: "Electrolytic Capacitor",
    category: "Passive",
    symbol: "C",
    description: "A polarized capacitor commonly used for relatively large capacitance values.",
    specs: [
      { label: "Unit", value: "Farad (F)" },
      { label: "Common values", value: "10µF, 100µF, 1000µF" },
      { label: "Voltage rating", value: "16V, 25V, 50V" },
      { label: "Polarity", value: "Polarized" }
    ],
    applications: ["Power supply filtering", "Smoothing", "Energy storage"]
  },
  {
    id: 5,
    name: "Inductor",
    category: "Passive",
    symbol: "L",
    description: "An inductor stores energy in a magnetic field when current flows through it.",
    specs: [
      { label: "Unit", value: "Henry (H)" },
      { label: "Common values", value: "10µH, 100µH, 1mH" },
      { label: "Core", value: "Air / Ferrite / Iron" },
      { label: "Property", value: "Inductance" }
    ],
    applications: ["Filters", "DC-DC converters", "Oscillator circuits"]
  },
  {
    id: 6,
    name: "Rectifier Diode",
    category: "Semiconductor",
    symbol: "D",
    description: "Allows current to flow mainly in one direction.",
    specs: [
      { label: "Typical forward voltage", value: "Approximately 0.7V (silicon)" },
      { label: "Example model", value: "1N4007" },
      { label: "Terminals", value: "Anode and Cathode" },
      { label: "Type", value: "PN junction" }
    ],
    applications: ["AC to DC rectification", "Reverse polarity protection", "Clamping"]
  },
  {
    id: 7,
    name: "Zener Diode",
    category: "Semiconductor",
    symbol: "ZD",
    description: "A diode designed to operate in reverse breakdown for voltage regulation.",
    specs: [
      { label: "Parameter", value: "Zener voltage" },
      { label: "Common values", value: "3.3V, 5.1V, 12V" },
      { label: "Operating mode", value: "Reverse breakdown" },
      { label: "Terminals", value: "Anode and Cathode" }
    ],
    applications: ["Voltage regulation", "Voltage reference", "Overvoltage protection"]
  },
  {
    id: 8,
    name: "LED",
    category: "Semiconductor",
    symbol: "LED",
    description: "A light-emitting diode that produces light when forward biased.",
    specs: [
      { label: "Typical forward voltage", value: "Around 1.8V–3.3V depending on color" },
      { label: "Typical current", value: "Often 10–20mA for indicator LEDs" },
      { label: "Polarity", value: "Polarized" },
      { label: "Terminals", value: "Anode and Cathode" }
    ],
    applications: ["Indicators", "Displays", "Lighting"]
  },
  {
    id: 9,
    name: "NPN Transistor",
    category: "Semiconductor",
    symbol: "Q",
    description: "A bipolar junction transistor used for switching and amplification.",
    specs: [
      { label: "Type", value: "NPN" },
      { label: "Terminals", value: "Emitter, Base, Collector" },
      { label: "Example model", value: "BC547" },
      { label: "Control", value: "Base current" }
    ],
    applications: ["Switching", "Signal amplification", "Driver circuits"]
  },
  {
    id: 10,
    name: "PNP Transistor",
    category: "Semiconductor",
    symbol: "Q",
    description: "A bipolar junction transistor commonly used in high-side switching and amplification.",
    specs: [
      { label: "Type", value: "PNP" },
      { label: "Terminals", value: "Emitter, Base, Collector" },
      { label: "Example model", value: "BC557" },
      { label: "Control", value: "Base current" }
    ],
    applications: ["High-side switching", "Amplification", "Complementary circuits"]
  },
  {
    id: 11,
    name: "MOSFET",
    category: "Semiconductor",
    symbol: "M",
    description: "A voltage-controlled transistor widely used in electronic switching and power circuits.",
    specs: [
      { label: "Terminals", value: "Gate, Drain, Source" },
      { label: "Types", value: "N-channel / P-channel" },
      { label: "Control", value: "Gate-to-source voltage" },
      { label: "Example model", value: "IRFZ44N" }
    ],
    applications: ["Power switching", "Motor drivers", "DC-DC converters"]
  },
  {
    id: 12,
    name: "LDR",
    category: "Sensor",
    symbol: "LDR",
    description: "A light-dependent resistor whose resistance changes with incident light.",
    specs: [
      { label: "Parameter", value: "Resistance" },
      { label: "Behaviour", value: "Resistance decreases as light increases" },
      { label: "Type", value: "Light sensor" },
      { label: "Output", value: "Variable resistance" }
    ],
    applications: ["Automatic street lights", "Light detection", "Brightness control"]
  }
];

export default components;
