import React, { createContext, useContext, useState, useEffect } from 'react';
import { Member, MemberId, NoticeThread, StepType, LikeInfo, CommentItem, ChatMessage, ViewTab } from '../types';
import { MEMBERS, INITIAL_THREADS } from '../data/initialData';
import { generateAIFeedback } from '../utils/aiAdvisor';

interface AppContextType {
  currentMember: Member | null;
  setCurrentMember: (member: Member) => void;
  members: Member[];
  threads: NoticeThread[];
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;
  activeThread: NoticeThread | null;
  currentTab: ViewTab;
  setCurrentTab: (tab: ViewTab) => void;
  isNoticeModalOpen: boolean;
  setIsNoticeModalOpen: (open: boolean) => void;
  isMemberSelectorOpen: boolean;
  setIsMemberSelectorOpen: (open: boolean) => void;
  isMiningModalOpen: boolean;
  setIsMiningModalOpen: (open: boolean) => void;
  addNotice: (data: { title: string; description: string; category: NoticeThread['category']; imageUrl?: string }) => string;
  addComment: (threadId: string, content: string, perspectiveType?: CommentItem['perspectiveType']) => void;
  toggleThreadLike: (threadId: string) => void;
  toggleCommentLike: (threadId: string, commentId: string) => void;
  toggleChatLike: (threadId: string, messageId: string) => void;
  closeStep2AndStartStep3: (threadId: string) => void;
  sendChatMessage: (threadId: string, content: string, senderType?: 'member' | 'ai', frameworkId?: string) => Promise<void>;
  saveToIdeaBank: (threadId: string, finalIdea: NonNullable<NoticeThread['finalIdea']>) => void;
  resetToInitialData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_THREADS = 'idea_gym_threads_v1';
const STORAGE_KEY_CURRENT_MEMBER = 'idea_gym_current_member_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const members = MEMBERS;

  // 選択中メンバーの初期化
  const [currentMember, setCurrentMemberState] = useState<Member | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_MEMBER);
      if (saved) {
        const found = members.find(m => m.id === saved);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return null; // 初回起動時はメンバー選択モーダルを表示
  });

  // スレッドデータの初期化
  const [threads, setThreads] = useState<NoticeThread[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THREADS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_THREADS;
  });

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<ViewTab>('notices');
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isMemberSelectorOpen, setIsMemberSelectorOpen] = useState(false);
  const [isMiningModalOpen, setIsMiningModalOpen] = useState(false);

  // 永続化
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THREADS, JSON.stringify(threads));
  }, [threads]);

  const setCurrentMember = (member: Member) => {
    setCurrentMemberState(member);
    localStorage.setItem(STORAGE_KEY_CURRENT_MEMBER, member.id);
  };

  const activeThread = threads.find(t => t.id === activeThreadId) || null;

  // ステップ1: 気づきの新規投稿
  const addNotice = (data: {
    title: string;
    description: string;
    category: NoticeThread['category'];
    imageUrl?: string;
  }): string => {
    if (!currentMember) return '';

    const newThread: NoticeThread = {
      id: `notice-${Date.now()}`,
      title: data.title,
      description: data.description,
      category: data.category,
      imageUrl: data.imageUrl,
      authorId: currentMember.id,
      createdAt: formatCurrentDate(),
      currentStep: 1, // 初期ステップ1
      likes: [],
      comments: [],
      chatMessages: []
    };

    setThreads(prev => [newThread, ...prev]);
    return newThread.id;
  };

  // ステップ2: 視点転換コメントの追加
  const addComment = (threadId: string, content: string, perspectiveType: CommentItem['perspectiveType'] = 'normal') => {
    if (!currentMember) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      authorId: currentMember.id,
      content,
      perspectiveType,
      createdAt: formatCurrentDate(),
      likes: []
    };

    setThreads(prev =>
      prev.map(thread => {
        if (thread.id === threadId) {
          return {
            ...thread,
            currentStep: 2, // コメントがついたらステップ2へ進行
            comments: [...thread.comments, newComment]
          };
        }
        return thread;
      })
    );
  };

  // いいねトグル共通処理
  const toggleLikeHelper = (likes: LikeInfo[], memberId: MemberId): LikeInfo[] => {
    const exists = likes.some(l => l.memberId === memberId);
    if (exists) {
      return likes.filter(l => l.memberId !== memberId);
    } else {
      return [...likes, { memberId, timestamp: formatCurrentDate() }];
    }
  };

  // スレッドへのいいね（確認済み登録）
  const toggleThreadLike = (threadId: string) => {
    if (!currentMember) return;
    setThreads(prev =>
      prev.map(thread => {
        if (thread.id === threadId) {
          return {
            ...thread,
            likes: toggleLikeHelper(thread.likes, currentMember.id)
          };
        }
        return thread;
      })
    );
  };

  // コメントへのいいね
  const toggleCommentLike = (threadId: string, commentId: string) => {
    if (!currentMember) return;
    setThreads(prev =>
      prev.map(thread => {
        if (thread.id === threadId) {
          return {
            ...thread,
            comments: thread.comments.map(c => {
              if (c.id === commentId) {
                return {
                  ...c,
                  likes: toggleLikeHelper(c.likes, currentMember.id)
                };
              }
              return c;
            })
          };
        }
        return thread;
      })
    );
  };

  // チャットメッセージへのいいね
  const toggleChatLike = (threadId: string, messageId: string) => {
    if (!currentMember) return;
    setThreads(prev =>
      prev.map(thread => {
        if (thread.id === threadId) {
          return {
            ...thread,
            chatMessages: thread.chatMessages.map(m => {
              if (m.id === messageId) {
                return {
                  ...m,
                  likes: toggleLikeHelper(m.likes, currentMember.id)
                };
              }
              return m;
            })
          };
        }
        return thread;
      })
    );
  };

  // 投稿者による意見収集終了宣言（ステップ3への移行）
  const closeStep2AndStartStep3 = (threadId: string) => {
    setThreads(prev =>
      prev.map(thread => {
        if (thread.id === threadId) {
          // 初期AIウェルカムメッセージ
          const initialAiMsg: ChatMessage = {
            id: `msg-ai-${Date.now()}`,
            senderType: 'ai',
            content: `🎉 意見収集が完了しました！ここから【ステップ3：アイデアブラッシュアップ】のスタートです。\nメンバーの多角的なコメントを踏まえ、具体的なサービスや解決策のディスカッションを行いましょう！困ったら下の「AIに壁打ちしてもらう」ボタンからいつでも切り口を呼び出せます。`,
            createdAt: formatCurrentDate(),
            likes: []
          };

          return {
            ...thread,
            currentStep: 3,
            isClosedStep2: true,
            chatMessages: thread.chatMessages.length === 0 ? [initialAiMsg] : thread.chatMessages
          };
        }
        return thread;
      })
    );
  };

  // ステップ3: チャットメッセージ送信
  const sendChatMessage = async (
    threadId: string,
    content: string,
    senderType: 'member' | 'ai' = 'member',
    frameworkId?: string
  ) => {
    const thread = threads.find(t => t.id === threadId);
    if (!thread) return;

    if (senderType === 'member') {
      if (!currentMember) return;

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderType: 'member',
        senderId: currentMember.id,
        content,
        createdAt: formatCurrentDate(),
        likes: []
      };

      setThreads(prev =>
        prev.map(t => (t.id === threadId ? { ...t, chatMessages: [...t.chatMessages, userMsg] } : t))
      );
    } else {
      // AIフィードバックの生成
      const aiResponse = await generateAIFeedback(thread, thread.chatMessages, frameworkId);

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        senderType: 'ai',
        content: aiResponse.content,
        createdAt: formatCurrentDate(),
        likes: [],
        aiFramework: aiResponse.frameworkName
      };

      setThreads(prev =>
        prev.map(t => (t.id === threadId ? { ...t, chatMessages: [...t.chatMessages, aiMsg] } : t))
      );
    }
  };

  // アイデアバンクに保存
  const saveToIdeaBank = (threadId: string, finalIdea: NonNullable<NoticeThread['finalIdea']>) => {
    setThreads(prev =>
      prev.map(thread => {
        if (thread.id === threadId) {
          return {
            ...thread,
            completedAt: formatCurrentDate(),
            finalIdea
          };
        }
        return thread;
      })
    );
    // 保存後アイデアバンクへ切り替え
    setCurrentTab('bank');
  };

  // 初期データリセット
  const resetToInitialData = () => {
    if (window.confirm('初期サンプルデータにリセットしますか？')) {
      setThreads(INITIAL_THREADS);
      localStorage.removeItem(STORAGE_KEY_THREADS);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentMember,
        setCurrentMember,
        members,
        threads,
        activeThreadId,
        setActiveThreadId,
        activeThread,
        currentTab,
        setCurrentTab,
        isNoticeModalOpen,
        setIsNoticeModalOpen,
        isMemberSelectorOpen,
        setIsMemberSelectorOpen,
        isMiningModalOpen,
        setIsMiningModalOpen,
        addNotice,
        addComment,
        toggleThreadLike,
        toggleCommentLike,
        toggleChatLike,
        closeStep2AndStartStep3,
        sendChatMessage,
        saveToIdeaBank,
        resetToInitialData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

function formatCurrentDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
}
