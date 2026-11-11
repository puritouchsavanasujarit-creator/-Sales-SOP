import React, { useState, useMemo } from 'react';
import { CaseEvaluation, SalesRepStats } from '../types/salesProcess';
import { SALES_SOP_STEPS, SALES_REPS_LIST } from '../data/sopData';
import { RadarChart } from './charts/RadarChart';
import { BarComparisonChart } from './charts/BarComparisonChart';
import { StepAdherenceFunnel } from './charts/StepAdherenceFunnel';
import { TrendLineChart } from './charts/TrendLineChart';
import {
  Award,
  CheckCircle2,
  Filter,
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  FileSpreadsheet
} from 'lucide-react';

interface DashboardViewProps {
  evaluations: CaseEvaluation[];
  onNavigateToNewEval: () => void;
  onNavigateToHistory: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  evaluations,
  onNavigateToNewEval,
  onNavigateToHistory
}) => {
  const [selectedRep, setSelectedRep] = useState<string>('ALL');
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days'>('all');
  const [showRadarComparison, setShowRadarComparison] = useState<boolean>(true);

  // Filtered evaluations
  const filteredEvals = useMemo(() => {
    return evaluations.filter(item => {
      if (selectedRep !== 'ALL' && item.salesRep !== selectedRep) return false;
      if (selectedChannel !== 'ALL' && item.channel !== selectedChannel) return false;

      if (dateFilter !== 'all') {
        const itemDate = new Date(item.date).getTime();
        const now = new Date('2026-11-09').getTime(); // anchored to current simulation time
        const daysAgo = (now - itemDate) / (1000 * 60 * 60 * 24);
        if (dateFilter === '7days' && daysAgo > 7) return false;
        if (dateFilter === '30days' && daysAgo > 30) return false;
      }

      return true;
    });
  }, [evaluations, selectedRep, selectedChannel, dateFilter]);

  // Overall KPIs
  const totalCount = filteredEvals.length;
  const avgScore = totalCount > 0
    ? filteredEvals.reduce((sum, e) => sum + e.totalScore, 0) / totalCount
    : 0;

  const passedCount = filteredEvals.filter(e => e.totalScore >= 80).length;
  const passRate = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

  // Golden rule rate (Step 6)
  const goldenRuleAvg = totalCount > 0
    ? filteredEvals.reduce((sum, e) => sum + (e.stepScores['step6_question_rule'] ?? 0), 0) / totalCount
    : 0;
  const goldenRuleRate = (goldenRuleAvg / 10) * 100;

  // Step-by-step averages for filtered data
  const stepAverages = useMemo(() => {
    const acc: Record<string, number> = {};
    SALES_SOP_STEPS.forEach(step => {
      if (totalCount === 0) {
        acc[step.id] = 0;
      } else {
        const sum = filteredEvals.reduce((s, e) => s + (e.stepScores[step.id] ?? 0), 0);
        acc[step.id] = sum / totalCount;
      }
    });
    return acc;
  }, [filteredEvals, totalCount]);

  // Team overall step averages (for baseline comparison)
  const teamStepAverages = useMemo(() => {
    const acc: Record<string, number> = {};
    const totalAll = evaluations.length;
    SALES_SOP_STEPS.forEach(step => {
      if (totalAll === 0) {
        acc[step.id] = 0;
      } else {
        const sum = evaluations.reduce((s, e) => s + (e.stepScores[step.id] ?? 0), 0);
        acc[step.id] = sum / totalAll;
      }
    });
    return acc;
  }, [evaluations]);

  // Per-Rep Stats (all reps in dataset)
  const repStats: SalesRepStats[] = useMemo(() => {
    // Unique reps
    const repNames = Array.from(new Set(evaluations.map(e => e.salesRep)));

    return repNames.map(name => {
      const repEvals = evaluations.filter(e => e.salesRep === name);
      const count = repEvals.length;
      const avg = count > 0 ? repEvals.reduce((s, e) => s + e.totalScore, 0) / count : 0;
      const passed = repEvals.filter(e => e.totalScore >= 80).length;

      const gradeCounts = { A: 0, B: 0, C: 0, D: 0 };
      repEvals.forEach(e => {
        if (gradeCounts[e.grade] !== undefined) gradeCounts[e.grade]++;
      });

      const repStepAvgs: Record<string, number> = {};
      SALES_SOP_STEPS.forEach(s => {
        const sum = repEvals.reduce((acc, e) => acc + (e.stepScores[s.id] ?? 0), 0);
        repStepAvgs[s.id] = count > 0 ? sum / count : 0;
      });

      // Find strongest and weakest
      let maxStep = SALES_SOP_STEPS[0].id;
      let minStep = SALES_SOP_STEPS[0].id;
      let maxVal = -1;
      let minVal = 999;

      SALES_SOP_STEPS.forEach(s => {
        const v = repStepAvgs[s.id];
        if (v > maxVal) {
          maxVal = v;
          maxStep = s.id;
        }
        if (v < minVal) {
          minVal = v;
          minStep = s.id;
        }
      });

      return {
        name,
        evaluationCount: count,
        averageScore: avg,
        passRate: count > 0 ? (passed / count) * 100 : 0,
        gradeCounts,
        stepAverages: repStepAvgs,
        strongestStepId: maxStep,
        weakestStepId: minStep
      };
    });
  }, [evaluations]);

  // Common weaknesses breakdown
  const commonWeaknesses = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredEvals.forEach(e => {
      (e.detectedMisses || []).forEach(miss => {
        counts[miss] = (counts[miss] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [filteredEvals]);

  const resetFilters = () => {
    setSelectedRep('ALL');
    setSelectedChannel('ALL');
    setDateFilter('all');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Title & Intro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ภาพรวมผลการประเมิน & วิเคราะห์กราฟ Sales SOP
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            สรุปข้อมูลคะแนนตามขั้นตอนมาตรฐานการขาย 10 ขั้นตอน วิเคราะห์จุดแข็ง และแนวทางโค้ชชิ่งรายบุคคล
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToHistory}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>ดูประวัติ ({evaluations.length} เคส)</span>
          </button>
          <button
            onClick={onNavigateToNewEval}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
          >
            <span>+ ประเมินเคสใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Segmented controls) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <Filter className="w-3.5 h-3.5 text-sky-600" />
            <span>ตัวกรองการวิเคราะห์:</span>
          </div>

          {(selectedRep !== 'ALL' || selectedChannel !== 'ALL' || dateFilter !== 'all') && (
            <button
              onClick={resetFilters}
              className="text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>รีเซ็ตตัวกรอง</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Sales Rep Selector */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              พนักงานขาย / แอดมิน
            </label>
            <select
              value={selectedRep}
              onChange={(e) => setSelectedRep(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">ทุกคนในทีม ({evaluations.length} เคส)</option>
              {SALES_REPS_LIST.map(rep => (
                <option key={rep.id} value={rep.name}>
                  {rep.name}
                </option>
              ))}
            </select>
          </div>

          {/* Channel Selector */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              ช่องทางการขาย
            </label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">ทุกช่องทาง (LINE / FB / IG)</option>
              <option value="LINE OA">LINE OA</option>
              <option value="Facebook Inbox">Facebook Inbox</option>
              <option value="Instagram DM">Instagram DM</option>
            </select>
          </div>

          {/* Date range filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              ช่วงเวลาประเมิน
            </label>
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
              <button
                onClick={() => setDateFilter('all')}
                className={`flex-1 py-1.5 text-center text-xs font-medium rounded-md transition-all ${
                  dateFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setDateFilter('30days')}
                className={`flex-1 py-1.5 text-center text-xs font-medium rounded-md transition-all ${
                  dateFilter === '30days'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                30 วัน
              </button>
              <button
                onClick={() => setDateFilter('7days')}
                className={`flex-1 py-1.5 text-center text-xs font-medium rounded-md transition-all ${
                  dateFilter === '7days'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7 วัน
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Average Score */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>คะแนนเฉลี่ยรวม</span>
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {avgScore.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="mt-2 text-xs flex items-center gap-1.5 text-slate-500">
            <span className={`inline-block w-2 h-2 rounded-full ${avgScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span>เกณฑ์มาตรฐาน: 80 คะแนนขึ้นไป</span>
          </div>
        </div>

        {/* KPI 2: Pass Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>อัตราผ่านเกณฑ์ (Pass Rate)</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-700 tabular-nums">
              {passRate.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400">
              ({passedCount}/{totalCount} เคส)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <span>เป้าหมายขั้นต่ำของทีม: ≥ 85%</span>
          </div>
        </div>

        {/* KPI 3: Golden Rule Adherence */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>กฎทอง: ทิ้งคำถามต่อท้าย</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {goldenRuleRate.toFixed(0)}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({goldenRuleAvg.toFixed(1)}/10)
            </span>
          </div>
          <div className="mt-2 text-xs text-rose-700">
            <span>ข้อกำหนดไฮไลท์สีแดงใน SOP</span>
          </div>
        </div>

        {/* KPI 4: Total Evaluations */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>จำนวนเคสที่ประเมิน</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <Award className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {totalCount}
            </span>
            <span className="text-xs text-slate-400">เคสสนทนา</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <span>จากทั้งหมด {evaluations.length} เคสในระบบ</span>
          </div>
        </div>
      </div>

      {/* 4 Interactive Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRAPH 1: Radar Chart (Spider Chart) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  1. มิติคะแนนตาม 10 ขั้นตอนการขาย (Radar Chart)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  วิเคราะห์ความสมบูรณ์รอบด้าน 360 องศา เปรียบเทียบตามขั้นตอน SOP
                </p>
              </div>

              {selectedRep !== 'ALL' && (
                <button
                  onClick={() => setShowRadarComparison(!showRadarComparison)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition-colors whitespace-nowrap ${
                    showRadarComparison
                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {showRadarComparison ? '✓ เทียบค่าเฉลี่ยทีม' : '+ เทียบค่าเฉลี่ยทีม'}
                </button>
              )}
            </div>

            <div className="py-2">
              <RadarChart
                primaryData={stepAverages}
                primaryLabel={selectedRep === 'ALL' ? 'คะแนนเฉลี่ยทีม' : selectedRep}
                secondaryData={showRadarComparison && selectedRep !== 'ALL' ? teamStepAverages : undefined}
                secondaryLabel="ค่าเฉลี่ยทั้งทีม"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>เอาเมาส์ชี้จุดบนกราฟเพื่อดูสคริปต์ตัวอย่างและคะแนนเต็ม</span>
            <span className="font-mono text-slate-400">10 แกนประเมิน</span>
          </div>
        </div>

        {/* GRAPH 2: Bar Comparison & Ranking */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  2. อันดับคะแนน & ประสิทธิภาพรายบุคคล (Sales Reps)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  เปรียบเทียบคะแนนเฉลี่ยกับเกณฑ์มาตรฐาน 80 คะแนน (คลิกที่ชื่อเพื่อกรองดูรายคน)
                </p>
              </div>
            </div>

            <BarComparisonChart
              stats={repStats}
              selectedRep={selectedRep}
              onSelectRep={(name) => setSelectedRep(name)}
              targetBenchmark={80}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>คลิกแถบเพื่อเจาะลึกเฉพาะแอดมินคนนั้น</span>
            <span className="font-mono text-slate-400">{repStats.length} พนักงานขาย</span>
          </div>
        </div>

        {/* GRAPH 3: Step Adherence Funnel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  3. อัตราความสมบูรณ์ในแต่ละขั้นตอน (Step Funnel)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ตรวจสอบจุดคอขวดที่พนักงานมักลืมหรือถูกหักคะแนนบ่อยที่สุด
                </p>
              </div>
            </div>

            <StepAdherenceFunnel
              stepAverages={stepAverages}
              totalEvaluations={totalCount}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>คลิกขั้นตอนเพื่ออ่านรายละเอียดเกณฑ์และสคริปต์มาตรฐานตาม Flow ใน PDF</span>
          </div>
        </div>

        {/* GRAPH 4: Trend Line Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  4. แนวโน้มพัฒนาการคะแนนตามช่วงเวลา (Timeline Trend)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ความต่อเนื่องและทิศทางการปฏิบัติตามมาตรฐานการขายในแต่ละสัปดาห์
                </p>
              </div>
            </div>

            <div className="py-2">
              <TrendLineChart
                evaluations={filteredEvals}
                benchmarkScore={80}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>กราฟเรียงตามวันเวลาที่ประเมิน</span>
            <span className="font-mono text-slate-400">{filteredEvals.length} จุดข้อมูล</span>
          </div>
        </div>
      </div>

      {/* Diagnostics & Actionable Coaching Strip */}
      <div className="bg-gradient-to-r from-sky-50 via-slate-50 to-indigo-50/40 p-6 rounded-2xl border border-sky-100 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-600 text-white">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            ข้อสรุปเชิงลึก & คำแนะนำในการโค้ชชิ่ง (SOP Actionable Insights)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Common Mistakes */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 text-rose-700 text-xs font-semibold mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>จุดที่มักถูกหักคะแนนสูงสุด</span>
            </div>
            {commonWeaknesses.length > 0 ? (
              <ul className="space-y-2 text-xs">
                {commonWeaknesses.map((w, idx) => (
                  <li key={idx} className="flex items-center justify-between text-slate-700">
                    <span className="truncate pr-2">· {w.reason}</span>
                    <span className="font-mono text-rose-600 font-bold shrink-0">
                      {w.count} เคส
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">ไม่พบข้อผิดพลาดร้ายแรงในชุดข้อมูลนี้</p>
            )}
          </div>

          {/* Card 2: Upsell Coaching */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-semibold text-slate-900 mb-1">
              คำแนะนำขั้นตอนที่ 5: การ Upsell สินค้าฤดูกาล
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              สถิติชี้ว่าการเสนอ Upsell เป็นขั้นตอนที่มีคะแนนความสมบูรณ์ต่ำที่สุด (เฉลี่ยเพียง {(stepAverages['step5_upsell'] ?? 0).toFixed(1)}/10) แนะนำให้ทีมทำคลังรูปและคำเสนอผลไม้พรีเมียมประจำสัปดาห์ (เช่น เชอร์รี่นำเข้า เมล่อนญี่ปุ่น) ให้แอดมินคลิกส่งได้ทันที
            </p>
          </div>

          {/* Card 3: Golden Rule Coaching */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-semibold text-slate-900 mb-1">
              คำแนะนำกฎทอง: รักษาบทสนทนาเสมอ
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              ตามที่เน้นย้ำในเอกสาร PDF: "ทุกขั้นตอนของการคุยกับลูกค้าเราจะต้องทิ้งคำถามไว้ให้ลูกค้าเสมอ" ควรจัดเทรนนิ่งฝึกตั้งคำถามทางเลือก เช่น โทนสีโบว์ ช่วงเวลาจัดส่ง หรือความชอบของผู้รับ เพื่อป้องกันบทสนทนาขาดตอน
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
