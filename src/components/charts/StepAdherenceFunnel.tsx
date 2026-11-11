import React, { useState } from 'react';
import { SALES_SOP_STEPS } from '../../data/sopData';
import { AlertCircle, HelpCircle, Sparkles } from 'lucide-react';

interface StepAdherenceFunnelProps {
  stepAverages: Record<string, number>; // stepId -> average score (0 to 10)
  totalEvaluations: number;
}

export const StepAdherenceFunnel: React.FC<StepAdherenceFunnelProps> = ({
  stepAverages
}) => {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  // Find lowest and highest performing steps
  const stepStats = SALES_SOP_STEPS.map(step => {
    const avgScore = stepAverages[step.id] ?? 0;
    const rate = Math.round((avgScore / step.maxPoints) * 100);
    return {
      step,
      avgScore,
      rate
    };
  });

  const sortedByRate = [...stepStats].sort((a, b) => a.rate - b.rate);
  const weakestStep = sortedByRate[0];
  const strongestStep = sortedByRate[sortedByRate.length - 1];

  const activeStep = selectedStepId
    ? stepStats.find(s => s.step.id === selectedStepId)
    : weakestStep;

  return (
    <div className="w-full space-y-5">
      {/* Summary highlight cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/60 flex items-start gap-3">
          <div className="p-2 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-900">
              ขั้นตอนที่แข็งแกร่งที่สุด: {strongestStep?.step.stageName}
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              คะแนนเฉลี่ย <strong className="font-mono">{strongestStep?.avgScore.toFixed(1)}/10</strong> (ความสมบูรณ์ {strongestStep?.rate}%)
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200/60 flex items-start gap-3">
          <div className="p-2 rounded-md bg-rose-100 text-rose-800 shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-900">
              จุดคอขวดที่ต้องพัฒนาเร่งด่วน: {weakestStep?.step.stageName}
            </p>
            <p className="text-xs text-rose-700 mt-0.5">
              คะแนนเฉลี่ย <strong className="font-mono">{weakestStep?.avgScore.toFixed(1)}/10</strong> (ความสมบูรณ์ {weakestStep?.rate}%)
            </p>
          </div>
        </div>
      </div>

      {/* Waterfall / Funnel steps */}
      <div className="space-y-2.5">
        {stepStats.map(({ step, avgScore, rate }) => {
          const isSelected = activeStep?.step.id === step.id;

          // Color based on rate
          let barColor = 'bg-sky-500';
          let textColor = 'text-sky-700';
          if (rate >= 90) {
            barColor = 'bg-emerald-500';
            textColor = 'text-emerald-700';
          } else if (rate >= 80) {
            barColor = 'bg-sky-500';
            textColor = 'text-sky-700';
          } else if (rate >= 70) {
            barColor = 'bg-amber-500';
            textColor = 'text-amber-700';
          } else {
            barColor = 'bg-rose-500';
            textColor = 'text-rose-700';
          }

          return (
            <div
              key={step.id}
              onClick={() => setSelectedStepId(step.id)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/40 ring-1 ring-sky-500/20'
                  : 'border-slate-200/70 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center font-mono text-[11px] font-bold text-slate-700 shrink-0">
                    {step.stepNumber}
                  </span>
                  <span className="font-medium text-slate-800 line-clamp-1">
                    {step.title}
                  </span>
                  {step.isGoldenRule && (
                    <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded font-semibold whitespace-nowrap">
                      กฎทอง SOP
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-400 font-mono text-[11px]">
                    {avgScore.toFixed(1)} / 10
                  </span>
                  <span className={`font-mono font-bold text-[12px] tabular-nums ${textColor}`}>
                    {rate}%
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${Math.max(rate, 4)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail drawer for selected step */}
      {activeStep && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
              เกณฑ์การประเมิน: {activeStep.step.title}
            </span>
            <span className="font-mono text-slate-500">
              เฉลี่ย {activeStep.avgScore.toFixed(1)} / 10 ({activeStep.rate}%)
            </span>
          </div>
          <p className="text-slate-600">
            {activeStep.step.description}
          </p>
          {activeStep.step.criticalNote && (
            <p className="text-rose-700 font-medium bg-rose-50 p-2 rounded border border-rose-100">
              📌 {activeStep.step.criticalNote}
            </p>
          )}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
            <p className="text-[11px] font-semibold text-slate-500 mb-1">ตัวอย่างสคริปต์มาตรฐานตาม SOP:</p>
            <p className="text-slate-800 italic">"{activeStep.step.sampleScript}"</p>
          </div>
        </div>
      )}
    </div>
  );
};
