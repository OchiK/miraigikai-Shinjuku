// node:crypto を使うため Server / Node 専用。Client Component から値として import しないこと
import { createHash } from "node:crypto";

/**
 * 翻訳元（日本語の bill_contents 1行）のハッシュ。
 *
 * 翻訳を保存するときにこの値を source_hash に記録し、読み出すたびに現在の
 * 日本語から計算し直して照合する。一致しなければ、status が何であっても
 * その翻訳は出さない（更新ジョブの漏れで古い翻訳が出るのを防ぐ）。
 *
 * 正規化の規則を変えたら SOURCE_HASH_VERSION を上げること。
 * 既存の翻訳はすべて不一致（=要再翻訳）になる。
 */
export const SOURCE_HASH_VERSION = "v1";

export type TranslationSource = {
  difficulty_level: string;
  title: string;
  summary: string;
  content: string;
};

/**
 * 表記だけの揺れでハッシュが変わらないようにする。
 * - Unicode NFC（全角・半角や句読点は変えない。意味が変わりうるため）
 * - 改行を LF に統一
 * - 各行末の空白を削除
 * - 先頭・末尾の空行を削除
 */
export function normalizeSourceText(text: string): string {
  return text
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t　]+$/u, ""))
    .join("\n")
    .trim();
}

export function calculateSourceHash(source: TranslationSource): string {
  // 各フィールドを JSON 配列にしてから連結し、区切り文字の衝突を避ける
  const payload = JSON.stringify([
    SOURCE_HASH_VERSION,
    source.difficulty_level,
    normalizeSourceText(source.title),
    normalizeSourceText(source.summary),
    normalizeSourceText(source.content),
  ]);
  const digest = createHash("sha256").update(payload, "utf8").digest("hex");
  return `${SOURCE_HASH_VERSION}:${digest}`;
}

export function isTranslationStale(
  storedHash: string,
  currentSource: TranslationSource
): boolean {
  return storedHash !== calculateSourceHash(currentSource);
}
