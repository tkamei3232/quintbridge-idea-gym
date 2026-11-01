import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NoticeThread } from '../types';
import { LikeButton } from './LikeButton';
import {
  MessageSquare,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  HelpCircle
} from 'lucide-react';

export const NoticeList: React.FC = () => {
  const { threads, setActiveThreadId, setIsNoticeModalOpen, members, toggleThreadLike } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStep, setSelectedStep] = useState<string>('all');

  const getAuthor = (authorId: string) => members.find(m => m.id === authorId);

  // フィルタリング
  const filteredThreads = threads.filter(thread => {
    if (selectedCategory !== 'all' && thread.category !== selectedCategory) {
      return false;
    }
    if (selectedStep !== 'all') {
      if (selectedStep === '1' && thread.currentStep !== 1) return false;
      if (selectedStep === '2' && (thread.currentStep !== 2 || thread.isClosedStep2)) return false;
      if (selectedStep === '3' && (!thread.isClosedStep2 || thread.completedAt)) return false;
      if (selectedStep === 'bank' && !thread.completedAt) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ヒーローバナー / ガイド */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-xl shadow-amber-500/10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/10 text-slate-900 text-xs font-bold mb-3 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            IDEA GYM 3つのステップ
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            日頃の小さな違和感が、<br />最高のアイデアの種になる。
          </h1>
          <p className="mt-2 text-sm text-slate-800/90 font-medium leading-relaxed">
            通勤時や職場で見つけたモヤモヤ・困りごとを写真でシェア（①）。仲間からの視点転換コメントで広げ（②）、AIと一緒にブラッシュアップ（③）してアイデアバンクにストックしましょう！
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => setIsNoticeModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2"
            >
              <span>違和感・気づきを投稿する</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 背景装飾 */}
        <div className="absolute right-4 -bottom-6 opacity-15 pointer-events-none text-9xl font-black">
          💡
        </div>
      </div>

      {/* フィルター＆コントロールバー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-bold text-slate-500 shrink-0">絞り込み:</span>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <option value="all">すべてのカテゴリ</option>
            <option value="地域・まち">地域・まち</option>
            <option value="通勤・移動">通勤・移動</option>
            <option value="オフィス・仕事">オフィス・仕事</option>
            <option value="日常生活">日常生活</option>
            <option value="その他">その他</option>
          </select>

          <select
            value={selectedStep}
            onChange={e => setSelectedStep(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <option value="all">すべての進捗ステップ</option>
            <option value="1">ステップ1: 気づきのシェア</option>
            <option value="2">ステップ2: 視点転換中</option>
            <option value="3">ステップ3: ブラッシュアップ中</option>
            <option value="bank">アイデアバンク保存済</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          表示中: <strong className="text-slate-700">{filteredThreads.length}</strong> 件のスレッド
        </div>
      </div>

      {/* スレッドリスト */}
      {filteredThreads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
            <HelpCircle className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700">条件に合う気づきが見つかりませんでした</p>
          <p className="text-xs text-slate-400 mt-1">
            右上の「気づきを投稿」ボタンから、日常の小さな違和感を投稿してみましょう！
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredThreads.map(thread => {
            const author = getAuthor(thread.authorId);

            return (
              <div
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className="bg-white rounded-3xl border border-slate-200 hover:border-amber-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex flex-col group"
              >
                {/* スレッド画像 */}
                {thread.imageUrl && (
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={thread.imageUrl}
                      alt={thread.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/70 text-white backdrop-blur-md">
                        {thread.category}
                      </span>
                    </div>

                    {/* ステップバッジ */}
                    <div className="absolute top-3 right-3">
                      {thread.completedAt ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>アイデアバンク保存済</span>
                        </span>
                      ) : thread.isClosedStep2 ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-600 text-white shadow-sm flex items-center gap-1 animate-pulse">
                          <Sparkles className="w-3 h-3" />
                          <span>ステップ3: ブラッシュアップ中</span>
                        </span>
                      ) : thread.comments.length > 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-sm">
                          ステップ2: 視点の転換中 ({thread.comments.length}件)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-600 text-white shadow-sm">
                          ステップ1: 気づきのシェア
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* タイトル */}
                    <h3 className="text-base font-bold text-slate-800 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                      {thread.title}
                    </h3>

                    {/* 違和感コメント */}
                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {thread.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-3">
                    {/* 投稿者と時間 */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {author && (
                          <img
                            src={author.avatar}
                            alt={author.name}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                          />
                        )}
                        <span className="font-semibold text-slate-700">{author?.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{thread.createdAt}</span>
                      </div>
                    </div>

                    {/* いいね（確認済）＆ コメント数 */}
                    <div className="flex items-center justify-between pt-1">
                      <LikeButton
                        likes={thread.likes}
                        onToggle={() => toggleThreadLike(thread.id)}
                        size="sm"
                        showConfirmedList={true}
                      />

                      <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1 hover:text-slate-600">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{thread.comments.length}</span>
                        </span>
                        {thread.chatMessages.length > 0 && (
                          <span className="flex items-center gap-1 text-indigo-500 font-bold">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{thread.chatMessages.length}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
