
import { useId } from 'react';

function CircuitSchematic({
  voltage = 12,
  connection = 'series',
  resistors = [],
  results = null,
}) {
  const markerId = useId().replace(/:/g, '');
  const validResistors = Array.isArray(resistors) ? resistors : [];
  const count = validResistors.length;

  const hasResults =
    results &&
    results.connection === connection &&
    Array.isArray(results.resistors) &&
    results.resistors.length === count;

  const formatValue = (value, digits = 3) =>
    Number.isFinite(value) ? value.toFixed(digits) : '—';

  const analyzedResistors = hasResults ? results.resistors : [];
  const totalCurrent = hasResults ? results.totalCurrent : null;

  const renderSource = (sourceX, topY, bottomY, centerY) => (
    <g>
      <path
        d={`M${sourceX} ${topY} V${centerY - 12}
            M${sourceX} ${centerY + 12} V${bottomY}`}
        fill="none"
        stroke="#60adff"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d={`M${sourceX - 17} ${centerY - 12} H${sourceX + 17}
            M${sourceX - 10} ${centerY + 12} H${sourceX + 10}`}
        fill="none"
        stroke="#e9b96d"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <g fill="#e9b96d" fontSize="13" fontWeight="bold">
        <text x={sourceX + 22} y={centerY - 8}>+</text>
        <text x={sourceX + 22} y={centerY + 18}>−</text>
      </g>

      <text
        x={sourceX}
        y="28"
        fill="#91a4bd"
        fontSize="12"
        textAnchor="middle"
      >
        DC Source
      </text>

      <text
        x={sourceX}
        y="45"
        fill="#82c2ff"
        fontSize="12"
        textAnchor="middle"
      >
        {formatValue(Number(voltage), 2)} V
      </text>
    </g>
  );

  const renderResistor = ({
    x,
    y,
    resistor,
    result,
    index,
  }) => {
    const name = result?.name || resistor.name || `R${index + 1}`;

    return (
      <g key={resistor.id ?? name ?? index}>
        <path
          d={`M${x} ${y}
              l8 -10 l10 20 l10 -20 l10 20 l10 -20 l7 10`}
          fill="none"
          stroke="#e9b96d"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <text
          x={x + 28}
          y={y - 22}
          fill="#b8d8fa"
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
        >
          {name}
        </text>

        <text
          x={x + 28}
          y={y + 29}
          fill="#e9b96d"
          fontSize="11"
          textAnchor="middle"
        >
          {formatValue(resistor.resistance, 2)} Ω
        </text>

        <text
          x={x + 28}
          y={y + 46}
          fill="#55d9a5"
          fontSize="10"
          textAnchor="middle"
        >
          {result ? `${formatValue(result.current, 4)} A` : 'Current: —'}
        </text>

        <text
          x={x + 28}
          y={y + 61}
          fill="#82c2ff"
          fontSize="10"
          textAnchor="middle"
        >
          {result ? `${formatValue(result.voltageDrop, 3)} V` : 'Voltage: —'}
        </text>
      </g>
    );
  };

  const renderSeries = () => {
    const sourceX = 70;
    const topY = 130;
    const bottomY = 300;
    const centerY = 215;
    const resistorStart = 170;
    const resistorSpacing = 130;
    const rightRail = resistorStart + (count - 1) * resistorSpacing + 95;
    const width = Math.max(480, rightRail + 70);
    const height = 410;

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="circuit-schematic"
        role="img"
        aria-label="Series resistor circuit with electrical values"
      >
        <defs>
          <marker
            id={markerId}
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0 0 L6 3 L0 6 Z" fill="#55d9a5" />
          </marker>
        </defs>

        <g
          fill="none"
          stroke="#60adff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Top connection from source to first resistor */}
          <path d={`M${sourceX} ${topY} H${resistorStart}`} />

          {/* Connections between resistors */}
          {validResistors.slice(0, -1).map((resistor, index) => {
            const x = resistorStart + index * resistorSpacing;

            return (
              <path
                key={resistor.id ?? index}
                d={`M${x + 55} ${topY} H${x + resistorSpacing}`}
              />
            );
          })}

          {/* Final connection and return path */}
          <path
            d={`M${rightRail - 40} ${topY}
                H${rightRail}
                V${bottomY}
                H${sourceX}`}
          />

          {/* Conventional current direction */}
          <path
            d={`M${sourceX + 30} ${topY} H${sourceX + 70}`}
            stroke="#55d9a5"
            strokeWidth="2"
            markerEnd={`url(#${markerId})`}
          />
        </g>

        {renderSource(sourceX, topY, bottomY, centerY)}

        {validResistors.map((resistor, index) =>
          renderResistor({
            x: resistorStart + index * resistorSpacing,
            y: topY,
            resistor,
            result: analyzedResistors[index],
            index,
          })
        )}

        <text
          x={width / 2}
          y="355"
          fill="#55d9a5"
          fontSize="12"
          textAnchor="middle"
        >
          {hasResults
            ? `Total Current: ${formatValue(totalCurrent, 4)} A`
            : 'Run analysis to view calculated current'}
        </text>

        <text
          x={width / 2}
          y="378"
          fill="#91a4bd"
          fontSize="11"
          textAnchor="middle"
        >
          SERIES NETWORK
        </text>
      </svg>
    );
  };

  const renderParallel = () => {
    const sourceX = 70;
    const leftRail = 140;
    const rightRail = 480;
    const resistorX = 220;
    const topY = 85;
    const rowStart = 145;
    const rowGap = 105;

    const branchPositions = validResistors.map(
      (_, index) => rowStart + index * rowGap
    );

    const bottomRail = branchPositions[count - 1] + 55;
    const centerY = (topY + bottomRail) / 2;
    const height = bottomRail + 115;

    return (
      <svg
        viewBox={`0 0 540 ${height}`}
        className="circuit-schematic"
        role="img"
        aria-label="Parallel resistor circuit with branch currents and voltage drops"
      >
        <defs>
          <marker
            id={markerId}
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0 0 L6 3 L0 6 Z" fill="#55d9a5" />
          </marker>
        </defs>

        <g
          fill="none"
          stroke="#60adff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Main supply connections and parallel rails */}
          <path
            d={`M${sourceX} ${topY} H${leftRail}
                M${sourceX} ${bottomRail} H${leftRail}
                M${leftRail} ${topY} V${bottomRail}
                M${rightRail} ${topY} V${bottomRail}`}
          />

          {/* Branch wires */}
          {branchPositions.map((y, index) => (
            <path
              key={index}
              d={`M${leftRail} ${y} H${resistorX}
                  M${resistorX + 55} ${y} H${rightRail}`}
            />
          ))}

          {/* Branch current arrows */}
          {branchPositions.map((y, index) => (
            <path
              key={index}
              d={`M385 ${y} H430`}
              stroke="#55d9a5"
              strokeWidth="2"
              markerEnd={`url(#${markerId})`}
            />
          ))}
        </g>

        {renderSource(sourceX, topY, bottomRail, centerY)}

        {validResistors.map((resistor, index) => {
          const y = branchPositions[index];
          const result = analyzedResistors[index];
          const name = result?.name || resistor.name || `R${index + 1}`;

          return (
            <g key={resistor.id ?? name ?? index}>
              <path
                d={`M${resistorX} ${y}
                    l8 -10 l10 20 l10 -20 l10 20 l10 -20 l7 10`}
                fill="none"
                stroke="#e9b96d"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <text
                x="310"
                y={y - 23}
                fill="#b8d8fa"
                fontSize="12"
                fontWeight="bold"
              >
                {name}
              </text>

              <text
                x="310"
                y={y - 8}
                fill="#e9b96d"
                fontSize="10"
              >
                {formatValue(resistor.resistance, 2)} Ω
              </text>

              <text
                x="310"
                y={y + 9}
                fill="#55d9a5"
                fontSize="10"
              >
                {result
                  ? `${formatValue(result.current, 4)} A`
                  : 'Current: —'}
              </text>

              <text
                x="310"
                y={y + 25}
                fill="#82c2ff"
                fontSize="10"
              >
                {result
                  ? `${formatValue(result.voltageDrop, 3)} V`
                  : 'Voltage: —'}
              </text>
            </g>
          );
        })}

        <text
          x="285"
          y={height - 48}
          fill="#55d9a5"
          fontSize="12"
          textAnchor="middle"
        >
          {hasResults
            ? `Total Current: ${formatValue(totalCurrent, 4)} A`
            : 'Run analysis to view calculated current'}
        </text>

        <text
          x="285"
          y={height - 25}
          fill="#91a4bd"
          fontSize="11"
          textAnchor="middle"
        >
          PARALLEL NETWORK
        </text>
      </svg>
    );
  };

  if (count === 0) {
    return (
      <div className="circuit-empty-results">
        No resistors available to display.
      </div>
    );
  }

  return connection === 'parallel' ? renderParallel() : renderSeries();
}

export default CircuitSchematic;
