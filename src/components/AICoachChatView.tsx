import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Search,
  Bot,
  User,
  RotateCcw,
  ExternalLink,
  MessageSquare,
  HelpCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  searchChunks?: Array<{
    web?: {
      uri: string;
      title: string;
    };
  }>;
}

const PRESET_PROMPTS = [
  'ลูกค้าทักว่า "ราคาสูงไป" แอดมินควรตอบอย่างไรให้ไม่เสียลูกค้า และปิดการขายได้?',
  'ขอตัวอย่างประโยค "กฎทอง" (Step 6) สำหรับทิ้งคำถามต่อท้ายเวลาลูกค้าเริ่มเงียบ',
  'มีเทคนิคการ Upsell (Step 5) อย่างไรให้ลูกค้าเต็มใจเพิ่มสินค้า เช่น ผลไม้นำเข้าคู่กับเซต?',
  'ลูกค้าต้องการกระเช้าผลไม้ด่วนสำหรับผู้ใหญ่ 20 ชุด แอดมินต้องคุยตามลำดับ SOP อย่างไร?'
];

export const AICoachChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'สวัสดีครับ! ผมคือ **Sales Coach AI** ผู้ช่วยและโค้ชด้าน Sales SOP ประจำทีมขายของคุณ\n\n' +
        'คุณสามารถปรึกษาเทคนิคการตอบแชทลูกค้า, ซักซ้อมสถานการณ์รับมือข้อโต้แย้ง (เช่น ราคาสูง, กลัวผลไม้ไม่สด), ' +
        'หรือสอบถามการประยุกต์ใช้ **กฎทอง 10 ขั้นตอน** ได้ตลอดเวลาครับ มีเคสไหนที่อยากให้ช่วยวิเคราะห์ไหมครับ?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          useSearch,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'ขออภัย ไม่ได้รับข้อความตอบกลับจากระบบ',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        searchChunks: data.searchChunks,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `เกิดข้อผิดพลาดในการเชื่อมต่อ AI: ${err?.message || 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          'เริ่มเซสชันสนทนาใหม่แล้วครับ คุณสามารถถามเทคนิคการขายหรือซักซ้อมบทสนทนา SOP 10 ขั้นตอนได้ทันทีครับ',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-5xl mx-auto pb-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-t-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Sales Coach AI (Gemini 3.8 Flash)
              </h2>
              <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-mono font-semibold border border-sky-100">
                SOP Specialist
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              โค้ชฝึกซ้อมการตอบแชท แนะนำวิธีปิดการขาย และเทคนิคการปฏิบัติตามมาตรฐาน SOP 10 ขั้นตอน
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Google Search Grounding toggle */}
          <button
            type="button"
            onClick={() => setUseSearch(!useSearch)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              useSearch
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="เปิดใช้งาน Google Search Grounding เพื่อดึงข้อมูลตลาดและเทรนด์ล่าสุด"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Grounding: {useSearch ? 'เปิด' : 'ปิด'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetChat}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="ล้างการสนทนา"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 bg-slate-50/60 border-x border-slate-200 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-white'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`rounded-2xl p-4 text-xs leading-relaxed shadow-2xs ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

              {/* Search Grounding Citations */}
              {msg.searchChunks && msg.searchChunks.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1">
                  <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                    <Search className="w-3 h-3 text-emerald-600" />
                    แหล่งข้อมูลอ้างอิงจาก Google Search:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.searchChunks.map((chunk, idx) => {
                      if (!chunk.web?.uri) return null;
                      return (
                        <a
                          key={idx}
                          href={chunk.web.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-sky-600 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded border border-sky-100 transition-colors"
                        >
                          <span className="truncate max-w-[200px]">{chunk.web.title || chunk.web.uri}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              <div
                className={`text-[10px] mt-2 font-mono ${
                  msg.role === 'user' ? 'text-sky-200 text-right' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                <span>Sales Coach กำลังวิเคราะห์และพิมพ์คำตอบ...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset Suggestions Strip */}
      <div className="bg-white border-x border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs text-slate-500 border-t border-slate-100">
        <span className="shrink-0 text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-slate-400" /> คำถามยอดนิยม:
        </span>
        {PRESET_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(prompt)}
            className="shrink-0 text-[11px] bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors whitespace-nowrap cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box Footer */}
      <div className="bg-white border border-slate-200 rounded-b-2xl p-3 sm:p-4 shadow-2xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์คำถาม หรือจำลองสถานการณ์ที่ลูกค้าทักเข้ามาในแชท..."
            disabled={loading}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>ส่งคำถาม</span>
          </button>
        </form>
      </div>
    </div>
  );
};
