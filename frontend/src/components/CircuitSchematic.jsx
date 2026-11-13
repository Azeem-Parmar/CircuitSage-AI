

function CircuitSchematic({
  voltage = 12,
  connection = 'series',
  resistors = [],
}) {
  const validResistors = Array.isArray(resistors) ? resistors : [];
  const count = validResistors.length;

  const arrowId = 'circuit-current-arrow';

  const renderSource = (centerY) => (
    <g>
      {/* Battery terminals */}
      <path
        d={`M60 80 V${centerY - 12} M60 ${centerY + 12} V210`}
        fill="none"
        stroke="#60adff"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Positive and negative battery plates */}
      <path
        d={`M43 ${centerY - 12} H77 M50 ${centerY + 12} H70`}
        fill="none"
        stroke="#e9b96d"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <g fill="#e9b96d" fontSize="13" fontWeight="bold">
        <text x="82" y={centerY - 8}>+</text>
        <text x="82" y={centerY + 18}>−</text>
      </g>

      <text
        x="60"
        y="35"
        fill="#91a4bd"
        fontSize="12"
        textAnchor="middle"
      >
        DC Source
      </text>

      <text
        x="60"
        y="53"
        fill="#82c2ff"
        fontSize="12"
        textAnchor="middle"
      >
        {voltage || 0} V
      </text>
    </g>
  );

  const renderSeries = () => {
    const width = Math.max(520, 280 + count * 100);
    const height = 270;
    const topY = 80;
    const bottomY = 210;
    const leftX = 60;
    const rightX = width - 60;
    const resistorWidth = 55;
    const availableWidth = rightX - 120;
    const gap = count > 0
      ? (availableWidth - count * resistorWidth) / (count + 1)
      : 0;

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="circuit-schematic"
        role="img"
        aria-label="Series resistor circuit with DC voltage source"
      >
        <defs>
          <marker
            id={arrowId}
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
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
          {/* Main circuit loop */}
          <path
            d={`M${leftX} 80 H120 M${rightX} 80 V210 H${leftX}`}
          />

          {/* Source branch */}
          <path d={`M${leftX} 80 V${topY}`} />
          <path d={`M${leftX} 210 V${bottomY}`} />

          {validResistors.map((resistor, index) => {
            const x = 120 + gap * (index + 1) + resistorWidth * index;

            const nextX =
              index === count - 1
                ? rightX
                : x + resistorWidth + gap;

            return (
              <g key={resistor.id ?? resistor.name ?? index}>
                <path
                  d={`M${x} ${topY}
                    l8 -12 l10 24 l10 -24 l10 24 l9 -12
                    H${nextX}`}
                />

                <path
                  d={`M${x - gap} ${topY} H${x}`}
                />
              </g>
            );
          })}

          {/* Conventional current direction */}
          {count > 0 && (
            <path
              d="M125 90 H165"
              stroke="#55d9a5"
              strokeWidth="2"
              markerEnd={`url(#${arrowId})`}
            />
          )}
        </g>

        {renderSource(145)}

        <g fill="#b8d8fa" fontSize="13" textAnchor="middle">
          {validResistors.map((resistor, index) => {
            const x = 120 + gap * (index + 1) + resistorWidth * index;

            return (
              <text
                key={resistor.id ?? resistor.name ?? index}
                x={x + resistorWidth / 2}
                y="60"
              >
                {resistor.name || `R${index + 1}`}
              </text>
            );
          })}
        </g>

        <text x="145" y="75" fill="#55d9a5" fontSize="11">
          I →
        </text>

        <text
          x={width / 2}
          y="250"
          fill="#91a4bd"
          fontSize="12"
          textAnchor="middle"
        >
          SERIES NETWORK
        </text>
      </svg>
    );
  };

  const renderParallel = () => {
    const height = Math.max(270, 160 + count * 75);
    const centerY = height / 2;
    const topY = 65;
    const bottomY = height - 55;
    const leftRail = 120;
    const rightRail = 420;
    const resistorStart = 205;

    return (
      <svg
        viewBox={`0 0 520 ${height}`}
        className="circuit-schematic"
        role="img"
        aria-label="Parallel resistor circuit with DC voltage source"
      >
        <defs>
          <marker
            id={arrowId}
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
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
          {/* Source connections and network rails */}
          <path
            d={`M60 ${topY} H${leftRail}
              M60 ${bottomY} H${leftRail}
              M${leftRail} ${topY} V${bottomY}
              M${rightRail} ${topY} V${bottomY}`}
          />

          {/* Source branch */}
          <path
            d={`M60 ${topY} V${centerY - 12}
              M60 ${centerY + 12} V${bottomY}`}
          />

          {/* Parallel branches */}
          {validResistors.map((resistor, index) => {
            const y =
              topY + ((index + 1) * (bottomY - topY)) / (count + 1);

            return (
              <g key={resistor.id ?? resistor.name ?? index}>
                <path
                  d={`M${leftRail} ${y} H${resistorStart}
                    l10 -10 l12 20 l12 -20 l12 20 l12 -20 l12 10
                    H${rightRail}`}
                />

                {/* Branch current arrow */}
                <path
                  d={`M315 ${y} H355`}
                  stroke="#55d9a5"
                  strokeWidth="2"
                  markerEnd={`url(#${arrowId})`}
                />

                <circle
                  cx={leftRail}
                  cy={y}
                  r="3.5"
                  fill="#e9b96d"
                  stroke="none"
                />

                <circle
                  cx={rightRail}
                  cy={y}
                  r="3.5"
                  fill="#e9b96d"
                  stroke="none"
                />
              </g>
            );
          })}
        </g>

        {/* Battery symbol */}
        <g
          fill="none"
          stroke="#e9b96d"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d={`M43 ${centerY - 12} H77`} />
          <path d={`M50 ${centerY + 12} H70`} />
        </g>

        <g fill="#e9b96d" fontSize="13" fontWeight="bold">
          <text x="82" y={centerY - 8}>+</text>
          <text x="82" y={centerY + 18}>−</text>
        </g>

        <g fill="#91a4bd" fontSize="12">
          <text x="60" y="35" textAnchor="middle">
            DC Source
          </text>
          <text x="60" y="51" fill="#82c2ff" textAnchor="middle">
            {voltage || 0} V
          </text>
        </g>

        <g fill="#b8d8fa" fontSize="13" textAnchor="middle">
          {validResistors.map((resistor, index) => {
            const y =
              topY + ((index + 1) * (bottomY - topY)) / (count + 1);

            return (
              <text
                key={resistor.id ?? resistor.name ?? index}
                x="250"
                y={y - 16}
              >
                {resistor.name || `R${index + 1}`}
              </text>
            );
          })}
        </g>

        <text
          x="350"
          y={height - 20}
          fill="#55d9a5"
          fontSize="11"
          textAnchor="middle"
        >
          Branch current →
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
