import React, { useState } from 'react';
import { SALES_SOP_STEPS } from '../data/sopData';
import {
  ArrowDown,
  Check,
  Copy,
  ExternalLink,
  FileText,
  Lightbulb,
  MessageCircle,
  Sparkles
} from 'lucide-react';

export const SOPGuideView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            คู่มือขั้นตอนการขายมาตรฐาน (Sales Process SOP Flow)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ถอดแบบตามเอกสารโครงสร้าง Flow การขาย 10 ขั้นตอน พร้อมสคริปต์มาตรฐานและกฎสำคัญ
          </p>
        </div>

        <a
          href="/assets/aistudio/______________-_Sale_Process_3e4aa2a4.pdf"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>เปิดดูไฟล์ PDF ต้นฉบับ</span>
          <ExternalLink className="w-3 h-3 ml-0.5" />
        </a>
      </div>

      {/* Golden Rule Highlight Callout Banner (From PDF Note) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50/50 to-orange-50 border-2 border-rose-200 shadow-xs relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-rose-600 text-white shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100/80 px-2.5 py-0.5 rounded-full inline-block">
              กฎทองสำคัญที่สุดตามเอกสาร PDF (ไฮไลท์สีแดง)
            </span>
            <p className="text-base font-bold text-rose-950 mt-1">
              "ทุกขั้นตอนของการคุยกับลูกค้าเราจะต้องทิ้งคำถามไว้ให้ลูกค้าเสมอ เพื่อเป็นการรักษาบทสนทนากับลูกค้า"
            </p>
            <p className="text-xs text-rose-800 leading-relaxed">
              เป้าหมาย: ป้องกันไม่ให้แอดมินตอบประโยคบอกเล่าสั้นๆ แล้วจบบทสนทนา แต่ให้ตั้งคำถามทางเลือกเพื่อชวนคุยและกระตุ้นการตัดสินใจต่อไปเรื่อยๆ จนปิดการขาย
            </p>
          </div>
        </div>
      </div>

      {/* Visual Step-by-Step Flowchart Pipeline */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          ผังขั้นตอนการปฏิบัติงาน (10 Sequential Sales Stages)
        </h2>

        <div className="space-y-3">
          {SALES_SOP_STEPS.map((step, index) => {
            const isLast = index === SALES_SOP_STEPS.length - 1;
            const isGolden = step.isGoldenRule;

            return (
              <div key={step.id} className="relative">
                <div
                  className={`p-5 rounded-xl border transition-all ${
                    isGolden
                      ? 'bg-rose-50/30 border-rose-300 ring-1 ring-rose-200'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Step Title & Details */}
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
                          isGolden
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-sky-600 text-white shadow-xs'
                        }`}
                      >
                        {step.stepNumber}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">
                            {step.title}
                          </h3>
                          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {step.stageName}
                          </span>
                          {isGolden && (
                            <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                              ⭐ ไฮไลท์สำคัญใน PDF
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600">
                          {step.description}
                        </p>

                        {step.criticalNote && (
                          <p className="text-xs font-semibold text-rose-700 pt-1">
                            ⚠️ {step.criticalNote}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Points Badge */}
                    <div className="shrink-0 text-right">
                      <span className="font-mono font-bold text-sm text-sky-700">
                        {step.maxPoints} คะแนน
                      </span>
                    </div>
                  </div>

                  {/* Script Quote Box */}
                  <div className="mt-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-start gap-2.5">
                      <MessageCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-500 block text-[11px] mb-0.5">
                          สคริปต์พูดตาม SOP:
                        </span>
                        <span className="text-slate-800 font-medium italic">
                          "{step.sampleScript}"
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyScript(step.id, step.sampleScript)}
                      className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-white rounded-md transition-all shrink-0 cursor-pointer"
                      title="คัดลอกสคริปต์"
                    >
                      {copiedId === step.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Sub-criteria list */}
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {step.criteria.map((c) => (
                      <div key={c.id} className="flex items-start gap-2 text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>
                        <div>
                          <strong className="text-slate-800">{c.label}</strong>
                          <span className="text-slate-400 font-mono ml-1">({c.points} คะแนน)</span>
                          <p className="text-[11px] text-slate-500">{c.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow down connector between steps */}
                {!isLast && (
                  <div className="flex justify-center my-1">
                    <div className="p-1 text-slate-400">
                      <ArrowDown className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
