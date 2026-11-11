import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { NewEvaluationForm } from './components/NewEvaluationForm';
import { EvaluationListView } from './components/EvaluationListView';
import { SOPGuideView } from './components/SOPGuideView';
import { ChatAuditorView } from './components/ChatAuditorView';
import { AICoachChatView } from './components/AICoachChatView';
import { CaseDetailModal } from './components/CaseDetailModal';
import { CaseEvaluation } from './types/salesProcess';
import { INITIAL_EVALUATIONS } from './data/mockEvaluations';
import {
  auth,
  googleAuthProvider
} from './lib/firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  subscribeToEvaluations,
  saveEvaluation,
  deleteEvaluation,
  seedDemoEvaluationsIfEmpty
} from './services/evaluationService';
import { CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'sales_sop_evaluations_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [evaluations, setEvaluations] = useState<CaseEvaluation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_EVALUATIONS;
  });

  const [selectedCase, setSelectedCase] = useState<CaseEvaluation | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Sync evaluations with Firestore in real-time
  useEffect(() => {
    // Seed initial demo evaluations to Firestore if empty
    seedDemoEvaluationsIfEmpty(INITIAL_EVALUATIONS);

    const unsubscribe = subscribeToEvaluations(
      (remoteItems) => {
        if (remoteItems.length > 0) {
          setEvaluations(remoteItems);
        }
      },
      (err) => {
        console.warn('Firestore subscription offline or waiting for permission:', err);
      }
    );
    return () => unsubscribe();
  }, []);

  // Local backup
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluations));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [evaluations]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSignIn = async () => {
    try {
      const res = await signInWithPopup(auth, googleAuthProvider);
      showToast(`ยินดีต้อนรับ ${res.user.displayName || res.user.email}!`);
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      showToast(`เข้าสู่ระบบไม่สำเร็จ: ${err?.message || 'โปรดลองอีกครั้ง'}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast('ออกจากระบบเรียบร้อยแล้ว');
    } catch (err: any) {
      console.error('Sign-Out error:', err);
    }
  };

  const handleSaveEvaluation = async (newEval: CaseEvaluation) => {
    // Optimistic UI update
    setEvaluations((prev) => [newEval, ...prev]);

    // Save to Firestore
    try {
      await saveEvaluation(newEval);
    } catch (err) {
      console.warn('Saved locally, Firestore sync pending:', err);
    }

    showToast(`บันทึกผลการประเมินเคส ${newEval.caseId} (${newEval.salesRep} - ${newEval.totalScore} คะแนน) สำเร็จแล้ว!`);
    setActiveTab('dashboard');
  };

  const handleDeleteEvaluation = async (id: string) => {
    // Optimistic UI update
    setEvaluations((prev) => prev.filter((e) => e.id !== id));

    // Delete from Firestore
    try {
      await deleteEvaluation(id);
    } catch (err) {
      console.warn('Deleted locally, Firestore sync pending:', err);
    }

    showToast('ลบผลการประเมินเคสเรียบร้อยแล้ว');
  };

  const handleResetEvaluations = async () => {
    setEvaluations(INITIAL_EVALUATIONS);
    try {
      for (const item of INITIAL_EVALUATIONS) {
        await saveEvaluation(item);
      }
    } catch (err) {
      console.warn('Reset locally, Firestore sync pending:', err);
    }
    showToast('คืนค่าข้อมูลตัวอย่าง (5 เคส) เรียบร้อยแล้ว');
  };

  const handleTransferFromAuditor = (draft: Partial<CaseEvaluation>) => {
    showToast('โอนผลการวิเคราะห์แชทเรียบร้อยแล้ว ตรวจสอบและกดบันทึกได้เลย');
    setActiveTab('new-evaluation');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 3-Zone Standard Top Navigation with Firebase Auth */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewEvaluationClick={() => setActiveTab('new-evaluation')}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800 text-xs animate-bounce-short">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            evaluations={evaluations}
            onNavigateToNewEval={() => setActiveTab('new-evaluation')}
            onNavigateToHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'new-evaluation' && (
          <NewEvaluationForm
            onSaveEvaluation={handleSaveEvaluation}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'history' && (
          <EvaluationListView
            evaluations={evaluations}
            onSelectEvaluation={setSelectedCase}
            onDeleteEvaluation={handleDeleteEvaluation}
            onResetEvaluations={handleResetEvaluations}
            onNavigateToNewEval={() => setActiveTab('new-evaluation')}
          />
        )}

        {activeTab === 'sop-guide' && <SOPGuideView />}

        {activeTab === 'chat-auditor' && (
          <ChatAuditorView onTransferToForm={handleTransferFromAuditor} />
        )}

        {activeTab === 'ai-coach' && <AICoachChatView />}
      </main>

      {/* Case Details Modal */}
      {selectedCase && (
        <CaseDetailModal
          evaluation={selectedCase}
          onClose={() => setSelectedCase(null)}
          onDelete={handleDeleteEvaluation}
        />
      )}

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            ระบบประเมินขั้นตอนการขายตามมาตรฐาน 10 ขั้นตอน (Sales Flow SOP) · ระบบให้คะแนนและสรุปผลกราฟ
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>ฐานข้อมูลคลาวด์: Firebase Firestore</span>
            <span>·</span>
            <span>เกณฑ์ผ่านมาตรฐาน: ≥ 80 คะแนน</span>
            <span>·</span>
            <span>กฎทอง: ทิ้งคำถามต่อท้ายเสมอ</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
