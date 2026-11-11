import React, { useState } from 'react';
import { SALES_SOP_STEPS } from '../../data/sopData';

interface RadarChartProps {
  primaryData: Record<string, number>; // stepId -> score (0 to 10)
  primaryLabel: string;
  secondaryData?: Record<string, number>; // optional comparison data (e.g. team average)
  secondaryLabel?: string;
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  primaryData,
  primaryLabel,
  secondaryData,
  secondaryLabel = 'ค่าเฉลี่ยทั้งทีม',
  size = 460
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const radius = (size - 130) / 2;
  const center = size / 2;
  const totalAxes = SALES_SOP_STEPS.length;
  const angleStep = (Math.PI * 2) / totalAxes;

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (index: number, valueRatio: number) => {
    // Start from top (- PI/2)
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * valueRatio;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Build path string for primary data
  const primaryPoints = SALES_SOP_STEPS.map((step, i) => {
    const rawScore = primaryData[step.id] ?? 0;
    const ratio = Math.min(Math.max(rawScore / step.maxPoints, 0.05), 1);
    return getCoordinates(i, ratio);
  });

  const primaryPath = primaryPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // Build path string for secondary data (if exists)
  const secondaryPoints = secondaryData
    ? SALES_SOP_STEPS.map((step, i) => {
        const rawScore = secondaryData[step.id] ?? 0;
        const ratio = Math.min(Math.max(rawScore / step.maxPoints, 0.05), 1);
        return getCoordinates(i, ratio);
      })
    : [];

  const secondaryPath = secondaryPoints.length > 0
    ? secondaryPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
    : '';

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible max-w-[500px] w-full"
      >
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.03" />
          </radialGradient>
        </defs>

        {/* Concentric grid polygons */}
        {levels.map((level, lvlIdx) => {
          const polyPoints = SALES_SOP_STEPS.map((_, i) => {
            const p = getCoordinates(i, level);
            return `${p.x},${p.y}`;
          }).join(' ');

          return (
            <g key={lvlIdx}>
              <polygon
                points={polyPoints}
                fill="none"
                stroke={lvlIdx === levels.length - 1 ? '#cbd5e1' : '#e2e8f0'}
                strokeWidth={lvlIdx === levels.length - 1 ? 1.5 : 1}
                strokeDasharray={lvlIdx < levels.length - 1 ? '3,3' : undefined}
              />
              {/* Level label */}
              <text
                x={center + 6}
                y={center - radius * level + 4}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="var(--font-mono)"
                className="select-none font-medium"
              >
                {Math.round(level * 100)}%
              </text>
            </g>
          );
        })}

        {/* Axis spokes from center */}
        {SALES_SOP_STEPS.map((step, i) => {
          const p = getCoordinates(i, 1);
          const isHovered = hoveredIndex === i;

          return (
            <line
              key={step.id}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke={isHovered ? '#0284c7' : '#e2e8f0'}
              strokeWidth={isHovered ? 1.5 : 1}
            />
          );
        })}

        {/* Secondary polygon (e.g. Team Average) */}
        {secondaryPath && (
          <g>
            <polygon
              points={secondaryPoints.map(p => `${p.x},${p.y}`).join(' ')}
              fill="#94a3b8"
              fillOpacity="0.12"
              stroke="#64748b"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
            {secondaryPoints.map((p, i) => (
              <circle
                key={`sec-pt-${i}`}
                cx={p.x}
                cy={p.y}
                r="3"
                fill="#64748b"
              />
            ))}
          </g>
        )}

        {/* Primary polygon (e.g. Target or Rep) */}
        <polygon
          points={primaryPoints.map(p => `${p.x},${p.y}`).join(' ')}
          fill="url(#radarGlow)"
          stroke="#0284c7"
          strokeWidth="2.5"
          className="transition-all duration-300"
        />

        {/* Primary data points and interactive handles */}
        {primaryPoints.map((p, i) => {
          const isHovered = hoveredIndex === i;
          return (
            <circle
              key={`pri-pt-${i}`}
              cx={p.x}
              cy={p.y}
              r={isHovered ? 6 : 4}
              fill="#0284c7"
              stroke="#ffffff"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        })}

        {/* Step labels outside the chart */}
        {SALES_SOP_STEPS.map((step, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelDist = radius + 32;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);
          const isHovered = hoveredIndex === i;

          let textAnchor: 'middle' | 'start' | 'end' = 'middle';
          if (Math.cos(angle) > 0.3) textAnchor = 'start';
          if (Math.cos(angle) < -0.3) textAnchor = 'end';

          const primaryVal = primaryData[step.id] ?? 0;
          const pct = Math.round((primaryVal / step.maxPoints) * 100);

          return (
            <g
              key={`label-${step.id}`}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <text
                x={lx}
                y={ly - 6}
                textAnchor={textAnchor}
                className={`text-[11px] font-medium transition-colors ${
                  isHovered ? 'fill-sky-700 font-semibold' : 'fill-slate-700'
                }`}
              >
                {step.stepNumber}. {step.stageName}
              </text>
              <text
                x={lx}
                y={ly + 8}
                textAnchor={textAnchor}
                className="text-[10px] font-mono tabular-nums fill-slate-500 font-medium"
              >
                {primaryVal.toFixed(1)}/10 ({pct}%)
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip banner */}
      {hoveredIndex !== null && (
        <div className="mt-2 text-xs text-slate-700 bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-2 text-center animate-fade-in max-w-sm">
          <p className="font-semibold text-sky-900">
            {SALES_SOP_STEPS[hoveredIndex].stepNumber}. {SALES_SOP_STEPS[hoveredIndex].title}
          </p>
          <div className="flex items-center justify-center gap-3 mt-1 text-slate-600">
            <span>
              {primaryLabel}: <strong className="text-sky-700 font-mono">{(primaryData[SALES_SOP_STEPS[hoveredIndex].id] ?? 0).toFixed(1)}/10</strong>
            </span>
            {secondaryData && (
              <span>
                · {secondaryLabel}: <strong className="text-slate-700 font-mono">{(secondaryData[SALES_SOP_STEPS[hoveredIndex].id] ?? 0).toFixed(1)}/10</strong>
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic">
            "{SALES_SOP_STEPS[hoveredIndex].sampleScript}"
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1.5 rounded-full bg-sky-600"></span>
          <span>{primaryLabel}</span>
        </div>
        {secondaryData && (
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1.5 rounded-full border-t-2 border-dashed border-slate-500"></span>
            <span>{secondaryLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};
