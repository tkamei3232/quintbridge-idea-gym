import { Member, NoticeThread } from '../types';

export const MEMBERS: Member[] = [
  {
    id: 'ricky',
    name: 'Ricky',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    role: 'プロダクトリード / 発案者',
    color: 'bg-amber-500'
  },
  {
    id: 'haru',
    name: 'h-a-r-u',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
    role: 'デザイナー / リサーチャー',
    color: 'bg-emerald-500'
  },
  {
    id: 'tatsu',
    name: 'tatsu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    role: 'エンジニア / テックリード',
    color: 'bg-blue-500'
  },
  {
    id: 'chimata',
    name: '千股弘旗',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    role: 'コミュニティファシリテーター',
    color: 'bg-purple-500'
  }
];

export const INITIAL_THREADS: NoticeThread[] = [
  {
    id: 'notice-1',
    title: '駅前商店街のシャッター通りと空き店舗の増加',
    description: '通勤路にある昔ながらの商店街。夕方18時なのに半分以上のシャッターが閉まっていて暗い。昼間見てもテナント募集の看板が目立つ。場所自体は駅から徒歩3分で立地が良いのに、ただ閉まっているのは勿体ない違和感。',
    category: '地域・まち',
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
    authorId: 'ricky',
    createdAt: '2026-11-01 08:30',
    currentStep: 2,
    likes: [
      { memberId: 'haru', timestamp: '2026-11-01 08:45' },
      { memberId: 'tatsu', timestamp: '2026-11-01 09:10' },
      { memberId: 'chimata', timestamp: '2026-11-01 09:20' }
    ],
    comments: [
      {
        id: 'c-1',
        authorId: 'haru',
        content: '【視点を変える：時間をずらす】昼や夕方ではなく、夜間限定の「夜カフェ」や「大人のスキル交換会」として場所を開放してみたらどうかな？',
        perspectiveType: 'time',
        createdAt: '2026-11-01 09:15',
        likes: [
          { memberId: 'ricky', timestamp: '2026-11-01 09:25' },
          { memberId: 'tatsu', timestamp: '2026-11-01 09:30' }
        ]
      },
      {
        id: 'c-2',
        authorId: 'tatsu',
        content: '【視点を変える：別の用途に】モノを売る店舗としてではなく、AIを使った住民の学び場やスマートロッカー・受け取りハブに再定義できそう。',
        perspectiveType: 'shift',
        createdAt: '2026-11-01 09:40',
        likes: [
          { memberId: 'ricky', timestamp: '2026-11-01 09:45' },
          { memberId: 'chimata', timestamp: '2026-11-01 09:50' }
        ]
      },
      {
        id: 'c-3',
        authorId: 'chimata',
        content: '【視点を変える：子ども・学生目線】学校帰りの高校生や大学生が自習・作業できる無料コワーキング兼コミュニティスペースなら人が集まるかも！',
        perspectiveType: 'user',
        createdAt: '2026-11-01 10:05',
        likes: [
          { memberId: 'ricky', timestamp: '2026-11-01 10:12' }
        ]
      }
    ],
    chatMessages: []
  },
  {
    id: 'notice-2',
    title: '雨の日のバス停でスマホ片手に立ち尽くす長い待ち時間',
    description: '今朝の雨でバスが15分遅延。屋根のないバス停でみんな傘をさしながら不安そうに時刻表と道路の先を見つめていた。待ち時間そのものが退屈でストレスになっている。',
    category: '通勤・移動',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    authorId: 'tatsu',
    createdAt: '2026-10-31 17:15',
    currentStep: 3,
    isClosedStep2: true,
    likes: [
      { memberId: 'ricky', timestamp: '2026-10-31 17:30' },
      { memberId: 'haru', timestamp: '2026-10-31 17:45' }
    ],
    comments: [
      {
        id: 'c-4',
        authorId: 'ricky',
        content: '待つ時間を「嫌な時間」から「有意義なマイクロ学習タイム」や「近所の隠れた名店クイズ」に変えられないかな？',
        perspectiveType: 'shift',
        createdAt: '2026-10-31 18:00',
        likes: [{ memberId: 'tatsu', timestamp: '2026-10-31 18:10' }]
      }
    ],
    chatMessages: [
      {
        id: 'm-1',
        senderType: 'member',
        senderId: 'tatsu',
        content: 'バス停のQRコードを読み込むと、次のバスが来るまでのジャスト3分間で完結するご当地クイズやミニゲームが始まるWebアプリはどうだろう？',
        createdAt: '2026-10-31 18:30',
        likes: [{ memberId: 'ricky', timestamp: '2026-10-31 18:35' }, { memberId: 'haru', timestamp: '2026-10-31 18:38' }]
      },
      {
        id: 'm-2',
        senderType: 'ai',
        content: '🤖 【AIフィードバック (SCAMPER法: 組み合わせ × 逆転)】\n素晴らしい着眼点です！「待ち時間＝退屈」を「待ち時間＝ちょっと楽しみな時間」に逆転させるアイデアですね。\n\n💡 さらに発展させる切り口：\n1. 【近隣店舗との連携】クイズ正解やミニゲームスコアに応じて、バス停周辺のベーカリーやカフェで使える50円引きクーポンがその場で発券される仕組みにすると、地域経済とも直結します。\n2. 【音声・ハンズフリー】雨の日は傘で手が塞がっているため、イヤホンで聴ける「3分間地域音声ポッドキャスト」も相性が良さそうです。',
        createdAt: '2026-10-31 18:31',
        likes: [{ memberId: 'tatsu', timestamp: '2026-10-31 18:40' }]
      }
    ]
  },
  {
    id: 'notice-3',
    title: '社内チャットで同じような質問が何度も繰り返される',
    description: '入社したばかりの新メンバーや他部署からの「申請書の場所どこですか？」「このツールの承認ルートは？」が週に何度も同じチャットに流れてきて、回答する側も探す側も消耗している。',
    category: 'オフィス・仕事',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    authorId: 'haru',
    createdAt: '2026-10-28 11:00',
    currentStep: 3,
    isClosedStep2: true,
    completedAt: '2026-10-29 15:30',
    likes: [
      { memberId: 'ricky', timestamp: '2026-10-28 11:20' },
      { memberId: 'tatsu', timestamp: '2026-10-28 11:25' },
      { memberId: 'chimata', timestamp: '2026-10-28 11:30' }
    ],
    comments: [
      {
        id: 'c-5',
        authorId: 'tatsu',
        content: 'マニュアルを探すこと自体が面倒なので、Slack/Teamsでメンションすると社内規定から即答してくれるコンシェルジュbotがあれば即解決しそう。',
        perspectiveType: 'shift',
        createdAt: '2026-10-28 12:00',
        likes: [{ memberId: 'haru', timestamp: '2026-10-28 12:15' }]
      }
    ],
    chatMessages: [],
    finalIdea: {
      title: '社内手続き即答コンシェルジュ「AskBot」',
      summary: '社内マニュアルや過去の問い合わせスレッドを自動学習し、新入社員の素朴な疑問にSlack上で3秒で優しく回答するAIコンシェルジュ。回答した先輩社員への「ありがとうバッジ」付与で社内カルチャーも活性化。',
      targetUser: '新入社員・異動直後のメンバー、および日常的に質問を受けるバックオフィス担当者',
      keyFeature: '自然言語での即時回答、社内ポータルの最新リンク自動添付、お礼ポイント制度',
      savedAt: '2026-10-29 15:30'
    }
  }
];
