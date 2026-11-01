import { NoticeThread } from '../types';

// 日本語のストップワード（分析から除外する助詞・一般的な記号等）
const STOP_WORDS = new Set([
  'の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ',
  'ある', 'いる', 'も', 'する', 'から', 'な', 'こと', 'として', 'い', 'や',
  'れる', 'など', 'なっ', 'ない', 'この', 'ため', 'その', 'あっ', 'よう', 'また',
  'もの', 'という', 'あり', 'これ', 'それ', 'あれ', 'でき', 'てる', 'だっ', 'なり',
  'です', 'ます', 'ので', 'けど', 'なら', 'でも', 'どう', 'かな', 'かも', 'そう',
  'http', 'https', 'com', 'org', 'jp', 'jpg', 'png', 'gif', 'svg'
]);

// 重要キーワード辞書（ハッカソンや地域課題、アイデア発想で注目すべき単語）
const DOMAIN_TERMS = [
  '商店街', '空き店舗', 'シャッター', '駅前', '通勤', 'バス停', '待ち時間', '遅延',
  '地域', 'コミュニティ', '子ども', '学生', 'シニア', '高齢者', '自習', '学び場',
  '夜カフェ', 'スキル交換', 'スマートロッカー', 'クイズ', 'ミニゲーム', 'クーポン',
  '申請書', '社内', 'チャット', 'マニュアル', '新入社員', 'コンシェルジュ', 'AI',
  '質問', '違和感', 'ストレス', '解決', 'アイデア', 'シェア', '視点', '転換',
  'ブラッシュアップ', '気づき', '生活', '日常', '仕事', '業務', '活性化', '雨の日',
  '時間', '場所', '仕組み', 'アプリ', '参加', '店舗', 'テナント', '案内', '情報'
];

export interface WordFrequency {
  text: string;
  count: number;
  category?: string;
  weight: number; // 0.0 - 1.0 (正規化された重み)
}

export interface CoOccurrenceLink {
  source: string;
  target: string;
  value: number; // 共起回数
}

export interface MiningResult {
  totalChars: number;
  totalWords: number;
  wordFrequencies: WordFrequency[];
  coOccurrences: CoOccurrenceLink[];
  categoryBreakdown: { name: string; count: number }[];
  memberStats: { memberName: string; postCount: number; commentCount: number; likeCount: number }[];
}

/**
 * 簡易日本語テキストマイニング・トークナイザー
 */
export function analyzeThreads(threads: NoticeThread[]): MiningResult {
  let combinedText = '';
  const categoryCounts: Record<string, number> = {};
  const wordCounts: Record<string, number> = {};
  const coPairs: Record<string, number> = {};

  // カテゴリ初期化
  threads.forEach(t => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  // 全テキストの収集とスレッドごとの単語抽出
  threads.forEach(thread => {
    const threadFullText = [
      thread.title,
      thread.description,
      ...thread.comments.map(c => c.content),
      ...thread.chatMessages.map(m => m.content),
      thread.finalIdea?.title || '',
      thread.finalIdea?.summary || '',
      thread.finalIdea?.keyFeature || ''
    ].join(' ');

    combinedText += ' ' + threadFullText;

    // 単語抽出
    const extractedWords = extractWords(threadFullText);
    const uniqueInThread = Array.from(new Set(extractedWords));

    // 単語カウント
    extractedWords.forEach(w => {
      wordCounts[w] = (wordCounts[w] || 0) + 1;
    });

    // 共起ペアカウント（同一スレッド内で一緒に登場した単語ペア）
    for (let i = 0; i < uniqueInThread.length; i++) {
      for (let j = i + 1; j < uniqueInThread.length; j++) {
        const w1 = uniqueInThread[i];
        const w2 = uniqueInThread[j];
        if (w1 !== w2) {
          const pairKey = [w1, w2].sort().join(':::');
          coPairs[pairKey] = (coPairs[pairKey] || 0) + 1;
        }
      }
    }
  });

  // 単語頻度リストの作成（上位50件）
  const sortedWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .filter(([word]) => word.length >= 2 && !STOP_WORDS.has(word));

  const maxCount = sortedWords.length > 0 ? sortedWords[0][1] : 1;

  const wordFrequencies: WordFrequency[] = sortedWords.slice(0, 40).map(([text, count]) => ({
    text,
    count,
    weight: Math.min(1, Math.max(0.2, count / maxCount))
  }));

  // 共起リンク（上位25件）
  const coOccurrences: CoOccurrenceLink[] = Object.entries(coPairs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([pair, value]) => {
      const [source, target] = pair.split(':::');
      return { source, target, value };
    });

  // カテゴリ集計
  const categoryBreakdown = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count
  }));

  // メンバー別集計
  const memberStats = [
    { id: 'ricky', name: 'Ricky' },
    { id: 'haru', name: 'h-a-r-u' },
    { id: 'tatsu', name: 'tatsu' },
    { id: 'chimata', name: '千股弘旗' }
  ].map(m => {
    const postCount = threads.filter(t => t.authorId === m.id).length;
    let commentCount = 0;
    let likeCount = 0;
    threads.forEach(t => {
      commentCount += t.comments.filter(c => c.authorId === m.id).length;
      likeCount += t.likes.filter(l => l.memberId === m.id).length;
      t.comments.forEach(c => {
        likeCount += c.likes.filter(l => l.memberId === m.id).length;
      });
    });
    return {
      memberName: m.name,
      postCount,
      commentCount,
      likeCount
    };
  });

  return {
    totalChars: combinedText.length,
    totalWords: Object.values(wordCounts).reduce((a, b) => a + b, 0),
    wordFrequencies,
    coOccurrences,
    categoryBreakdown,
    memberStats
  };
}

/**
 * 日本語テキストから有意な名詞・専門用語を抽出する正規表現ベースのトークナイザー
 */
function extractWords(text: string): string[] {
  const result: string[] = [];

  // ドメイン重要単語の直接マッチ
  DOMAIN_TERMS.forEach(term => {
    const matches = text.match(new RegExp(term, 'g'));
    if (matches) {
      matches.forEach(() => result.push(term));
    }
  });

  // 漢字の連続（2〜6文字の熟語）
  const kanjiMatches = text.match(/[\u4e00-\u9faf]{2,6}/g);
  if (kanjiMatches) {
    kanjiMatches.forEach(w => {
      if (!STOP_WORDS.has(w)) result.push(w);
    });
  }

  // カタカナの連続（2〜8文字の外来語）
  const katakanaMatches = text.match(/[\u30a1-\u30f6]{2,8}/g);
  if (katakanaMatches) {
    katakanaMatches.forEach(w => {
      if (!STOP_WORDS.has(w)) result.push(w);
    });
  }

  // アルファベット単語（AI, QR, Webなど）
  const alphaMatches = text.match(/[A-Za-z0-9]{2,10}/g);
  if (alphaMatches) {
    alphaMatches.forEach(w => {
      if (!STOP_WORDS.has(w.toLowerCase())) result.push(w);
    });
  }

  return result;
}
