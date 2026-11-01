import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Archive, Sparkles, ArrowRight, CheckCircle2, Search, Calendar, User } from 'lucide-react';
import { LikeButton } from './LikeButton';

export const IdeaBank: React.FC = () => {
  const { threads, setActiveThreadId, setCurrentTab, members, toggleThreadLike } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  // 完了したスレッドのみ抽出
  const bankThreads = threads.filter(t => t.completedAt && t.finalIdea);

  const filtered = bankThreads.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.finalIdea?.title.toLowerCase().includes(q) ||
      t.finalIdea?.summary.toLowerCase().includes(q) ||
      t.finalIdea?.targetUser.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q)
    );
  });

  const getAuthor = (id: string) => members.find(m => m.id === id);

  return (
    <div className="space-y-6">
      {/* ヘッダーエリア */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2 backdrop-blur-sm">
            <Archive className="w-3.5 h-3.5" />
            <span>ストックされたアイデア</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            IDEA BANK (アイデアバンク)
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-amber-50 leading-relaxed max-w-xl">
            日頃の気づき（①）から視点を転換し（②）、AIと磨き上げた（③）成果がここに集約されています。
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center shrink-0 border border-white/20">
          <span className="text-[11px] font-bold text-amber-100 block">ストック総数</span>
          <span className="text-3xl font-black text-white">{bankThreads.length}</span>
          <span className="text-xs text-amber-100 ml-1">件</span>
        </div>
      </div>

      {/* 検索バー */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="ストック済みアイデアをキーワードやターゲットで検索..."
          className="w-full text-xs text-slate-700 placeholder-slate-400 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            クリア
          </button>
        )}
      </div>

      {/* アイデアカードグリッド */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
          <Archive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">
            {searchQuery ? '検索条件に一致するアイデアがありません' : 'まだストックされたアイデアがありません'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            気づきテーマ一覧からスレッドを進め、ステップ3で「アイデアバンクにストックする」を実行すると、ここに蓄積されます。
          </p>
          <button
            onClick={() => setCurrentTab('notices')}
            className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5"
          >
            <span>気づきテーマ一覧を見る</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(thread => {
            const author = getAuthor(thread.authorId);
            const idea = thread.finalIdea!;

            return (
              <div
                key={thread.id}
                className="bg-white rounded-3xl border border-amber-200/80 hover:border-amber-400 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* カード上部バナー */}
                  <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50/40 border-b border-amber-100/60">
                    <div className="flex items-center justify-between text-[11px] text-amber-700 font-bold mb-2">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>完成アイデア</span>
                      </span>
                      <span className="text-slate-400 font-normal">{idea.savedAt}</span>
                    </div>

                    <h2 className="text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                      {idea.title}
                    </h2>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* アイデア概要 */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block mb-1">
                        💡 アイデア概要
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {idea.summary}
                      </p>
                    </div>

                    {/* ターゲット ＆ 特徴 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 block">ターゲット</span>
                        <span className="text-xs text-slate-700 font-medium">{idea.targetUser}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 block">コア機能</span>
                        <span className="text-xs text-slate-700 font-medium">{idea.keyFeature}</span>
                      </div>
                    </div>

                    {/* 原点となった気づき */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center gap-3">
                      {thread.imageUrl && (
                        <img
                          src={thread.imageUrl}
                          alt={thread.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-400 block truncate">
                          原点の気づき: {thread.category}
                        </span>
                        <p className="text-xs font-semibold text-slate-700 truncate">
                          {thread.title}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* カード下部アクション */}
                <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                  <div className="pt-3">
                    <LikeButton
                      likes={thread.likes}
                      onToggle={() => toggleThreadLike(thread.id)}
                      size="sm"
                      showConfirmedList={true}
                    />
                  </div>

                  <button
                    onClick={() => {
                      setActiveThreadId(thread.id);
                      setCurrentTab('notices');
                    }}
                    className="pt-3 text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>スレッドの軌跡を見る</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
