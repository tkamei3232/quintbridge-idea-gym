import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { analyzeThreads, MiningResult, WordFrequency } from '../utils/textMining';
import { exportToCsv, exportToJson, exportToTxt } from '../utils/exportData';
import {
  X,
  BarChart3,
  FileDown,
  Sparkles,
  Cloud,
  Network,
  Users,
  Activity,
  Layers
} from 'lucide-react';

export const TextMiningModal: React.FC = () => {
  const { isMiningModalOpen, setIsMiningModalOpen, threads, members } = useApp();

  const [activeTab, setActiveTab] = useState<'cloud' | 'ranking' | 'network' | 'members'>('cloud');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // マイニング解析の実行（threadsが変化したら自動更新）
  const miningData: MiningResult = useMemo(() => {
    return analyzeThreads(threads);
  }, [threads]);

  // ワードクラウドのCanvas描画
  useEffect(() => {
    if (!isMiningModalOpen || activeTab !== 'cloud') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 高解像度ディスプレイ対応
    const width = canvas.parentElement?.clientWidth || 700;
    const height = 380;
    canvas.width = width * 2;
    canvas.height = height * 2;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(2, 2);
    ctx.clearRect(0, 0, width, height);

    const words = miningData.wordFrequencies.slice(0, 32);
    if (words.length === 0) return;

    // カラーパレット
    const colors = [
      '#F59E0B', '#D97706', '#2563EB', '#1D4ED8', '#10B981', '#059669',
      '#8B5CF6', '#7C3AED', '#EC4899', '#DB2777', '#0284C7', '#0F766E'
    ];

    const centerX = width / 2;
    const centerY = height / 2;

    // スパイラル配置アルゴリズム（配置済みボックスとの簡易衝突回避）
    const placedBoxes: { x: number; y: number; w: number; h: number }[] = [];

    words.forEach((w, idx) => {
      const fontSize = Math.max(13, Math.min(38, Math.round(14 + w.weight * 26)));
      ctx.font = `bold ${fontSize}px sans-serif`;

      const metrics = ctx.measureText(w.text);
      const textWidth = metrics.width;
      const textHeight = fontSize;

      let radius = 0;
      let angle = idx * 2.4;
      let placed = false;
      let finalX = centerX;
      let finalY = centerY;

      for (let step = 0; step < 120; step++) {
        const x = centerX + radius * Math.cos(angle) - textWidth / 2;
        const y = centerY + radius * Math.sin(angle) * 0.7 + textHeight / 3;

        // 境界チェック
        if (x > 10 && x + textWidth < width - 10 && y > textHeight && y < height - 10) {
          // 既存ボックスとの重複判定
          let collide = false;
          for (const box of placedBoxes) {
            if (
              x < box.x + box.w + 6 &&
              x + textWidth + 6 > box.x &&
              y - textHeight < box.y + box.h + 4 &&
              y + 4 > box.y
            ) {
              collide = true;
              break;
            }
          }

          if (!collide) {
            finalX = x;
            finalY = y;
            placed = true;
            placedBoxes.push({ x, y: y - textHeight, w: textWidth, h: textHeight });
            break;
          }
        }

        radius += 4;
        angle += 0.45;
      }

      if (placed) {
        ctx.fillStyle = colors[idx % colors.length];
        ctx.fillText(w.text, finalX, finalY);

        // 出現数の小さなインジケータ
        ctx.font = `bold 9px sans-serif`;
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(`(${w.count})`, finalX + textWidth + 2, finalY - fontSize * 0.4);
      }
    });
  }, [isMiningModalOpen, activeTab, miningData]);

  if (!isMiningModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 border border-slate-100 my-8">
        {/* モーダルヘッダー */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <span>テキストマイニング分析ダッシュボード</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  NLP Analysis
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                メンバーが投稿した違和感・コメント・アイデアから重要キーワードと傾向を抽出
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMiningModalOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 概要サマリーカード */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/50">
            <span className="text-[11px] font-bold text-amber-700 block">総文字数</span>
            <span className="text-xl font-black text-amber-900">{miningData.totalChars.toLocaleString()}</span>
            <span className="text-[10px] text-amber-600 ml-1">文字</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/50">
            <span className="text-[11px] font-bold text-indigo-700 block">抽出単語数</span>
            <span className="text-xl font-black text-indigo-900">{miningData.totalWords.toLocaleString()}</span>
            <span className="text-[10px] text-indigo-600 ml-1">語</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/50">
            <span className="text-[11px] font-bold text-emerald-700 block">分析スレッド</span>
            <span className="text-xl font-black text-emerald-900">{threads.length}</span>
            <span className="text-[10px] text-emerald-600 ml-1">件</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/50">
            <span className="text-[11px] font-bold text-purple-700 block">完成アイデア</span>
            <span className="text-xl font-black text-purple-900">{threads.filter(t => t.completedAt).length}</span>
            <span className="text-[10px] text-purple-600 ml-1">件</span>
          </div>
        </div>

        {/* 分析タブ切り替え */}
        <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-4">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'cloud'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>ワードクラウド</span>
          </button>

          <button
            onClick={() => setActiveTab('ranking')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ranking'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>頻出キーワード順位</span>
          </button>

          <button
            onClick={() => setActiveTab('network')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'network'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>共起ネットワーク</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'members'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>メンバー活動分析</span>
          </button>
        </div>

        {/* タブコンテンツ */}
        <div className="min-h-[380px]">
          {/* 1. ワードクラウド */}
          {activeTab === 'cloud' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-center">
                <canvas ref={canvasRef} className="max-w-full" />
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                ※頻出度に応じて文字サイズとカラーが自動調整されています。
              </p>
            </div>
          )}

          {/* 2. 頻出キーワードランキング */}
          {activeTab === 'ranking' && (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {miningData.wordFrequencies.slice(0, 20).map((item, idx) => {
                const maxCount = miningData.wordFrequencies[0]?.count || 1;
                const percentage = Math.round((item.count / maxCount) * 100);

                return (
                  <div
                    key={item.text}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-xs"
                  >
                    <span className="w-6 font-bold text-slate-400 text-center">
                      #{idx + 1}
                    </span>
                    <span className="w-28 font-bold text-slate-800 truncate">
                      {item.text}
                    </span>
                    <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-16 text-right font-black text-slate-700">
                      {item.count} <span className="text-[10px] font-normal text-slate-400">回</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. 共起ネットワーク */}
          {activeTab === 'network' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
                <span className="font-bold text-slate-800 block mb-1">
                  🔗 一緒に語られやすいキーワードのつながり（共起関係）:
                </span>
                <p className="text-slate-500">
                  同一スレッドやコメント内で頻繁に同時に登場するトピックの組み合わせです。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto">
                {miningData.coOccurrences.map((link, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                      <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 truncate max-w-[90px]">
                        {link.source}
                      </span>
                      <span className="text-slate-300">↔</span>
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 truncate max-w-[90px]">
                        {link.target}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-1">
                      {link.value}回共起
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. メンバー活動分析 */}
          {activeTab === 'members' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {miningData.memberStats.map(stat => {
                const memberObj = members.find(m => m.name === stat.memberName);
                return (
                  <div
                    key={stat.memberName}
                    className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-4"
                  >
                    {memberObj && (
                      <img
                        src={memberObj.avatar}
                        alt={stat.memberName}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-800">{stat.memberName}</span>
                        <span className="text-[11px] text-slate-400">{memberObj?.role}</span>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-1.5 text-center text-[11px]">
                        <div className="p-1.5 bg-slate-50 rounded-lg">
                          <span className="text-slate-400 block text-[10px]">気づき投稿</span>
                          <span className="font-bold text-slate-700">{stat.postCount}</span>
                        </div>
                        <div className="p-1.5 bg-slate-50 rounded-lg">
                          <span className="text-slate-400 block text-[10px]">視点コメント</span>
                          <span className="font-bold text-emerald-600">{stat.commentCount}</span>
                        </div>
                        <div className="p-1.5 bg-slate-50 rounded-lg">
                          <span className="text-slate-400 block text-[10px]">いいね確認</span>
                          <span className="font-bold text-pink-600">{stat.likeCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* モーダル下部エクスポート導線 */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            ※抽出された分析データおよび全投稿テキストはいつでも外部出力できます
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToCsv(threads, members)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>CSV出力</span>
            </button>
            <button
              onClick={() => exportToTxt(threads, members)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>全テキスト出力</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
