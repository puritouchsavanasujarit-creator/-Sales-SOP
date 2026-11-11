import React, { useState } from 'react';
import { CaseEvaluation } from '../../types/salesProcess';

interface TrendLineChartProps {
  evaluations: CaseEvaluation[];
  benchmarkScore?: number; // default 80
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  evaluations,
  benchmarkScore = 80
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Sort chronological
  const sorted = [...evaluations].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        ยังไม่มีข้อมูลการประเมิน
      </div>
    );
  }

  // Dimensions
  const width = 640;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const minScore = 50;
  const maxScore = 100;

  const getX = (index: number) => {
    if (sorted.length === 1) return padding.left + graphWidth / 2;
    return padding.left + (index / (sorted.length - 1)) * graphWidth;
  };

  const getY = (score: number) => {
    const clamped = Math.max(minScore, Math.min(score, maxScore));
    return padding.top + graphHeight - ((clamped - minScore) / (maxScore - minScore)) * graphHeight;
  };

  const points = sorted.map((item, i) => ({
    x: getX(i),
    y: getY(item.totalScore),
    item
  }));

  // Build SVG path
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${padding.top + graphHeight} L ${points[0].x} ${padding.top + graphHeight} Z`
    : '';

  const benchmarkY = getY(benchmarkScore);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[500px]"
        >
          <defs>
            <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[60, 70, 80, 90, 100].map(score => {
            const y = getY(score);
            return (
              <g key={score}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                >
                  {score}
                </text>
              </g>
            );
          })}

          {/* Benchmark line */}
          <line
            x1={padding.left}
            y1={benchmarkY}
            x2={width - padding.right}
            y2={benchmarkY}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />
          <text
            x={width - padding.right}
            y={benchmarkY - 6}
            textAnchor="end"
            fill="#d97706"
            fontSize="10"
            fontFamily="var(--font-mono)"
            className="font-medium"
          >
            เกณฑ์ผ่าน ({benchmarkScore} คะแนน)
          </text>

          {/* Area fill */}
          {areaPath && (
            <path d={areaPath} fill="url(#trendGradient)" />
          )}

          {/* Line stroke */}
          <path
            d={linePath}
            fill="none"
            stroke="#0284c7"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points & Interactive circles */}
          {points.map((p, i) => {
            const isHovered = hoveredIndex === i;
            const score = p.item.totalScore;
            let dotColor = '#0284c7';
            if (score >= 90) dotColor = '#10b981';
            else if (score >= 80) dotColor = '#0284c7';
            else if (score >= 70) dotColor = '#f59e0b';
            else dotColor = '#f43f5e';

            return (
              <g
                key={p.item.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Guide vertical line on hover */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={padding.top}
                    x2={p.x}
                    y2={padding.top + graphHeight}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  fill={dotColor}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />
                {/* Date label at bottom */}
                <text
                  x={p.x}
                  y={padding.top + graphHeight + 18}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                  className="select-none"
                >
                  {p.item.date.slice(5)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hover tooltip card */}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div className="mt-2 text-xs bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-2 flex items-center gap-4 text-slate-700 animate-fade-in">
          <div>
            <span className="text-slate-400 font-mono">{points[hoveredIndex].item.caseId}</span>
            <span className="mx-1.5 text-slate-300">·</span>
            <strong className="text-slate-900">{points[hoveredIndex].item.salesRep}</strong>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span>คะแนน:</span>
            <strong className="text-sky-700 font-bold text-sm">
              {points[hoveredIndex].item.totalScore} / 100
            </strong>
            <span className="text-slate-400">({points[hoveredIndex].item.grade})</span>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">
            {points[hoveredIndex].item.date}
          </span>
        </div>
      )}
    </div>
  );
};
