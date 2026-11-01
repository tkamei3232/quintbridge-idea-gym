export type MemberId = 'ricky' | 'haru' | 'tatsu' | 'chimata';

export interface Member {
  id: MemberId;
  name: string;
  avatar: string;
  role: string;
  color: string;
}

export type StepType = 1 | 2 | 3; // 1: 気づきシェア, 2: 視点転換, 3: ブラッシュアップ

export interface LikeInfo {
  memberId: MemberId;
  timestamp: string;
}

export interface CommentItem {
  id: string;
  authorId: MemberId;
  content: string;
  perspectiveType?: 'question' | 'shift' | 'analogy' | 'user' | 'time' | 'normal'; // 視点切り替えタグ
  createdAt: string;
  likes: LikeInfo[];
}

export interface ChatMessage {
  id: string;
  senderType: 'member' | 'ai';
  senderId?: MemberId;
  content: string;
  createdAt: string;
  likes: LikeInfo[];
  aiFramework?: string; // 例: SCAMPER法、対象シフト、アナロジー等
}

export interface NoticeThread {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  category: '通勤・移動' | 'オフィス・仕事' | '地域・まち' | '日常生活' | 'その他';
  authorId: MemberId;
  createdAt: string;
  currentStep: StepType;
  likes: LikeInfo[];
  comments: CommentItem[]; // ステップ2のコメント
  chatMessages: ChatMessage[]; // ステップ3のブラッシュアップディスカッション
  isClosedStep2?: boolean; // 投稿者が意見収集終了を宣言したか
  completedAt?: string; // アイデアバンク保存日時
  finalIdea?: {
    title: string;
    summary: string;
    targetUser: string;
    keyFeature: string;
    savedAt: string;
  };
}

export type ViewTab = 'notices' | 'bank' | 'mining';
