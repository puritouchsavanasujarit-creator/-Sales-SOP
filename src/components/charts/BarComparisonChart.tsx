import React from 'react';
import { SalesRepStats } from '../../types/salesProcess';
import { Award, CheckCircle2, TrendingUp } from 'lucide-react';

interface BarComparisonChartProps {
  stats: SalesRepStats[];
  selectedRep: string;
  onSelectRep: (repName: string) => void;
  targetBenchmark?: number; // default 80
}

export const BarComparisonChart: React.FC<BarComparisonChartProps> = ({
  stats,
  selectedRep,
  onSelectRep,
  targetBenchmark = 80
}) => {
  // Sort by average score descending
  const sorted = [...stats].sort((a, b) => b.averageScore - a.averageScore);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
        <span>รายชื่อพนักงานขาย / แอดมิน (เรียงตามคะแนนเฉลี่ย)</span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-0.5 bg-amber-500"></span>
          <span>เกณฑ์ผ่าน SOP ({targetBenchmark} คะแนน)</span>
        </span>
      </div>

      <div className="space-y-3.5">
        {sorted.map((rep, index) => {
          const isSelected = selectedRep === rep.name;
          const score = rep.averageScore;
          const pass = score >= targetBenchmark;

          // Color calculation
          let barBg = 'bg-sky-500';
          let textColor = 'text-sky-700';
          if (score >= 90) {
            barBg = 'bg-emerald-500';
            textColor = 'text-emerald-700';
          } else if (score >= 80) {
            barBg = 'bg-sky-500';
            textColor = 'text-sky-700';
          } else if (score >= 70) {
            barBg = 'bg-amber-500';
            textColor = 'text-amber-700';
          } else {
            barBg = 'bg-rose-500';
            textColor = 'text-rose-700';
          }

          return (
            <div
              key={rep.name}
              onClick={() => onSelectRep(isSelected ? 'ALL' : rep.name)}
              className={`group p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/50 shadow-xs ring-1 ring-sky-500/30'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[11px] font-mono font-bold text-slate-600">
                    #{index + 1}
                  </span>
                  <div>
                    <span className="text-sm font-semibold text-slate-900 group-hover:text-sky-900 transition-colors">
                      {rep.name}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      ({rep.evaluationCount} เคสประเมิน)
                    </span>
                  </div>
                  {index === 0 && (
                    <span className="text-[11px] text-amber-700 font-medium flex items-center gap-0.5 ml-1">
                      <Award className="w-3.5 h-3.5" />
                      Top Performer
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`text-base font-bold font-mono tabular-nums ${textColor}`}>
                      {score.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono"> / 100</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md font-semibold font-mono ${
                      score >= 90
                        ? 'bg-emerald-100 text-emerald-800'
                        : score >= 80
                        ? 'bg-sky-100 text-sky-800'
                        : score >= 70
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    เกรด {score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D'}
                  </span>
                </div>
              </div>

              {/* Progress bar container */}
              <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                {/* Benchmark guideline marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10"
                  style={{ left: `${targetBenchmark}%` }}
                  title={`เกณฑ์มาตรฐาน ${targetBenchmark} คะแนน`}
                />
                {/* Active progress fill */}
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barBg}`}
                  style={{ width: `${Math.min(score, 100)}%` }}
                />
              </div>

              {/* Sub-metrics strip */}
              <div className="flex items-center justify-between mt-2 pt-1.5 text-[11px] text-slate-500 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-slate-400" />
                  อัตราผ่านเกณฑ์: <strong className="text-slate-700 font-mono">{rep.passRate.toFixed(0)}%</strong>
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-slate-400" />
                  เกรด A: <strong className="text-slate-700 font-mono">{rep.gradeCounts.A}</strong> เคส
                  · เกรด B: <strong className="text-slate-700 font-mono">{rep.gradeCounts.B}</strong> เคส
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
