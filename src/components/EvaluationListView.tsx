import React, { useState, useMemo } from 'react';
import { CaseEvaluation } from '../types/salesProcess';
import { calculateGrade } from '../data/sopData';
import {
  AlertTriangle,
  Download,
  Eye,
  Filter,
  PlusCircle,
  RotateCcw,
  Search,
  Trash2
} from 'lucide-react';

interface EvaluationListViewProps {
  evaluations: CaseEvaluation[];
  onSelectEvaluation: (evaluation: CaseEvaluation) => void;
  onDeleteEvaluation: (id: string) => void;
  onResetEvaluations?: () => void;
  onNavigateToNewEval: () => void;
}

export const EvaluationListView: React.FC<EvaluationListViewProps> = ({
  evaluations,
  onSelectEvaluation,
  onDeleteEvaluation,
  onResetEvaluations,
  onNavigateToNewEval
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [repFilter, setRepFilter] = useState<string>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [caseToDelete, setCaseToDelete] = useState<CaseEvaluation | null>(null);

  // Filtered list
  const filtered = useMemo(() => {
    return evaluations.filter(e => {
      if (repFilter !== 'ALL' && e.salesRep !== repFilter) return false;
      if (gradeFilter !== 'ALL' && e.grade !== gradeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCase = e.caseId.toLowerCase().includes(q);
        const matchCustomer = e.customerName.toLowerCase().includes(q);
        const matchRep = e.salesRep.toLowerCase().includes(q);
        const matchProduct = (e.productType || '').toLowerCase().includes(q);
        if (!matchCase && !matchCustomer && !matchRep && !matchProduct) return false;
      }

      return true;
    });
  }, [evaluations, repFilter, gradeFilter, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Case ID',
      'Date',
      'Sales Rep',
      'Channel',
      'Customer',
      'Product',
      'Order Amount',
      'Total Score',
      'Grade',
      'Step 1 (Lead)',
      'Step 2 (Engaged)',
      'Step 3 (Quoted)',
      'Step 4 (Fruit Check)',
      'Step 5 (Upsell)',
      'Step 6 (Golden Rule)',
      'Step 7 (Delivery)',
      'Step 8 (Invoice)',
      'Step 9 (Won)',
      'Step 10 (OP)',
      'Notes'
    ];

    const rows = filtered.map(e => [
      `"${e.caseId}"`,
      `"${e.date}"`,
      `"${e.salesRep}"`,
      `"${e.channel}"`,
      `"${e.customerName}"`,
      `"${e.productType || ''}"`,
      e.orderAmount ?? '',
      e.totalScore,
      `"${e.grade}"`,
      e.stepScores['step1_lead'] ?? 0,
      e.stepScores['step2_engaged'] ?? 0,
      e.stepScores['step3_quoted'] ?? 0,
      e.stepScores['step4_fruit_check'] ?? 0,
      e.stepScores['step5_upsell'] ?? 0,
      e.stepScores['step6_question_rule'] ?? 0,
      e.stepScores['step7_delivery'] ?? 0,
      e.stepScores['step8_payment_summary'] ?? 0,
      e.stepScores['step9_closing_won'] ?? 0,
      e.stepScores['step10_op_handoff'] ?? 0,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sales_sop_evaluations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueReps = Array.from(new Set(evaluations.map(e => e.salesRep)));

  return (
    <div className="space-y-6 pb-20">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ประวัติการประเมินเคสการขาย (Evaluation Records)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ค้นหา ตรวจสอบผลคะแนนย่อย และส่งออกรายงานการประเมินทั้งหมด {evaluations.length} รายการ
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onResetEvaluations && (
            <button
              onClick={onResetEvaluations}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
              title="คืนค่าข้อมูลตัวอย่าง 5 เคสเริ่มต้น"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>คืนค่าข้อมูลตัวอย่าง</span>
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>ดาวน์โหลด CSV ({filtered.length} เคส)</span>
          </button>
          <button
            onClick={onNavigateToNewEval}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ ประเมินเคสใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาด้วยรหัสเคส, ชื่อแอดมิน, ชื่อลูกค้า, หรือประเภทสินค้า..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Rep Filter */}
        <div className="w-full md:w-56">
          <select
            value={repFilter}
            onChange={(e) => setRepFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="ALL">พนักงานขาย: ทั้งหมด</option>
            {uniqueReps.map(rep => (
              <option key={rep} value={rep}>{rep}</option>
            ))}
          </select>
        </div>

        {/* Grade Filter */}
        <div className="w-full md:w-44">
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="ALL">เกรด: ทั้งหมด</option>
            <option value="A">เกรด A (90-100 คะแนน)</option>
            <option value="B">เกรด B (80-89 คะแนน)</option>
            <option value="C">เกรด C (70-79 คะแนน)</option>
            <option value="D">เกรด D (&lt; 70 คะแนน)</option>
          </select>
        </div>
      </div>

      {/* Evaluations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">รหัสเคส / วันที่</th>
                <th className="py-3 px-4">พนักงานขาย</th>
                <th className="py-3 px-4">ช่องทาง</th>
                <th className="py-3 px-4">ลูกค้า & รายการสินค้า</th>
                <th className="py-3 px-4 text-center">คะแนนรวม</th>
                <th className="py-3 px-4 text-center">เกรด</th>
                <th className="py-3 px-4 text-center">กฎทอง</th>
                <th className="py-3 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    {evaluations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <p className="text-slate-700 font-semibold text-sm">ยังไม่มีข้อมูลผลการประเมินเคสในระบบ</p>
                        <p className="text-slate-400 text-xs">รายการประเมินถูกลบออกทั้งหมด สามารถคืนค่าข้อมูลตัวอย่างได้</p>
                        {onResetEvaluations && (
                          <button
                            onClick={onResetEvaluations}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer mt-2"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
                            <span>คืนค่าข้อมูลตัวอย่าง (5 เคส)</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <span>ไม่พบเคสการประเมินที่ตรงตามเงื่อนไขการค้นหา</span>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const gradeInfo = calculateGrade(item.totalScore);
                  const goldenRulePassed = (item.stepScores['step6_question_rule'] ?? 0) >= 10;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectEvaluation(item)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Case ID & Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-sky-700 block">
                          {item.caseId}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {item.date}
                        </span>
                      </td>

                      {/* Rep */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {item.salesRep}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ผู้ตรวจ: {item.evaluatorName.split(' ')[0]}
                        </span>
                      </td>

                      {/* Channel */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {item.channel}
                        </span>
                      </td>

                      {/* Customer & Product */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-medium text-slate-800 block truncate">
                          {item.customerName || 'ลูกค้าทั่วไป'}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {item.productType} {item.orderAmount ? `(${item.orderAmount.toLocaleString()} บ.)` : ''}
                        </span>
                      </td>

                      {/* Total Score */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-sm tabular-nums text-slate-900">
                          {item.totalScore}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono"> / 100</span>
                      </td>

                      {/* Grade */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold font-mono border ${gradeInfo.color}`}>
                          เกรด {item.grade}
                        </span>
                      </td>

                      {/* Golden Rule Step 6 Indicator */}
                      <td className="py-3.5 px-4 text-center">
                        {goldenRulePassed ? (
                          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                            ✓ ผ่าน
                          </span>
                        ) : (
                          <span className="text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-medium">
                            ✗ ลืมถาม
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onSelectEvaluation(item)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors cursor-pointer"
                            title="ดูรายละเอียดเคส"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCaseToDelete(item);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="ลบเคส"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info strip */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>แสดง {filtered.length} จาก {evaluations.length} เคส</span>
          <span>คลิกที่แถวเพื่อเปิดดูรายละเอียดและคะแนนรายข้อ</span>
        </div>
      </div>

      {/* Custom In-App Delete Confirmation Modal */}
      {caseToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          onClick={() => setCaseToDelete(null)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-900">
                    ยืนยันการลบผลการประเมิน
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    คุณแน่ใจหรือไม่ว่าต้องการลบผลการประเมินเคสนี้? ข้อมูลจะถูกลบออกจากระบบทันที
                  </p>

                  <div className="mt-3.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 font-sans">
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="text-slate-400">รหัสเคส:</span>
                      <span className="font-mono font-bold text-sky-700">{caseToDelete.caseId}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="text-slate-400">พนักงานขาย:</span>
                      <span className="font-semibold text-slate-800">{caseToDelete.salesRep}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="text-slate-400">ลูกค้า:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[200px]">{caseToDelete.customerName || 'ลูกค้าทั่วไป'}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="text-slate-400">คะแนนรวม:</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {caseToDelete.totalScore} คะแนน ({caseToDelete.grade})
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="text-slate-400">วันที่ประเมิน:</span>
                      <span className="font-mono text-slate-700">{caseToDelete.date}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-rose-600 mt-2.5 font-medium">
                    * เมื่อลบแล้วจะไม่สามารถเรียกคืนได้ ยกเว้นการกดคืนค่าข้อมูลตัวอย่าง
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCaseToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteEvaluation(caseToDelete.id);
                  setCaseToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                ยืนยันลบเคสนี้
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
