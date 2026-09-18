export type CouncilSessionResolution = {
  sessionId: string | null;
  matchCount: number;
  errorMessage: string | null;
};

export function getCouncilSessionResolutionError(
  resolution: CouncilSessionResolution
): string | null {
  if (resolution.sessionId) return null;
  if (resolution.errorMessage) {
    return `会期の確認に失敗しました: ${resolution.errorMessage}`;
  }
  return resolution.matchCount === 0
    ? "対応する会期が見つかりません"
    : "対応する会期が複数見つかりました";
}
