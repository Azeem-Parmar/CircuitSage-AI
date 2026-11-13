
import { useId } from 'react';

const COLORS = {
  wire: '#60adff',
  resistor: '#e9b96d',
  current: '#55d9a5',
  text: '#b8d8fa',
  muted: '#91a4bd',
  voltage: '#82c2ff',
};

const RESISTOR_WIDTH = 110;
const RESISTOR_HEIGHT = 140;
const SERIES_GAP = 65;
const PARALLEL_GAP = 35;
const GROUP_PADDING = 80;
const GROUP_TITLE_HEIGHT = 30;

function formatValue(value, digits = 3) {
  return Number.isFinite(value) ? value.toFixed(digits) : '—';
}

function getLayout(node) {
  if (node.type === 'resistor') {
    return {
      width: RESISTOR_WIDTH,
      height: RESISTOR_HEIGHT,
    };
  }

  if (
    !Array.isArray(node.children) ||
    node.children.length < 2
  ) {
    throw new Error('Invalid circuit group.');
  }

  const children = node.children.map(getLayout);

  if (node.type === 'series') {
    return {
      width:
        children.reduce((sum, child) => sum + child.width, 0) +
        SERIES_GAP * (children.length - 1) +
        GROUP_PADDING * 2,
      height:
        Math.max(...children.map((child) => child.height)) +
        GROUP_TITLE_HEIGHT,
    };
  }

  if (node.type === 'parallel') {
    return {
      width:
        Math.max(...children.map((child) => child.width)) +
        GROUP_PADDING * 2,
      height:
        GROUP_TITLE_HEIGHT +
        children.reduce((sum, child) => sum + child.height, 0) +
        PARALLEL_GAP * (children.length - 1) +
        GROUP_PADDING,
    };
  }

  throw new Error('Unsupported circuit group.');
}

function ResistorNode({ node, result, x, y }) {
  const centerY = y + RESISTOR_HEIGHT / 2;
  const centerX = x + RESISTOR_WIDTH / 2;

  return (
    <g>
      <path
        d={`M${x} ${centerY} H${x + 12}
            l8 -10 l12 20 l12 -20 l12 20
            l12 -20 l12 20 l8 -10
            H${x + RESISTOR_WIDTH}`}
        fill="none"
        stroke={COLORS.resistor}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <text
        x={centerX}
        y={centerY - 27}
        fill={COLORS.text}
        fontSize="13"
        fontWeight="bold"
        textAnchor="middle"
      >
        {node.name}
      </text>

      <text
        x={centerX}
        y={centerY + 34}
        fill={COLORS.resistor}
        fontSize="11"
        textAnchor="middle"
      >
        {formatValue(node.resistance, 2)} Ω
      </text>

      {result && (
        <>
          <text
            x={centerX}
            y={centerY + 51}
            fill={COLORS.current}
            fontSize="10"
            textAnchor="middle"
          >
            I = {formatValue(result.current, 4)} A
          </text>

          <text
            x={centerX}
            y={centerY + 67}
            fill={COLORS.voltage}
            fontSize="10"
            textAnchor="middle"
          >
            V = {formatValue(result.voltageDrop, 3)} V
          </text>

          <text
            x={centerX}
            y={centerY + 83}
            fill={COLORS.muted}
            fontSize="9"
            textAnchor="middle"
          >
            P = {formatValue(result.power, 3)} W
          </text>
        </>
      )}
    </g>
  );
}

function renderNode(node, x, y, resultMap, markerId) {
  if (node.type === 'resistor') {
    return (
      <ResistorNode
        key={node.id || node.name}
        node={node}
        result={resultMap[node.name]}
        x={x}
        y={y}
      />
    );
  }

  const layout = getLayout(node);
  const centerY = y + layout.height / 2;

  const children = node.children.map((child) => ({
    node: child,
    layout: getLayout(child),
  }));

  const elements = [];

  if (node.type === 'series') {
    let cursorX = x + GROUP_PADDING;

    children.forEach(({ node: child, layout: childLayout }, index) => {
      const childY = centerY - childLayout.height / 2;

      elements.push(
        renderNode(
          child,
          cursorX,
          childY,
          resultMap,
          markerId
        )
      );

      if (index < children.length - 1) {
        const nextX = cursorX + childLayout.width + SERIES_GAP;

        elements.push(
          <path
            key={`series-wire-${node.id}-${index}`}
            d={`M${cursorX + childLayout.width} ${centerY}
                H${nextX}`}
            stroke={COLORS.wire}
            strokeWidth="3"
            fill="none"
            markerEnd={`url(#${markerId})`}
          />
        );
      }

      cursorX += childLayout.width + SERIES_GAP;
    });
  }

  if (node.type === 'parallel') {
    const leftRail = x + 8;
    const rightRail = x + layout.width - 8;

    let cursorY = y + GROUP_TITLE_HEIGHT;

    const branchCenters = [];

    children.forEach(({ node: child, layout: childLayout }, index) => {
      const childX = x + (layout.width - childLayout.width) / 2;
      const childY = cursorY;

      const branchY = childY + childLayout.height / 2;
      branchCenters.push(branchY);

      elements.push(
        <path
          key={`parallel-left-${node.id}-${index}`}
          d={`M${leftRail} ${branchY} H${childX}`}
          stroke={COLORS.wire}
          strokeWidth="3"
          fill="none"
          markerEnd={`url(#${markerId})`}
        />
      );

      elements.push(
        renderNode(
          child,
          childX,
          childY,
          resultMap,
          markerId
        )
      );

      elements.push(
        <path
          key={`parallel-right-${node.id}-${index}`}
          d={`M${childX + childLayout.width} ${branchY}
              H${rightRail}`}
          stroke={COLORS.wire}
          strokeWidth="3"
          fill="none"
        />
      );

      cursorY += childLayout.height + PARALLEL_GAP;
    });

    if (branchCenters.length > 1) {
      elements.push(
        <path
          key={`parallel-left-rail-${node.id}`}
          d={`M${leftRail} ${branchCenters[0]}
              V${branchCenters[branchCenters.length - 1]}`}
          stroke={COLORS.wire}
          strokeWidth="3"
          fill="none"
        />
      );

      elements.push(
        <path
          key={`parallel-right-rail-${node.id}`}
          d={`M${rightRail} ${branchCenters[0]}
              V${branchCenters[branchCenters.length - 1]}`}
          stroke={COLORS.wire}
          strokeWidth="3"
          fill="none"
        />
      );
    }

    elements.push(
      <path
        key={`parallel-input-${node.id}`}
        d={`M${x} ${centerY} H${leftRail}`}
        stroke={COLORS.wire}
        strokeWidth="3"
        fill="none"
      />
    );

    elements.push(
      <path
        key={`parallel-output-${node.id}`}
        d={`M${rightRail} ${centerY} H${x + layout.width}`}
        stroke={COLORS.wire}
        strokeWidth="3"
        fill="none"
      />
    );
  }

  return (
    <g key={node.id}>
      <text
        x={x + layout.width / 2}
        y={y + 17}
        fill={COLORS.muted}
        fontSize="11"
        fontWeight="bold"
        textAnchor="middle"
      >
        {node.type.toUpperCase()} GROUP
      </text>

      {elements}
    </g>
  );
}

function MixedCircuitSchematic({
  network,
  voltage = 12,
  results = null,
}) {
  const markerId = `mixed-arrow-${useId().replace(/:/g, '')}`;

  if (
    !network ||
    !['series', 'parallel'].includes(network.type) ||
    !Array.isArray(network.children) ||
    network.children.length < 2
  ) {
    return (
      <div className="circuit-empty-results">
        Configure at least two network elements to display the schematic.
      </div>
    );
  }

  let layout;

  try {
    layout = getLayout(network);
  } catch {
    return (
      <div className="circuit-empty-results">
        The circuit topology is not valid for visualization.
      </div>
    );
  }

  const hasResults =
    results?.connection === 'mixed' &&
    Array.isArray(results.resistors);

  const resultMap = hasResults
    ? Object.fromEntries(
        results.resistors.map((item) => [item.name, item])
      )
    : {};

  const sourceX = 70;
  const contentX = 175;
  const contentY = 60;

  const centerY = contentY + layout.height / 2;

  const returnX = contentX + layout.width + 75;
  const returnY = contentY + layout.height + 65;

  const svgWidth = returnX + 60;
  const svgHeight = returnY + 85;

  const sourceLeft = sourceX;
  const sourceRight = sourceX + 45;

  return (
    <div className="mixed-schematic-wrapper">
      <svg
        className="mixed-circuit-schematic"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        role="img"
        aria-label="Mixed series parallel circuit with DC source and resistor branches"
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
            <path d="M0 0 L6 3 L0 6 Z" fill={COLORS.current} />
          </marker>
        </defs>

        <g
          fill="none"
          stroke={COLORS.wire}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d={`M${sourceRight} ${centerY}
                H${contentX}`}
          />

          <path
            d={`M${contentX + layout.width} ${centerY}
                H${returnX}
                V${returnY}
                H${sourceLeft}
                V${centerY}`}
          />
        </g>

        <g
          stroke={COLORS.resistor}
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path
            d={`M${sourceX + 12} ${centerY - 12}
                H${sourceX + 33}`}
          />

          <path
            d={`M${sourceX + 17} ${centerY + 12}
                H${sourceX + 28}`}
          />
        </g>

        <g
          fill={COLORS.resistor}
          fontSize="12"
          fontWeight="bold"
        >
          <text x={sourceX + 20} y={centerY - 19}>+</text>
          <text x={sourceX + 20} y={centerY + 30}>−</text>
        </g>

        <text
          x={sourceX + 22}
          y={centerY - 42}
          textAnchor="middle"
          fill={COLORS.text}
          fontSize="12"
        >
          DC Source
        </text>

        <text
          x={sourceX + 22}
          y={centerY - 27}
          textAnchor="middle"
          fill={COLORS.voltage}
          fontSize="11"
        >
          {formatValue(Number(voltage), 2)} V
        </text>

        {/* Main conventional current direction */}
        <path
          d={`M${sourceRight + 12} ${centerY - 5}
              H${contentX - 20}`}
          stroke={COLORS.current}
          strokeWidth="2"
          fill="none"
          markerEnd={`url(#${markerId})`}
        />

        {renderNode(
          network,
          contentX,
          contentY,
          resultMap,
          markerId
        )}

        <text
          x={svgWidth / 2}
          y={svgHeight - 52}
          textAnchor="middle"
          fill={COLORS.current}
          fontSize="12"
        >
          {hasResults
            ? `Total Current: ${formatValue(results.totalCurrent, 4)} A`
            : 'Run analysis to view calculated current'}
        </text>

        <text
          x={svgWidth / 2}
          y={svgHeight - 30}
          textAnchor="middle"
          fill={COLORS.muted}
          fontSize="11"
        >
          MIXED SERIES-PARALLEL NETWORK
        </text>
      </svg>

      <p className="mixed-schematic-caption">
        Green arrows indicate conventional current direction.
        Resistor labels show resistance and calculated electrical values.
      </p>
    </div>
  );
}

export default MixedCircuitSchematic;
