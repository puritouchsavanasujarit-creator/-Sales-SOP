import React from 'react';
import { BarChart3, PlusCircle, Bot, LogIn, LogOut, Sparkles } from 'lucide-react';
import { User } from 'firebase/auth';

export type ActiveTab = 'dashboard' | 'new-evaluation' | 'history' | 'sop-guide' | 'chat-auditor' | 'ai-coach';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onNewEvaluationClick: () => void;
  user?: User | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onNewEvaluationClick,
  user,
  onSignIn,
  onSignOut
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text wordmark in display face */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs">
              <BarChart3 className="w-4 h-4" />
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('dashboard');
              }}
              className="text-base font-bold tracking-tight text-slate-900 hover:text-sky-700 transition-colors"
            >
              Sales SOP Evaluator
            </a>
          </div>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'dashboard'
                  ? 'border-sky-600 text-sky-700 font-semibold'
                  : 'border-transparent'
              }`}
            >
              ภาพรวม & กราฟ
            </button>
            <button
              onClick={() => onTabChange('new-evaluation')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'new-evaluation'
                  ? 'border-sky-600 text-sky-700 font-semibold'
                  : 'border-transparent'
              }`}
            >
              ทำแบบประเมิน
            </button>
            <button
              onClick={() => onTabChange('history')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'history'
                  ? 'border-sky-600 text-sky-700 font-semibold'
                  : 'border-transparent'
              }`}
            >
              ประวัติเคส
            </button>
            <button
              onClick={() => onTabChange('sop-guide')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'sop-guide'
                  ? 'border-sky-600 text-sky-700 font-semibold'
                  : 'border-transparent'
              }`}
            >
              คู่มือ SOP
            </button>
            <button
              onClick={() => onTabChange('chat-auditor')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'chat-auditor'
                  ? 'border-sky-600 text-sky-700 font-semibold'
                  : 'border-transparent'
              }`}
            >
              วิเคราะห์แชท
            </button>
            <button
              onClick={() => onTabChange('ai-coach')}
              className={`inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'ai-coach'
                  ? 'border-sky-600 text-sky-700 font-semibold'
                  : 'border-transparent'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-sky-600" />
              <span>Sales Coach AI</span>
            </button>
          </nav>

          {/* Zone 3: Actions + Firebase Auth Profile */}
          <div className="flex items-center gap-2.5 shrink-0">
            {user ? (
              <div className="flex items-center gap-2 bg-slate-100/80 pl-2 pr-1.5 py-1 rounded-lg border border-slate-200 text-xs">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-5 h-5 rounded-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-slate-700 font-medium max-w-[100px] truncate hidden sm:inline">
                  {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              onSignIn && (
                <button
                  onClick={onSignIn}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  title="เข้าสู่ระบบด้วย Google"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">เข้าสู่ระบบ</span>
                </button>
              )
            )}

            <button
              onClick={onNewEvaluationClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-lg shadow-2xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>ประเมินเคส</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-4 text-xs font-medium text-slate-600 border-t border-slate-100">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`whitespace-nowrap ${activeTab === 'dashboard' ? 'text-sky-700 font-bold' : ''}`}
          >
            ภาพรวม & กราฟ
          </button>
          <button
            onClick={() => onTabChange('new-evaluation')}
            className={`whitespace-nowrap ${activeTab === 'new-evaluation' ? 'text-sky-700 font-bold' : ''}`}
          >
            ทำแบบประเมิน
          </button>
          <button
            onClick={() => onTabChange('history')}
            className={`whitespace-nowrap ${activeTab === 'history' ? 'text-sky-700 font-bold' : ''}`}
          >
            ประวัติเคส
          </button>
          <button
            onClick={() => onTabChange('sop-guide')}
            className={`whitespace-nowrap ${activeTab === 'sop-guide' ? 'text-sky-700 font-bold' : ''}`}
          >
            คู่มือ SOP
          </button>
          <button
            onClick={() => onTabChange('chat-auditor')}
            className={`whitespace-nowrap ${activeTab === 'chat-auditor' ? 'text-sky-700 font-bold' : ''}`}
          >
            วิเคราะห์แชท
          </button>
          <button
            onClick={() => onTabChange('ai-coach')}
            className={`whitespace-nowrap ${activeTab === 'ai-coach' ? 'text-sky-700 font-bold' : ''}`}
          >
            Sales Coach AI
          </button>
        </div>
      </div>
    </header>
  );
};

