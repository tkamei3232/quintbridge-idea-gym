import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { NoticeThread } from '../types';
import { X, Image as ImageIcon, Upload, Sparkles, AlertCircle } from 'lucide-react';

const PRESET_IMAGES = [
  {
    label: '商店街・空き店舗',
    url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'バス停・雨の日',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'オフィス・書類・PC',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: '駅・改札・階段',
    url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: '公園・ベンチ・散歩道',
    url: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80'
  }
];

export const NoticeModal: React.FC = () => {
  const { isNoticeModalOpen, setIsNoticeModalOpen, addNotice, setActiveThreadId, currentMember } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<NoticeThread['category']>('地域・まち');
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isNoticeModalOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setImageUrl(base64);
        setPreviewUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (url: string) => {
    setImageUrl(url);
    setPreviewUrl(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('タイトルと違和感・気づきのコメントを入力してください');
      return;
    }

    const newId = addNotice({
      title: title.trim(),
      description: description.trim(),
      category,
      imageUrl: imageUrl || PRESET_IMAGES[0].url
    });

    // リセットしてモーダルを閉じ、作成したスレッドへ移動
    setTitle('');
    setDescription('');
    setImageUrl('');
    setPreviewUrl('');
    setIsNoticeModalOpen(false);
    if (newId) {
      setActiveThreadId(newId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">
                ステップ1: 気づき・小さな違和感を投稿
              </h3>
              <p className="text-xs text-slate-400">
                通勤時や社内、生活の中で「あれ？」と思ったことをシェアしましょう
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNoticeModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* 投稿者バッジ */}
          {currentMember && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600">
              <img
                src={currentMember.avatar}
                alt={currentMember.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span>
                投稿者: <strong className="text-slate-800">{currentMember.name}</strong> として投稿します
              </span>
            </div>
          )}

          {/* タイトル */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              気づきのタイトル <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例: 駅前商店街のシャッター通りと空き店舗の増加"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            />
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              カテゴリ
            </label>
            <div className="flex flex-wrap gap-2">
              {(['地域・まち', '通勤・移動', 'オフィス・仕事', '日常生活', 'その他'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    category === cat
                      ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 写真の投稿（ファイルアップロード / プリセット選択） */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              写真の投稿 <span className="text-slate-400 font-normal">（違和感をビジュアルで共有）</span>
            </label>

            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-56 bg-slate-100 group">
                <img
                  src={previewUrl}
                  alt="プレビュー"
                  className="w-full h-52 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl('');
                    setPreviewUrl('');
                  }}
                  className="absolute top-2 right-2 bg-slate-900/70 hover:bg-slate-900 text-white p-1.5 rounded-full backdrop-blur-sm transition-all"
                  title="写真を変更"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-amber-50/30"
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700">
                  クリックして写真を選択、またはドラッグ＆ドロップ
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  JPG, PNG, GIF, WebP (最大 5MB)
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* サンプル写真から選ぶ */}
            <div className="mt-3">
              <span className="text-[11px] font-bold text-slate-500 mb-1.5 block">
                またはサンプル写真から選ぶ:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 text-[11px] text-slate-600 transition-all"
                  >
                    <ImageIcon className="w-3 h-3 text-amber-500" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 違和感・コメント記入 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              違和感・気づきのコメント <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="どんな場面で、どんな違和感や困りごとを感じましたか？（例: 夕方なのにシャッターが閉まっていて暗い。立地はいいのにもったいない...）"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNoticeModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>気づきスレッドを投稿する</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
