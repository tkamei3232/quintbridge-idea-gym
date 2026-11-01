import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { NoticeThread, ChatMessage } from '../types';
import { LikeButton } from './LikeButton';
import { AI_FRAMEWORK_OPTIONS } from '../utils/aiAdvisor';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Archive,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  X,
  Zap
} from 'lucide-react';

interface BrushUpChatProps {
  thread: NoticeThread;
}

export const BrushUpChat: React.FC<BrushUpChatProps> = ({ thread }) => {
  const { currentMember, members, sendChatMessage, toggleChatLike, saveToIdeaBank } = useApp();

  const [inputText, setInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  // アイデア保存用フォーム状態
  const [ideaTitle, setIdeaTitle] = useState(thread.finalIdea?.title || `${thread.title}の解決アイデア`);
  const [ideaSummary, setIdeaSummary] = useState(
    thread.finalIdea?.summary ||
      (thread.comments[0]?.content
        ? `${thread.comments[0].content} をベースにした新しいサービス・仕組み。`
        : '')
  );
  const [targetUser, setTargetUser] = useState(
    thread.finalIdea?.targetUser || '地域住民・通勤者・関連する当事者'
  );
  const [keyFeature, setKeyFeature] = useState(
    thread.finalIdea?.keyFeature || 'AIによる自動最適化、コミュニティ参加型機能'
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.chatMessages.length, isAiLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');
    await sendChatMessage(thread.id, text, 'member');
  };

  const handleTriggerAi = async (frameworkId: string) => {
    setIsAiLoading(true);
    try {
      await sendChatMessage(thread.id, '', 'ai', frameworkId);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveToBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle.trim() || !ideaSummary.trim()) {
      alert('アイデアのタイトルと概要を入力してください');
      return;
    }

    saveToIdeaBank(thread.id, {
      title: ideaTitle.trim(),
      summary: ideaSummary.trim(),
      targetUser: targetUser.trim(),
      keyFeature: keyFeature.trim(),
      savedAt: new Date().toLocaleString('ja-JP')
    });

    // 祝賀コンフェッティ発射！
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setIsBankModalOpen(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-indigo-200 shadow-md p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
            3
          </div>
          <div>
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
              <span>ステップ3: アイデアブラッシュアップ</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                チャット ＆ AI壁打ち
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              仲間とディスカッションしながら、AIからのフィードバックを受けて具体化しましょう
            </p>
          </div>
        </div>

        {/* アイデアバンク保存ボタン */}
        <button
          onClick={() => setIsBankModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
        >
          <Archive className="w-3.5 h-3.5" />
          <span>{thread.completedAt ? 'アイデアバンク保存内容を更新' : 'アイデアバンクにストックする！'}</span>
        </button>
      </div>

      {/* AI切り口ワンタップ呼び出しバー */}
      <div className="bg-indigo-50/70 p-3 rounded-2xl border border-indigo-100">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 mb-2">
          <Bot className="w-4 h-4 text-indigo-600" />
          <span>AIに壁打ち・多角的なフィードバックを求める:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {AI_FRAMEWORK_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleTriggerAi(opt.id)}
              disabled={isAiLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* チャットメッセージ表示エリア */}
      <div className="space-y-4 max-h-[460px] overflow-y-auto p-4 bg-slate-50/50 rounded-2xl border border-slate-200/80">
        {thread.chatMessages.map(msg => {
          const isAi = msg.senderType === 'ai';
          const member = members.find(m => m.id === msg.senderId);

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAi ? 'bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100' : ''}`}
            >
              {/* アバター */}
              <div className="shrink-0">
                {isAi ? (
                  <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                    <Bot className="w-5 h-5" />
                  </div>
                ) : (
                  <img
                    src={member?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                    alt={member?.name || 'Member'}
                    className="w-9 h-9 rounded-2xl object-cover ring-2 ring-white shadow-sm"
                  />
                )}
              </div>

              {/* メッセージ本文 */}
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800">
                      {isAi ? 'IDEA GYM AIアシスタント' : member?.name}
                    </span>
                    {isAi && (
                      <span className="px-1.5 py-0.2 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                        AI Coach
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">{msg.createdAt}</span>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <LikeButton
                    likes={msg.likes}
                    onToggle={() => toggleChatLike(thread.id, msg.id)}
                    size="sm"
                    showConfirmedList={true}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {isAiLoading && (
          <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs text-indigo-600 animate-pulse">
            <Bot className="w-5 h-5 animate-spin" />
            <span>AIが多角的な視点・アイデアフィードバックを思考中...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* チャット入力バー */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={`${currentMember?.name || 'メンバー'}としてディスカッションに参加...`}
          className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
          <span>送信</span>
        </button>
      </form>

      {/* アイデアバンク保存モーダル */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    アイデアバンクにストックする
                  </h3>
                  <p className="text-xs text-slate-400">
                    ステップ1〜3を通じて完成したアイデアを記録・保存します
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveToBank} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  アイデア名（サービス・プロジェクト名） <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ideaTitle}
                  onChange={e => setIdeaTitle(e.target.value)}
                  placeholder="例: 夜の商店街スキル交換カフェ"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  アイデア概要 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={ideaSummary}
                  onChange={e => setIdeaSummary(e.target.value)}
                  placeholder="どんな課題をどのように解決するアイデアか要約してください"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ターゲットユーザー
                </label>
                <input
                  type="text"
                  value={targetUser}
                  onChange={e => setTargetUser(e.target.value)}
                  placeholder="例: 駅周辺の住民・学生・空き店舗オーナー"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  コア機能・差別化ポイント
                </label>
                <input
                  type="text"
                  value={keyFeature}
                  onChange={e => setKeyFeature(e.target.value)}
                  placeholder="例: スマホQRによる夜間スマートロック開閉、地域通貨還元"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Archive className="w-4 h-4" />
                  <span>アイデアバンクに保存する</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
