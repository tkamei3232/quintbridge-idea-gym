import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { NoticeList } from './components/NoticeList';
import { ThreadDetail } from './components/ThreadDetail';
import { IdeaBank } from './components/IdeaBank';
import { MemberSelector } from './components/MemberSelector';
import { NoticeModal } from './components/NoticeModal';
import { TextMiningModal } from './components/TextMiningModal';
import { RotateCcw, Heart, Sparkles } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeThreadId, currentTab, resetToInitialData } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeThreadId ? (
          <ThreadDetail />
        ) : currentTab === 'bank' ? (
          <IdeaBank />
        ) : (
          <NoticeList />
        )}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-slate-700">IDEA GYM</span>
            <span>—</span>
            <span>ハッカソンアイデア #9 / QuintBridge</span>
            <span className="hidden sm:inline">（Ricky, h-a-r-u, tatsu, 千股弘旗）</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={resetToInitialData}
              className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
              title="初期デモデータに戻す"
            >
              <RotateCcw className="w-3 h-3" />
              <span>サンプルデータ初期化</span>
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-[11px]">地域の困りごとが、ひらめきに変わる。</span>
          </div>
        </div>
      </footer>

      {/* モーダル群 */}
      <MemberSelector />
      <NoticeModal />
      <TextMiningModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;
