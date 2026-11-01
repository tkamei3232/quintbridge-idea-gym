import React from 'react';
import { Heart, CheckCircle2 } from 'lucide-react';
import { LikeInfo } from '../types';
import { useApp } from '../context/AppContext';

interface LikeButtonProps {
  likes: LikeInfo[];
  onToggle: () => void;
  size?: 'sm' | 'md';
  showConfirmedList?: boolean;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  likes,
  onToggle,
  size = 'md',
  showConfirmedList = true
}) => {
  const { currentMember, members } = useApp();

  const isLikedByMe = currentMember ? likes.some(l => l.memberId === currentMember.id) : false;

  const getMember = (id: string) => members.find(m => m.id === id);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={e => {
          e.stopPropagation();
          onToggle();
        }}
        className={`inline-flex items-center gap-1.5 rounded-full border transition-all duration-200 ${
          size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm'
        } ${
          isLikedByMe
            ? 'border-pink-300 bg-pink-50 text-pink-600 font-medium shadow-sm hover:bg-pink-100'
            : 'border-slate-200 bg-white text-slate-600 hover:border-pink-200 hover:bg-pink-50/50 hover:text-pink-500'
        }`}
        title={isLikedByMe ? 'いいね（確認）を取り消す' : 'いいね！確認しました'}
      >
        <Heart
          className={`transition-transform duration-200 ${isLikedByMe ? 'fill-pink-500 text-pink-500 scale-110' : 'text-slate-400'} ${
            size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
          }`}
        />
        <span>{likes.length}</span>
        {isLikedByMe && <span className="text-xs text-pink-500 font-normal">確認済</span>}
      </button>

      {/* 確認済みのメンバーアバター一覧 */}
      {showConfirmedList && likes.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline-block mr-0.5" />
          <span className="text-[11px] text-slate-400">確認済:</span>
          <div className="flex -space-x-1.5 overflow-hidden">
            {likes.map(like => {
              const m = getMember(like.memberId);
              if (!m) return null;
              return (
                <img
                  key={like.memberId}
                  src={m.avatar}
                  alt={m.name}
                  title={`${m.name} が確認・いいねしました`}
                  className="inline-block h-5 w-5 rounded-full ring-2 ring-white object-cover shadow-sm"
                />
              );
            })}
          </div>
          <span className="text-[11px] font-medium text-slate-600">
            {likes.map(l => getMember(l.memberId)?.name).filter(Boolean).join(', ')}
          </span>
        </div>
      )}
    </div>
  );
};
