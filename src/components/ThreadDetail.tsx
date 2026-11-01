import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CommentItem } from '../types';
import { LikeButton } from './LikeButton';
import { BrushUpChat } from './BrushUpChat';
import {
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Shuffle,
  Users
} from 'lucide-react';

const PERSPECTIVE_PRESETS = [
  { label: '別の用途なら？', type: 'shift' as const, prefix: '【視点：別の用途に】もしモノを売る・使う場所以外に活かすとしたら、' },
  { label: '時間をずらすと？', type: 'time' as const, prefix: '【視点：時間をずらす】昼間ではなく深夜や早朝、休日にだけ使えるとしたら、' },
  { label: '子ども・シニア目線なら？', type: 'user' as const, prefix: '【視点：ターゲット変更】小中学生やシニアの方々が主役になるとしたら、' },
  { label: '逆転させると？', type: 'shift' as const, prefix: '【視点：逆転の発想】困りごとを無理に無くすのではなく、逆に楽しむイベントにするなら、' },
  { label: '他業界のアナロジー', type: 'analogy' as const, prefix: '【視点：アナロジー】ゲームのクエストやカフェのようなサードプレイスの仕組みを応用すると、' }
];

export const ThreadDetail: React.FC = () => {
  const {
    activeThread,
    setActiveThreadId,
    currentMember,
    members,
    addComment,
    toggleThreadLike,
    toggleCommentLike,
    closeStep2AndStartStep3
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [selectedPerspective, setSelectedPerspective] = useState<CommentItem['perspectiveType']>('normal');

  if (!activeThread) return null;

  const author = members.find(m => m.id === activeThread.authorId);
  const isAuthor = currentMember?.id === activeThread.authorId;

  const handlePresetClick = (preset: typeof PERSPECTIVE_PRESETS[0]) => {
    setCommentText(preset.prefix);
    setSelectedPerspective(preset.type);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addComment(activeThread.id, commentText.trim(), selectedPerspective);
    setCommentText('');
    setSelectedPerspective('normal');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* 戻るボタン */}
      <button
        onClick={() => setActiveThreadId(null)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-sm"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>気づきテーマ一覧に戻る</span>
      </button>

      {/* ステップ進捗インジケーター */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="text-slate-400">発想トレーニング進捗</span>
          <span className="text-amber-600">
            {activeThread.completedAt
              ? '🎉 アイデアバンク保存完了'
              : activeThread.isClosedStep2
              ? 'ステップ3: ブラッシュアップ中'
              : 'ステップ2: 視点の転換中'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-2 rounded-full bg-amber-500 transition-all" title="ステップ1: 気づきのシェア（完了）" />
          <div
            className={`h-2 rounded-full transition-all ${
              activeThread.comments.length > 0 ? 'bg-amber-500' : 'bg-slate-200'
            }`}
            title="ステップ2: 視点の転換"
          />
          <div
            className={`h-2 rounded-full transition-all ${
              activeThread.completedAt ? 'bg-amber-500' : activeThread.isClosedStep2 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-200'
            }`}
            title="ステップ3: ブラッシュアップ"
          />
        </div>
      </div>

      {/* スレッド本体（ステップ1: 気づきの詳細） */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {activeThread.imageUrl && (
          <div className="relative h-72 w-full bg-slate-900">
            <img
              src={activeThread.imageUrl}
              alt={activeThread.title}
              className="w-full h-full object-cover opacity-95"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/80 text-white backdrop-blur-md">
                {activeThread.category}
              </span>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 text-xs text-slate-400 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              {author && (
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                />
              )}
              <div>
                <span className="font-bold text-slate-700 block text-xs">{author?.name}</span>
                <span className="text-[10px] text-slate-400">{author?.role}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{activeThread.createdAt}</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-800 mt-4 leading-snug">
            {activeThread.title}
          </h1>

          <div className="mt-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/40 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
            <span className="font-bold text-amber-800 block text-xs mb-1">【気づき・日常の違和感】</span>
            {activeThread.description}
          </div>

          {/* スレッドに対するいいね・確認ボタン */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <LikeButton
              likes={activeThread.likes}
              onToggle={() => toggleThreadLike(activeThread.id)}
              size="md"
              showConfirmedList={true}
            />

            {!activeThread.isClosedStep2 && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      '視点転換コメントの意見収集を終了し、ステップ3（アイデアブラッシュアップ＆AI対話）に進みますか？'
                    )
                  ) {
                    closeStep2AndStartStep3(activeThread.id);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>意見収集の終了を宣言する（ステップ3へ）</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ステップ2: 視点の転換エリア */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">
                ステップ2: 視点の転換（コメント・感想を共有）
              </h2>
              <p className="text-xs text-slate-400">
                固定観念を外して「もし〇〇なら？」と違った角度から着想を広げましょう
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {activeThread.comments.length} 件の視点
          </span>
        </div>

        {/* 視点転換コメントの時系列リスト */}
        {activeThread.comments.length === 0 ? (
          <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
            <Shuffle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">まだコメントがありません</p>
            <p className="text-[11px] text-slate-400 mt-1">
              下のボタンや入力欄から、最初の視点転換コメントを投稿してみましょう！
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeThread.comments.map((comment, idx) => {
              const cAuthor = members.find(m => m.id === comment.authorId);
              return (
                <div
                  key={comment.id}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/40 hover:bg-white hover:shadow-sm transition-all space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {cAuthor && (
                        <img
                          src={cAuthor.avatar}
                          alt={cAuthor.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      )}
                      <span className="font-bold text-slate-700">{cAuthor?.name}</span>
                      <span className="text-[10px] text-slate-400">#{idx + 1}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{comment.createdAt}</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap pl-8">
                    {comment.content}
                  </p>

                  <div className="pl-8 pt-1 flex items-center justify-between">
                    <LikeButton
                      likes={comment.likes}
                      onToggle={() => toggleCommentLike(activeThread.id, comment.id)}
                      size="sm"
                      showConfirmedList={true}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* コメント入力エリア（ステップ2受付中のみ、または追記可能） */}
        {!activeThread.isClosedStep2 ? (
          <form onSubmit={handleCommentSubmit} className="pt-4 border-t border-slate-100 space-y-3">
            <div>
              <span className="text-[11px] font-bold text-slate-500 mb-1.5 block">
                💡 視点を変えるヒント（クリックで挿入）:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PERSPECTIVE_PRESETS.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 text-[11px] text-slate-600 transition-all"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="この気づきに対して、別の視点や感想、アイデアの切り口を投稿してください..."
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 resize-none pr-12"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="absolute right-3 bottom-3 p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 text-white transition-all shadow-sm"
                title="視点転換コメントを送信"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200/60 text-xs text-indigo-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              <span>意見収集は終了宣言されました。ステップ3でAIと一緒にアイデアを具体化しましょう！</span>
            </div>
          </div>
        )}
      </div>

      {/* ステップ3: アイデアブラッシュアップ（終了宣言済みの場合に表示） */}
      {activeThread.isClosedStep2 && (
        <BrushUpChat thread={activeThread} />
      )}
    </div>
  );
};
