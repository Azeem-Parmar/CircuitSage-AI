
export function generateWaveform({
  type = 'sine',
  amplitude = 5,
  frequency = 50,
  phase = 0,
  offset = 0,
  cycles = 2,
  samples = 1000
}) {
  if (!['sine', 'square', 'triangle', 'sawtooth'].includes(type)) {
    throw new Error('Unsupported waveform type');
  }

  if (!Number.isFinite(amplitude) || amplitude < 0) {
    throw new Error('Amplitude must be a non-negative number');
  }

  if (!Number.isFinite(frequency) || frequency <= 0) {
    throw new Error('Frequency must be greater than zero');
  }

  if (!Number.isFinite(phase)) {
    throw new Error('Phase must be a finite number');
  }

  if (!Number.isFinite(offset)) {
    throw new Error('DC offset must be a finite number');
  }

  if (!Number.isInteger(cycles) || cycles < 1 || cycles > 10) {
    throw new Error('Cycles must be between 1 and 10');
  }

  if (!Number.isInteger(samples) || samples < 100 || samples > 5000) {
    throw new Error('Samples must be between 100 and 5000');
  }

  const points = [];
  const phaseRadians = (phase * Math.PI) / 180;

  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * (cycles / frequency);
    const angle = 2 * Math.PI * frequency * t + phaseRadians;

    let value;

    switch (type) {
      case 'sine':
        value = amplitude * Math.sin(angle);
        break;

      case 'square':
        value = Math.sin(angle) >= 0 ? amplitude : -amplitude;
        break;

      case 'triangle':
        value = (2 * amplitude / Math.PI) * Math.asin(Math.sin(angle));
        break;

      case 'sawtooth':
        value = (amplitude / Math.PI) * 2 *
          ((angle / (2 * Math.PI) -
          Math.floor(angle / (2 * Math.PI))) - 0.5);
        break;

      default:
        value = 0;
    }

    points.push({
      time: t,
      value: value + offset
    });
  }

  return points;
}
