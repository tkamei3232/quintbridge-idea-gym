import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Lightbulb,
  PlusCircle,
  FileDown,
  BarChart3,
  Archive,
  MessageSquare,
  Users,
  ChevronDown
} from 'lucide-react';
import { exportToCsv, exportToJson, exportToTxt } from '../utils/exportData';

export const Header: React.FC = () => {
  const {
    currentMember,
    setIsMemberSelectorOpen,
    setIsNoticeModalOpen,
    currentTab,
    setCurrentTab,
    setActiveThreadId,
    setIsMiningModalOpen,
    threads,
    members
  } = useApp();

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const bankCount = threads.filter(t => t.completedAt).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* ロゴ & タイトル */}
        <div
          onClick={() => {
            setActiveThreadId(null);
            setCurrentTab('notices');
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center font-black shadow-md shadow-amber-400/20 group-hover:scale-105 transition-transform">
            <Lightbulb className="w-6 h-6 fill-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-slate-800">
                IDEA<span className="text-amber-500">GYM</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                QuintBridge
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight hidden sm:block">
              地域の困りごとが、ひらめきに変わる。
            </p>
          </div>
        </div>

        {/* ナビゲーションタブ */}
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => {
              setActiveThreadId(null);
              setCurrentTab('notices');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentTab === 'notices'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>気づきテーマ</span>
            <span className="ml-0.5 px-1.5 py-0.2 bg-slate-200/80 rounded-full text-[10px] text-slate-600">
              {threads.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveThreadId(null);
              setCurrentTab('bank');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentTab === 'bank'
                ? 'bg-white text-amber-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>アイデアバンク</span>
            {bankCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">
                {bankCount}
              </span>
            )}
          </button>
        </nav>

        {/* 右側アクションエリア */}
        <div className="flex items-center gap-2">
          {/* テキストマイニングボタン */}
          <button
            onClick={() => setIsMiningModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 text-slate-600 text-xs font-semibold shadow-sm transition-all"
            title="投稿テキストをマイニング・キーワード分析"
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden md:inline">テキストマイニング</span>
          </button>

          {/* データ出力メニュー */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-slate-600 text-xs font-semibold shadow-sm transition-all"
              title="全ての投稿テキストをダウンロード"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">データ出力</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isExportMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setIsExportMenuOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">
                  形式を選んでダウンロード
                </div>
                <button
                  onClick={() => exportToTxt(threads, members)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>テキスト形式 (.txt)</span>
                  <span className="text-[10px] text-slate-400">全文記録</span>
                </button>
                <button
                  onClick={() => exportToCsv(threads, members)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>CSV形式 (.csv)</span>
                  <span className="text-[10px] text-slate-400">Excel対応</span>
                </button>
                <button
                  onClick={() => exportToJson(threads)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>JSON形式 (.json)</span>
                  <span className="text-[10px] text-slate-400">構造データ</span>
                </button>
              </div>
            )}
          </div>

          {/* 新規気づき投稿ボタン */}
          <button
            onClick={() => setIsNoticeModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>気づきを投稿</span>
          </button>

          {/* メンバー切り替えボタン */}
          {currentMember && (
            <button
              onClick={() => setIsMemberSelectorOpen(true)}
              className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200/80 transition-colors border border-slate-200"
              title="ユーザーを切り替える"
            >
              <img
                src={currentMember.avatar}
                alt={currentMember.name}
                className="w-6 h-6 rounded-lg object-cover"
              />
              <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                {currentMember.name}
              </span>
              <Users className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
