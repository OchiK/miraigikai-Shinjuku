/**
 * 議員一覧（委員会別表示）の委員会セクションに付けるアンカーID。
 * 初期表示は会派別なので、ページ内の移動にだけ使い、外部リンクの着地先にはしない。
 */
export function getCommitteeAnchorId(committeeId: string): string {
  return `committee-${committeeId}`;
}
