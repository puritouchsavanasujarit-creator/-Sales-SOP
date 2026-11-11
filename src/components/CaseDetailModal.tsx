import React, { useState } from 'react';
import { CaseEvaluation } from '../types/salesProcess';
import { SALES_SOP_STEPS, calculateGrade } from '../data/sopData';
import {
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Trash2,
  X,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface CaseDetailModalProps {
  evaluation: CaseEvaluation | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  evaluation,
  onClose,
  onDelete
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);

  if (!evaluation) return null;

  const gradeInfo = calculateGrade(evaluation.totalScore);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                {evaluation.caseId}
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-600">{evaluation.channel}</span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs font-mono text-slate-500">{evaluation.date}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              ผลการประเมิน: {evaluation.salesRep}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              title="พิมพ์ / บันทึก PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Summary Score Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs text-slate-500 font-medium">ลูกค้า: {evaluation.customerName || 'ไม่ระบุ'}</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {evaluation.productType || 'เซตผลไม้'}
                {evaluation.orderAmount && ` (${evaluation.orderAmount.toLocaleString()} บาท)`}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                ผู้ประเมิน: {evaluation.evaluatorName}
              </p>
            </div>

            <div className="text-right flex items-center sm:flex-col sm:items-end justify-between gap-2">
              <div>
                <span className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
                  {evaluation.totalScore}
                </span>
                <span className="text-xs font-mono text-slate-400"> / 100</span>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${gradeInfo.color}`}>
                {gradeInfo.label}
              </span>
            </div>
          </div>

          {/* Detected Misses / Deductions Banner */}
          {evaluation.detectedMisses && evaluation.detectedMisses.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/70 space-y-1.5">
              <p className="font-semibold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                จุดที่ถูกหักคะแนนในเคสนี้:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                {evaluation.detectedMisses.map((miss, idx) => (
                  <li key={idx}>{miss}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 10 Step Breakdown Table */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">
              รายละเอียดคะแนนตามขั้นตอน 10 ขั้นตอน
            </h3>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {SALES_SOP_STEPS.map((step) => {
                const score = evaluation.stepScores[step.id] ?? 0;
                const isFull = score === step.maxPoints;

                return (
                  <div key={step.id} className="p-3 bg-white hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-mono font-bold text-[11px]">
                          {step.stepNumber}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {step.title}
                        </span>
                        {step.isGoldenRule && (
                          <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-medium">
                            กฎทอง SOP
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono font-bold tabular-nums ${
                          isFull ? 'text-emerald-700' : score >= 7 ? 'text-sky-700' : 'text-rose-700'
                        }`}>
                          {score} / {step.maxPoints} คะแนน
                        </span>
                      </div>
                    </div>

                    {/* Criteria checklist audit */}
                    <div className="space-y-1 pl-7">
                      {step.criteria.map((c) => {
                        const passed = evaluation.checkedCriteria ? evaluation.checkedCriteria[c.id] : isFull;
                        return (
                          <div key={c.id} className="flex items-center gap-2 text-slate-600 text-[11px]">
                            {passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            )}
                            <span className={passed ? 'text-slate-700' : 'text-rose-700 font-medium'}>
                              {c.label} ({c.points} คะแนน)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Evaluator Notes */}
          {evaluation.notes && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="font-semibold text-slate-800 mb-1">
                ความคิดเห็นและคำแนะนำจากหัวหน้างาน:
              </p>
              <p className="text-slate-700 leading-relaxed">
                {evaluation.notes}
              </p>
            </div>
          )}

          {/* Transcript Excerpt */}
          {evaluation.transcriptExcerpt && (
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] space-y-1 overflow-x-auto">
              <p className="text-slate-400 font-sans font-semibold mb-1">บทสนทนาอ้างอิง:</p>
              <pre className="whitespace-pre-wrap">{evaluation.transcriptExcerpt}</pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          {onDelete && (
            <div>
              {!isConfirmingDelete ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ลบเคสนี้</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-rose-700">ต้องการลบเคสนี้จริงหรือไม่?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(evaluation.id);
                      onClose();
                    }}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    ยืนยันลบ
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
