import { NoticeThread, Member } from '../types';

/**
 * 全投稿テキストをTXT形式でダウンロード
 */
export function exportToTxt(threads: NoticeThread[], members: Member[]): void {
  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || id;

  let content = '====================================================\n';
  content += '   IDEA GYM - アイデア発想トレーニングアプリ 投稿データ\n';
  content += `   出力日時: ${new Date().toLocaleString('ja-JP')}\n`;
  content += `   総スレッド数: ${threads.length} 件\n`;
  content += '====================================================\n\n';

  threads.forEach((thread, index) => {
    content += `【スレッド #${index + 1}】 ${thread.title}\n`;
    content += `カテゴリ: ${thread.category} | 投稿者: ${getMemberName(thread.authorId)} | 投稿日時: ${thread.createdAt}\n`;
    content += `進捗ステップ: ステップ${thread.currentStep} ${thread.completedAt ? '(アイデアバンク保存済)' : ''}\n`;
    content += `いいね確認者: ${thread.likes.map(l => getMemberName(l.memberId)).join(', ') || 'なし'}\n`;
    content += `----------------------------------------------------\n`;
    content += `[気づき・違和感の詳細]\n${thread.description}\n\n`;

    if (thread.comments.length > 0) {
      content += `[ステップ2: 視点転換コメント (${thread.comments.length}件)]\n`;
      thread.comments.forEach((c, cIdx) => {
        content += `  (${cIdx + 1}) ${getMemberName(c.authorId)} [${c.createdAt}]\n`;
        content += `      ${c.content}\n`;
        content += `      いいね: ${c.likes.map(l => getMemberName(l.memberId)).join(', ') || 'なし'}\n\n`;
      });
    }

    if (thread.chatMessages.length > 0) {
      content += `[ステップ3: ブラッシュアップ・チャット (${thread.chatMessages.length}件)]\n`;
      thread.chatMessages.forEach((msg, mIdx) => {
        const sender = msg.senderType === 'ai' ? '🤖 AIアシスタント' : getMemberName(msg.senderId || '');
        content += `  (${mIdx + 1}) ${sender} [${msg.createdAt}]\n`;
        content += `      ${msg.content}\n\n`;
      });
    }

    if (thread.finalIdea) {
      content += `[★アイデアバンク保存内容]\n`;
      content += `  アイデア名: ${thread.finalIdea.title}\n`;
      content += `  概要: ${thread.finalIdea.summary}\n`;
      content += `  ターゲット: ${thread.finalIdea.targetUser}\n`;
      content += `  コア機能: ${thread.finalIdea.keyFeature}\n`;
      content += `  保存日時: ${thread.finalIdea.savedAt}\n`;
    }

    content += '\n====================================================\n\n';
  });

  downloadBlob(content, `idea_gym_all_posts_${getTimestampStr()}.txt`, 'text/plain;charset=utf-8;');
}

/**
 * 全データを構造化JSON形式でダウンロード
 */
export function exportToJson(threads: NoticeThread[]): void {
  const jsonStr = JSON.stringify(threads, null, 2);
  downloadBlob(jsonStr, `idea_gym_export_${getTimestampStr()}.json`, 'application/json;charset=utf-8;');
}

/**
 * 全投稿・コメントをフラットなCSV形式でダウンロード
 */
export function exportToCsv(threads: NoticeThread[], members: Member[]): void {
  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || id;

  const headers = ['スレッドID', 'タイトル', 'カテゴリ', 'ステップ', '投稿タイプ', '発言者', '本文', '投稿日時', 'いいね数', 'いいねメンバー'];
  const rows: string[][] = [];

  threads.forEach(thread => {
    // スレッド本体
    rows.push([
      thread.id,
      escapeCsv(thread.title),
      escapeCsv(thread.category),
      `ステップ${thread.currentStep}`,
      '気づき投稿',
      escapeCsv(getMemberName(thread.authorId)),
      escapeCsv(thread.description),
      thread.createdAt,
      thread.likes.length.toString(),
      escapeCsv(thread.likes.map(l => getMemberName(l.memberId)).join('; '))
    ]);

    // コメント
    thread.comments.forEach(c => {
      rows.push([
        thread.id,
        escapeCsv(thread.title),
        escapeCsv(thread.category),
        'ステップ2',
        '視点転換コメント',
        escapeCsv(getMemberName(c.authorId)),
        escapeCsv(c.content),
        c.createdAt,
        c.likes.length.toString(),
        escapeCsv(c.likes.map(l => getMemberName(l.memberId)).join('; '))
      ]);
    });

    // チャット
    thread.chatMessages.forEach(m => {
      rows.push([
        thread.id,
        escapeCsv(thread.title),
        escapeCsv(thread.category),
        'ステップ3',
        m.senderType === 'ai' ? 'AIフィードバック' : 'チャット',
        escapeCsv(m.senderType === 'ai' ? 'AIアシスタント' : getMemberName(m.senderId || '')),
        escapeCsv(m.content),
        m.createdAt,
        m.likes.length.toString(),
        escapeCsv(m.likes.map(l => getMemberName(l.memberId)).join('; '))
      ]);
    });
  });

  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n');

  downloadBlob(csvContent, `idea_gym_data_${getTimestampStr()}.csv`, 'text/csv;charset=utf-8;');
}

function escapeCsv(str: string): string {
  if (!str) return '""';
  const clean = str.replace(/"/g, '""').replace(/\r?\n/g, ' ');
  return `"${clean}"`;
}

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getTimestampStr(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10).replace(/-/g, '') + '_' +
    now.toTimeString().slice(0, 8).replace(/:/g, '');
}
