/**
 * モノグラムアバターに出す1文字。姓（氏名の最初の空白まで）の頭文字を返す。
 * 「木もと ひろゆき」→「木」、「のづ ケン」→「の」
 */
export function getAvatarInitial(name: string): string {
  const surname = name.trim().split(/[\s　]+/)[0] ?? "";
  return Array.from(surname)[0] ?? "";
}

export type AvatarTone = "terracotta" | "sage" | "neutral";

const AVATAR_TONES: AvatarTone[] = ["terracotta", "sage", "neutral"];

/**
 * アバターの地色を id から決める。同じ議員は常に同じ色になる。
 * 色は装飾で、会派や属性を表さない（会派ごとに色を振らない）。
 */
export function getAvatarTone(key: string): AvatarTone {
  let hash = 0;
  for (const char of key) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  }
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}
