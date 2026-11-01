import React from 'react';
import { useApp } from '../context/AppContext';
import { Member } from '../types';
import { Sparkles, Users, Check } from 'lucide-react';

export const MemberSelector: React.FC = () => {
  const { members, currentMember, setCurrentMember, isMemberSelectorOpen, setIsMemberSelectorOpen } = useApp();

  // 既にメンバーが選ばれていて、かつモーダルが開いていない場合は表示しない
  if (currentMember && !isMemberSelectorOpen) {
    return null;
  }

  const handleSelect = (member: Member) => {
    setCurrentMember(member);
    setIsMemberSelectorOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 border border-slate-100 relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 mb-4 shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            IDEA GYM へようこそ！
          </h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            日常の違和感や困りごとを、仲間とAIでひらめきに変えるトレーニング。<br />
            まずは<strong className="text-slate-700">あなたのメンバーを選択</strong>してください。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {members.map(member => {
            const isSelected = currentMember?.id === member.id;
            return (
              <button
                key={member.id}
                onClick={() => handleSelect(member)}
                className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 group ${
                  isSelected
                    ? 'border-amber-400 bg-amber-50/50 shadow-md ring-2 ring-amber-300/50'
                    : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-slate-50/80 hover:shadow'
                }`}
              >
                <div className="relative">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                  />
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${member.color}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-800 truncate group-hover:text-amber-600 transition-colors">
                      {member.name}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{member.role}</p>
                  <span className="inline-block mt-2 text-[11px] font-semibold text-amber-600 bg-amber-100/70 px-2 py-0.5 rounded-full">
                    選択する →
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {currentMember && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsMemberSelectorOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 underline"
            >
              閉じる
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
