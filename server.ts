import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Multi-turn Gemini Chatbot with optional Google Search Grounding
 */
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, useSearch } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Convert messages to Gemini format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      parts: [{ text: m.content }],
    }));

    const config: any = {
      systemInstruction:
        'คุณคือ Sales Coach AI & SOP Auditor ผู้เชี่ยวชาญด้านขั้นตอนการขาย 10 ขั้นตอน (Sales Flow SOP) ' +
        'และเทคนิคการปิดการขายสำหรับธุรกิจผลไม้พรีเมียมและสินค้าพรีเมียม ' +
        'ให้คำแนะนำเทคนิคการตอบแชทลูกค้า, การใช้ "กฎทอง" (ทิ้งคำถามต่อท้ายประโยคเสมอเพื่อรักษาบทสนทนา), ' +
        'การแนะนำสินค้า (Step 3), การเช็กสต็อกและผลไม้ (Step 4), การ Upsell ขยายยอดขาย (Step 5), ' +
        'การสรุปการส่งและใบเสร็จ (Step 7-8), และการส่งต่องาน OP (Step 10) ' +
        'ตอบด้วยภาษาไทยที่สุภาพ มั่นใจ กระชับ และนำไปปรับใช้ในการตอบแชทจริงได้ทันที',
    };

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config,
    });

    const reply = response.text || 'ขออภัย ไม่สามารถสร้างคำตอบได้ในขณะนี้';
    const searchChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({
      reply,
      searchChunks,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: error?.message || 'เกิดข้อผิดพลาดในการเรียกใช้งาน Gemini API',
    });
  }
});

/**
 * Intelligent Transcript Audit using Gemini
 */
app.post('/api/audit-transcript', async (req: Request, res: Response) => {
  try {
    const { transcript } = req.body;
    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'transcript string is required' });
    }

    const prompt = `คุณคือผู้ตรวจประเมินคุณภาพการขายตาม Sales SOP 10 ขั้นตอน
กรุณาวิเคราะห์บทสนทนาแชทนี้อย่างละเอียด:
"""
${transcript}
"""

เกณฑ์ 10 ขั้นตอน (เต็ม 100 คะแนน):
Step 1: ทักทาย รับเคสเร็ว (10 คะแนน)
Step 2: รับฟัง ถามความต้องการ (10 คะแนน)
Step 3: นำเสนอราคา/โปรโมชันตรงใจ (10 คะแนน)
Step 4: เช็กสต็อกผลไม้ (10 คะแนน)
Step 5: Upsell แนะนำสินค้าเพิ่ม (10 คะแนน)
Step 6 (กฎทอง): ทิ้งคำถามต่อท้ายบทสนทนาเสมอ ห้ามปิดประโยคเฉยๆ (10 คะแนน)
Step 7: ขอรายละเอียดจัดส่ง (10 คะแนน)
Step 8: สรุปยอดและช่องทางชำระเงิน (10 คะแนน)
Step 9: ปิดการขาย/ยืนยันคำสั่งซื้อ (10 คะแนน)
Step 10: ส่งต่องาน OP/ฝ่ายจัดส่ง (10 คะแนน)

กรุณาตอบเป็น JSON รูปแบบนี้เท่านั้น:
{
  "totalScore": 85,
  "grade": "B",
  "stepScores": {
    "step1_lead": 10,
    "step2_engaged": 10,
    "step3_quoted": 10,
    "step4_fruit_check": 10,
    "step5_upsell": 5,
    "step6_question_rule": 10,
    "step7_delivery": 10,
    "step8_payment_summary": 10,
    "step9_closing_won": 10,
    "step10_op_handoff": 0
  },
  "detectedMisses": ["ไม่ได้ส่งต่องาน OP (Step 10)"],
  "notes": "คำแนะนำสำหรับพนักงานขายในเคสนี้...",
  "suggestedCustomerName": "ชื่อลูกค้า (ถ้าพบ)",
  "suggestedProduct": "รายการสินค้า (ถ้าพบ)",
  "suggestedAmount": 1200
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/audit-transcript:', error);
    res.status(500).json({
      error: error?.message || 'เกิดข้อผิดพลาดในการประเมินบทสนทนา',
    });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
