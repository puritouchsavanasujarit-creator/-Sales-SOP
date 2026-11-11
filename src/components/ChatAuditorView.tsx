import React, { useState } from 'react';
import { SALES_SOP_STEPS, calculateGrade } from '../data/sopData';
import { CaseEvaluation } from '../types/salesProcess';
import {
  AlertCircle,
  ArrowRight,
  Bot,
  CheckCircle2,
  FileCheck2,
  Sparkles,
  XCircle
} from 'lucide-react';

interface ChatAuditorViewProps {
  onTransferToForm: (draft: Partial<CaseEvaluation>) => void;
}

const SAMPLE_CHATS = [
  {
    label: 'เคสที่ 1: ทำตาม SOP ครบถ้วน (ดีเยี่ยม 100 คะแนน)',
    salesRep: 'น้องส้ม (Som)',
    customer: 'คุณวิมลทิพย์',
    channel: 'LINE OA',
    text: `ลูกค้า: สนใจกระเช้าผลไม้ค่ะ
แอดมิน: สวัสดีค่ะ แอดมินยินดีดูแลให้นะคะ คุณลูกค้าจะนำไปใช้ในโอกาสพิเศษอะไรเป็นพิเศษ และสนใจช่วงราคาประมาณเท่าไร แอดมินช่วยแนะนำให้ค่ะ?
ลูกค้า: จะเอาไปเยี่ยมคุณแม่เพื่อนที่เกษียณค่ะ ขอแบบสวยๆ ดูสุขภาพดี งบสัก 2,000 - 2,500 ค่ะ
แอดมิน: ได้เลยค่ะ แอดมินคัดเลือกรูปเซตกระเช้า 10 แบบ ราคา 2,200 - 2,400 บาท (อยู่ในช่วงงบ +- ไม่เกิน 200 บาท) ส่งให้ชมตามนี้เลยนะคะ [ส่งรูป 10 รูป] โดยผลไม้ในเซตนี้ทางร้านตรวจเช็คเมล่อนและส้มแมนดารินสดใหม่พร้อมจัดส่งทุกลูกค่ะ คุณลูกค้าชอบเป็นทรงกระเช้าหวายหรือกล่องไม้ดีคะ?
ลูกค้า: ชอบแบบกระเช้าหวายรูปที่ 3 ค่ะ
แอดมิน: ยินดีค่ะ ตอนนี้ทางร้านมีเชอร์รี่แทสมาเนียลูกโตเกรดพรีเมียมนำเข้าหวานกรอบเข้าใหม่พอดีเลยค่ะ สนใจเพิ่มท็อปปิ้งเชอร์รี่เข้าไปในกระเช้าเพื่อความสวยงามยิ่งขึ้นไหมคะ เพิ่มเพียง 290 บาทค่ะ?
ลูกค้า: ดีเลยค่ะ เพิ่มเชอร์รี่ด้วยนะคะ
แอดมิน: ยอดเยี่ยมเลยค่ะ เพื่อให้การจัดส่งราบรื่น แอดมินขอทราบชื่อ-เบอร์โทรผู้รับ พร้อมที่อยู่จัดส่งและวันที่-เวลาที่สะดวกรับของนะคะ?
ลูกค้า: ส่งให้คุณแม่ปราณี โทร 081-999-8888 ที่หมู่บ้านแกรนด์วิลล์ บ้านเลขที่ 99/9 พรุ่งนี้ 10:00 น. ค่ะ
แอดมิน: สรุปยอดการชำระเงินนะคะ: กระเช้าหวาย 2,290 บ. + เชอร์รี่ท็อปปิ้ง 290 บ. + ค่าส่งห้องเย็น 150 บ. รวมสุทธิ 2,730 บาทค่ะ สามารถโอนเข้าบัญชี กสิกรไทย 123-4-56789-0 ได้เลยนะคะ
ลูกค้า: [ส่งรูปสลิปโอนเงิน 2,730 บาท]
แอดมิน: แอดมินขออนุญาตทวนออเดอร์นะคะ: กระเช้าหวายผลไม้พรีเมียม+เชอร์รี่ จัดส่งให้คุณแม่ปราณี (081-999-8888) วันพรุ่งนี้ 10:00 น. ยอดชำระ 2,730 บาท แอดมินตรวจสอบสลิปยอดเงินและเวลาถูกต้องเรียบร้อยค่ะ ขอบพระคุณมากนะคะ เดี๋ยวแอดมินส่งต่อออเดอร์ให้ทีม OP จัดเตรียมทันทีค่ะ มีข้อความในการ์ดอวยพรเพิ่มเติมไหมคะ?`
  },
  {
    label: 'เคสที่ 2: ลืม Upsell และลืมทิ้งคำถามช่วงส่งรูป (80 คะแนน)',
    salesRep: 'น้องมุก (Mook)',
    customer: 'คุณเอกชัย',
    channel: 'Facebook Inbox',
    text: `ลูกค้า: ขอทราบราคากระเช้าผลไม้
แอดมิน: สวัสดีค่ะ สอบถามได้เลยค่ะ ลูกค้าต้องการงบประมาณเท่าไหร่คะ และใช้ในโอกาสอะไรคะ?
ลูกค้า: งบ 1,500 ครับ เอาไปไหว้ผู้ใหญ่
แอดมิน: [ส่งรูป 5 รูป] ราคา 1,500 ครับ
ลูกค้า: ...
แอดมิน: ลูกค้าชอบแบบไหนไหมคะ?
ลูกค้า: เอาแบบแรกครับ
แอดมิน: ขอชื่อที่อยู่เบอร์โทรคนรับครับ
ลูกค้า: สมศักดิ์ 089-111-2222 พระราม 9 วันศุกร์นี้
แอดมิน: สรุปยอด 1,600 รวมส่งครับ โอนเงินได้เลยครับ บัญชีไทยพาณิชย์ 001-2-33333-4
ลูกค้า: [ส่งสลิป]
แอดมิน: ได้รับเงินแล้วครับ เดี๋ยวส่งให้ OP ทำครับ`
  }
];

export const ChatAuditorView: React.FC<ChatAuditorViewProps> = ({ onTransferToForm }) => {
  const [chatText, setChatText] = useState<string>(SAMPLE_CHATS[0].text);
  const [salesRep, setSalesRep] = useState<string>(SAMPLE_CHATS[0].salesRep);
  const [channel, setChannel] = useState<string>(SAMPLE_CHATS[0].channel);
  const [customerName, setCustomerName] = useState<string>(SAMPLE_CHATS[0].customer);

  const [auditResult, setAuditResult] = useState<{
    totalScore: number;
    stepScores: Record<string, number>;
    stepDetails: Record<string, { passed: boolean; note: string; points: number }>;
    aiNotes?: string;
    detectedMisses?: string[];
  } | null>(null);
  const [isAILoading, setIsAILoading] = useState<boolean>(false);

  const handleRunAIAudit = async () => {
    if (!chatText.trim() || isAILoading) return;
    setIsAILoading(true);

    try {
      const response = await fetch('/api/audit-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: chatText }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const stepScores = data.stepScores || {};

      // Map step details
      const details: Record<string, { passed: boolean; note: string; points: number }> = {};
      SALES_SOP_STEPS.forEach((step) => {
        const pts = stepScores[step.id] ?? 0;
        details[step.id] = {
          passed: pts >= step.maxPoints * 0.7,
          points: pts,
          note: pts === step.maxPoints ? 'ผ่านเกณฑ์สมบูรณ์' : pts > 0 ? 'ผ่านเกณฑ์บางส่วน' : 'ไม่พบการปฏิบัติตามขั้นตอนนี้'
        };
      });

      if (data.suggestedCustomerName && (!customerName || customerName === 'ลูกค้าทั่วไป')) {
        setCustomerName(data.suggestedCustomerName);
      }

      setAuditResult({
        totalScore: data.totalScore ?? 80,
        stepScores,
        stepDetails: details,
        aiNotes: data.notes,
        detectedMisses: data.detectedMisses
      });
    } catch (err) {
      console.error('AI Audit error, falling back to local heuristic:', err);
      handleRunAudit();
    } finally {
      setIsAILoading(false);
    }
  };

  const handleRunAudit = () => {
    const text = chatText.toLowerCase();

    const scores: Record<string, number> = {};
    const details: Record<string, { passed: boolean; note: string; points: number }> = {};

    // 1. New Lead: Greeting
    const hasGreeting = text.includes('สวัสดี') || text.includes('ยินดี');
    scores['step1_lead'] = hasGreeting ? 10 : 0;
    details['step1_lead'] = {
      passed: hasGreeting,
      points: scores['step1_lead'],
      note: hasGreeting ? 'พบคำทักทาย "สวัสดีค่ะ/ครับ" สุภาพถูกต้อง' : 'ไม่พบคำทักทายต้อนรับที่ชัดเจน'
    };

    // 2. Engaged: Occasion & Budget
    const hasOccasion = text.includes('โอกาส') || text.includes('พิเศษ') || text.includes('นำไป');
    const hasBudget = text.includes('งบ') || text.includes('ราคา') || text.includes('บาท');
    const step2Score = (hasOccasion ? 5 : 0) + (hasBudget ? 5 : 0);
    scores['step2_engaged'] = step2Score;
    details['step2_engaged'] = {
      passed: step2Score === 10,
      points: step2Score,
      note: `ถามโอกาส: ${hasOccasion ? '✓' : '✗'}, ถามงบประมาณ: ${hasBudget ? '✓' : '✗'}`
    };

    // 3. Quoted: 8-12 photos and +-200 price
    const has8to12 = text.includes('รูป') && (text.includes('8') || text.includes('10') || text.includes('12') || text.includes('แบบ'));
    const hasPriceBound = text.includes('ไม่เกิน 200') || text.includes('งบ') || text.includes('+-');
    const step3Score = (has8to12 ? 5 : 0) + (hasPriceBound ? 5 : 0);
    scores['step3_quoted'] = step3Score;
    details['step3_quoted'] = {
      passed: step3Score === 10,
      points: step3Score,
      note: `คัดรูป 8-12 รูป: ${has8to12 ? '✓' : 'ส่งน้อย/ไม่ระบุ'}, คุมราคางบ +-200: ${hasPriceBound ? '✓' : '✗'}`
    };

    // 4. Fruit Check: Freshness / Seasonality
    const hasFruitCheck = text.includes('เช็ค') || text.includes('ฤดู') || text.includes('สต็อก') || text.includes('สดใหม่');
    scores['step4_fruit_check'] = hasFruitCheck ? 10 : 5;
    details['step4_fruit_check'] = {
      passed: hasFruitCheck,
      points: scores['step4_fruit_check'],
      note: hasFruitCheck ? 'มีการตรวจสอบความสดใหม่และผลไม้ตามฤดูกาล' : 'ไม่พบข้อความเช็คผลไม้หมดฤดู'
    };

    // 5. Upsell: Seasonal products
    const hasUpsell = text.includes('เพิ่ม') || text.includes('เชอร์รี่') || text.includes('เมล่อน') || text.includes('พิเศษ') || text.includes('พรีเมียม');
    scores['step5_upsell'] = hasUpsell ? 10 : 0;
    details['step5_upsell'] = {
      passed: hasUpsell,
      points: scores['step5_upsell'],
      note: hasUpsell ? 'มีการนำเสนอสินค้า/ผลไม้ฤดูกาลเพิ่มเติม (Upsell)' : 'ไม่มีการเสนอสินค้าเพิ่มเติม (Upsell)'
    };

    // 6. Golden Rule: Questions at every step
    const questionMarks = (chatText.match(/\?|ไหม|ดีคะ|หรือคะ|เท่าไหร่/g) || []).length;
    const hasGoldenRule = questionMarks >= 3;
    scores['step6_question_rule'] = hasGoldenRule ? 10 : (questionMarks >= 1 ? 5 : 0);
    details['step6_question_rule'] = {
      passed: hasGoldenRule,
      points: scores['step6_question_rule'],
      note: `พบคำถามต่อท้ายบทสนทนา ${questionMarks} จุด (เกณฑ์: ต้องรักษาบทสนทนาเสมอ)`
    };

    // 7. Delivery Info
    const hasDelivery = text.includes('จัดส่ง') || text.includes('ที่อยู่') || text.includes('เบอร์') || text.includes('โทร');
    scores['step7_delivery'] = hasDelivery ? 10 : 5;
    details['step7_delivery'] = {
      passed: hasDelivery,
      points: scores['step7_delivery'],
      note: hasDelivery ? 'ขอข้อมูลชื่อ เบอร์โทร และที่อยู่จัดส่งครบ' : 'ข้อมูลจัดส่งยังไม่ครบถ้วน'
    };

    // 8. Payment Summary
    const hasPayment = text.includes('สรุปยอด') || text.includes('รวม') || text.includes('บัญชี') || text.includes('โอน');
    scores['step8_payment_summary'] = hasPayment ? 10 : 5;
    details['step8_payment_summary'] = {
      passed: hasPayment,
      points: scores['step8_payment_summary'],
      note: hasPayment ? 'สรุปยอดและแจ้งช่องทางการชำระเงินชัดเจน' : 'สรุปยอดไม่ชัดเจน'
    };

    // 9. Closing Won & Slip
    const hasSlip = text.includes('สลิป') || text.includes('ยอด') || text.includes('เรียบร้อย') || text.includes('ขอบพระคุณ');
    scores['step9_closing_won'] = hasSlip ? 10 : 5;
    details['step9_closing_won'] = {
      passed: hasSlip,
      points: scores['step9_closing_won'],
      note: hasSlip ? 'ตรวจสอบสลิปโอนเงินและปิดการขายอย่างเป็นทางการ' : 'ไม่ได้ตรวจสอบสลิปอย่างละเอียด'
    };

    // 10. OP Handoff
    const hasOP = text.includes('op') || text.includes('ส่งต่อ') || text.includes('ทีมจัด') || text.includes('การ์ด');
    scores['step10_op_handoff'] = hasOP ? 10 : 5;
    details['step10_op_handoff'] = {
      passed: hasOP,
      points: scores['step10_op_handoff'],
      note: hasOP ? 'ประสานงานส่งมอบใบงานให้ทีม OP ครบถ้วน' : 'ไม่พบการประสานงานส่งต่อทีม OP'
    };

    const total = Object.values(scores).reduce((a, b) => a + b, 0);

    setAuditResult({
      totalScore: total,
      stepScores: scores,
      stepDetails: details
    });
  };

  const loadSample = (sample: typeof SAMPLE_CHATS[0]) => {
    setChatText(sample.text);
    setSalesRep(sample.salesRep);
    setCustomerName(sample.customer);
    setChannel(sample.channel);
    setAuditResult(null);
  };

  const handleTransfer = () => {
    if (!auditResult) return;
    onTransferToForm({
      salesRep,
      customerName,
      channel: channel as any,
      stepScores: auditResult.stepScores,
      totalScore: auditResult.totalScore,
      transcriptExcerpt: chatText.slice(0, 500)
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          ผู้ช่วยตรวจจับและประเมินแชท (Chat SOP Auditor)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          วางประวัติการคุยระหว่างแอดมินกับลูกค้า ระบบจะตรวจจับ 10 ขั้นตอนและคำนวณคะแนนตามเกณฑ์ SOP ให้ทันที
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Input Panel */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-sky-600" />
              <span>ประวัติบทสนทนา (Chat Transcript)</span>
            </span>

            {/* Sample Selector */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400">ตัวอย่าง:</span>
              <button
                type="button"
                onClick={() => loadSample(SAMPLE_CHATS[0])}
                className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium transition-colors cursor-pointer"
              >
                เคส 1 (100)
              </button>
              <button
                type="button"
                onClick={() => loadSample(SAMPLE_CHATS[1])}
                className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium transition-colors cursor-pointer"
              >
                เคส 2 (80)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                พนักงานขาย (แอดมิน)
              </label>
              <input
                type="text"
                value={salesRep}
                onChange={(e) => setSalesRep(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                ชื่อลูกค้า
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                ช่องทาง
              </label>
              <input
                type="text"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              ข้อความแชท (Admin & Customer Dialogue)
            </label>
            <textarea
              rows={12}
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder="วางประวัติแชทที่นี่..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={handleRunAIAudit}
              disabled={isAILoading || !chatText.trim()}
              className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-2 text-xs cursor-pointer disabled:cursor-not-allowed"
            >
              <Sparkles className={`w-4 h-4 ${isAILoading ? 'animate-spin' : ''}`} />
              <span>{isAILoading ? 'Gemini AI กำลังวิเคราะห์ SOP...' : 'วิเคราะห์ด้วย Gemini AI (แนะนำ)'}</span>
            </button>
            <button
              type="button"
              onClick={handleRunAudit}
              disabled={isAILoading || !chatText.trim()}
              className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors text-xs cursor-pointer whitespace-nowrap"
            >
              ตรวจด่วน
            </button>
          </div>
        </div>

        {/* Right Column: Audit Results */}
        <div className="space-y-4">
          {auditResult ? (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-5 animate-fade-in">
              {/* Score summary header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs text-slate-500">ผลการประเมินอัตโนมัติ</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-bold font-mono text-slate-900">
                      {auditResult.totalScore}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/ 100</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${calculateGrade(auditResult.totalScore).color}`}>
                    {calculateGrade(auditResult.totalScore).label}
                  </span>
                </div>
              </div>

              {/* Step detection list */}
              <div className="space-y-2.5 text-xs">
                {SALES_SOP_STEPS.map((step) => {
                  const detail = auditResult.stepDetails[step.id];
                  const passed = detail?.passed;

                  return (
                    <div
                      key={step.id}
                      className={`p-2.5 rounded-lg border flex items-start justify-between gap-3 ${
                        passed ? 'bg-emerald-50/30 border-emerald-200/70' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">
                            {step.stepNumber}. {step.stageName}
                          </p>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {detail?.note}
                          </p>
                        </div>
                      </div>

                      <span className={`font-mono font-bold shrink-0 ${passed ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {detail?.points || 0}/10
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Transfer button */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={handleTransfer}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>โอนผลคะแนนนี้ไปยังแบบประเมินหลัก</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400 text-xs space-y-2">
              <Bot className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">ยังไม่ได้เริ่มวิเคราะห์แชท</p>
              <p className="text-slate-400 max-w-xs mx-auto">
                เลือกตัวอย่างด้านซ้าย หรือวางข้อความแชทจริง แล้วกดปุ่ม "เริ่มตรวจจับและให้คะแนน SOP อัตโนมัติ"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
