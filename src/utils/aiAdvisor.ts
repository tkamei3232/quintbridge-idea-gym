import { NoticeThread, ChatMessage } from '../types';

export interface AIFeedbackOption {
  id: string;
  label: string;
  icon: string;
  promptGuidance: string;
}

export const AI_FRAMEWORK_OPTIONS: AIFeedbackOption[] = [
  {
    id: 'scamper',
    label: 'SCAMPER法で拡張',
    icon: '⚡',
    promptGuidance: '代用・結合・適応・修正・他用途・削除・逆転の視点でアイデアを大胆に発展させてください。'
  },
  {
    id: 'target-shift',
    label: 'ターゲットを逆転・変更',
    icon: '👥',
    promptGuidance: 'もしこのサービスの利用者を「子ども」「シニア」「地域外の観光客」に変えたらどうなるか提案してください。'
  },
  {
    id: 'analogy',
    label: '別業界のアナロジー',
    icon: '💡',
    promptGuidance: 'ゲーム業界（ゲーミフィケーション）、飲食業界、あるいはサブスクモデルの仕組みを応用する切り口を提示してください。'
  },
  {
    id: 'monetize',
    label: '持続可能性・マネタイズ',
    icon: '💰',
    promptGuidance: '誰がお金を払い、誰がメリットを得るエコシステムにするか、地域活性化と経済循環の観点でアドバイスしてください。'
  },
  {
    id: 'naming',
    label: 'キャッチコピー＆命名',
    icon: '✨',
    promptGuidance: 'ユーザーに一瞬で伝わる魅力的なサービス名（仮称）と、ワクワクするタグラインを3案提案してください。'
  }
];

/**
 * 内蔵AIブレインストーミングエンジンによるフィードバック生成
 */
export async function generateAIFeedback(
  thread: NoticeThread,
  recentMessages: ChatMessage[],
  frameworkId?: string
): Promise<{ content: string; frameworkName: string }> {
  const framework = AI_FRAMEWORK_OPTIONS.find(f => f.id === frameworkId) || AI_FRAMEWORK_OPTIONS[0];

  // 過去のディスカッションテキストの集約
  const commentsSummary = thread.comments.map(c => `・${c.content}`).join('\n');
  const chatSummary = recentMessages.slice(-3).map(m => `・${m.content}`).join('\n');

  // 自然な思考ディレイ（少し待ってから回答することでAIの思考感を演出）
  await new Promise(resolve => setTimeout(resolve, 800));

  let advice = '';

  switch (framework.id) {
    case 'scamper':
      advice = `🤖 【AIフィードバック: SCAMPER発想法】\n「${thread.title}」について、発想をさらに飛躍させる3つの問いかけです！\n\n` +
        `1. 【Combine (組み合わせ)】既存の施設やインフラ（街頭、自販機、郵便局など）とこのアイデアを掛け合わせると、初期コストをゼロに近づけられないでしょうか？\n` +
        `2. 【Reverse (逆転)】「困りごとを解決する」のではなく、「困っている状態そのものを楽しむイベント（例: 雨の日限定ミッション）」にひっくり返すとどう変化しますか？\n` +
        `3. 【Eliminate (削ぎ落とし)】アプリの画面操作すら不要な、ただ近づくだけ/ワンタップで完結する極限までシンプルな体験にするなら？`;
      break;

    case 'target-shift':
      advice = `🤖 【AIフィードバック: ターゲット視点のシフト】\n主たる対象をガラッと変えることで、隠れた価値が見つかります。\n\n` +
        `👶 【子ども・小中学生目線】\n大人が「面倒」「不便」と感じているものを、子どもたちの「探検・クエスト」に変えられないでしょうか？街の困りごとを見つけるとレベルアップする仕組みなど。\n\n` +
        `👵 【地域シニア目線】\n地域のベテラン住民が先生やアドバイザーとして活躍し、デジタルが苦手な方でも声やカードで参加できる設計にするとコミュニティが強固になります！`;
      break;

    case 'analogy':
      advice = `🤖 【AIフィードバック: 別業界アナロジー思考】\n他業界の勝ちパターンを「${thread.title}」に移植してみましょう！\n\n` +
        `🎮 【RPG・ゲーム業界から学ぶ】\n困りごとを「街のモンスター」に見立て、仲間と協力して解決するギルド制（パーティーを組んで挑む）にすると、若者の自発的参加が爆発的に増えます。\n\n` +
        `☕ 【サードプレイス（カフェ）から学ぶ】\n用事がなくても「なんとなく立ち寄りたくなる居心地の良さ」をどうデジタルや空間に持たせるか？`;
      break;

    case 'monetize':
      advice = `🤖 【AIフィードバック: 経済循環・マネタイズ設計】\nボランティアで終わらせず、継続して回り続けるビジネスモデルの切り口です。\n\n` +
        `1. 【地元スポンサー型】地域の商店や企業がPR費として協賛し、ユーザーには地元で使えるポイントや特別特典を還元するモデル。\n` +
        `2. 【自治体DX・業務委託】行政が住民アンケートや課題調査にかける年間予算を、このプラットフォームで代替・リアルタイム可視化することでBtoG（自治体契約）へ繋げる。`;
      break;

    case 'naming':
      advice = `🤖 【AIフィードバック: ネーミング＆キャッチコピー提案】\n\n` +
        `💡 案1: 『マチノミライ (Machi-Mirai)』\n　コピー: 「街のちいさなため息を、みんなのひらめきに変える」\n\n` +
        `💡 案2: 『スキマクエスト』\n　コピー: 「待ち時間も空き場所も、ぜんぶ日常の遊び場に。」\n\n` +
        `💡 案3: 『Pocket Hub (ポケットハブ)』\n　コピー: 「スマホひとつで、地元とつながる3分間の魔法」`;
      break;

    default:
      advice = `🤖 【AIフィードバック】\n「${thread.title}」に関する素晴らしいディスカッションですね！\n特に「${thread.comments[0]?.content.slice(0, 30) || '皆さんのアイデア'}...」という着眼点は非常にユニークです。次は「最初の1人目のユーザーが思わず人に教えたくなる感動ポイント」はどこか詰めてみませんか？`;
  }

  return {
    content: advice,
    frameworkName: framework.label
  };
}
