import type { TranslationReviewStatus } from "../types/bill-translation";

/**
 * 画面に出す状態を決める。日本語が変わっていれば、DB の status が reviewed でも
 * stale として扱う（公開画面も source_hash の不一致で出さないため）。
 */
export function getTranslationReviewStatus(
  translation: { status: string; isStale: boolean } | undefined
): TranslationReviewStatus {
  if (!translation) return "missing";
  if (translation.isStale || translation.status === "stale") return "stale";
  if (translation.status === "reviewed") return "reviewed";
  return "generated";
}

/**
 * 保存済みの翻訳が、現在の日本語に対して古くなっているか。
 * DB の status が stale のものと、source_hash が現在の日本語と一致しないものを stale とする。
 * 翻訳がまだない場合は stale ではない。
 */
export function isStoredTranslationStale(
  translation: { status: string; source_hash: string } | null,
  currentSourceHash: string
): boolean {
  if (!translation) return false;
  return (
    translation.status === "stale" ||
    translation.source_hash !== currentSourceHash
  );
}

export type TranslationWriteIntent = "draft" | "approve";

/**
 * stale の翻訳を承認するには、原文の変更を反映したという明示（confirmStale）が要る。
 * これがないと、古い日本語から訳した翻訳がそのまま公開されてしまう。
 */
export function requiresStaleConfirmation(params: {
  intent: TranslationWriteIntent;
  isStale: boolean;
  confirmStale: boolean;
}): boolean {
  return params.intent === "approve" && params.isStale && !params.confirmStale;
}

export type TranslationStatusFields = {
  status: "generated" | "reviewed" | "stale";
  source_hash: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

/**
 * 保存時に書く status / source_hash / 承認情報を決める。
 *
 * - draft: 非公開の下書きにする。source_hash は「どの日本語から訳したか」の記録なので
 *   既存の値を残す（stale の翻訳を下書き保存しても stale のまま）。新規なら現在の日本語。
 * - approve: 現在の日本語に対して確認済みにする。source_hash を現在の値に更新するので、
 *   stale の翻訳を承認する前に呼び出し側で確認を取ること。
 */
export function buildTranslationStatusFields(params: {
  intent: TranslationWriteIntent;
  existing: { status: string; source_hash: string } | null;
  currentSourceHash: string;
  reviewer: string;
  now: Date;
}): TranslationStatusFields {
  const { intent, existing, currentSourceHash, reviewer, now } = params;

  if (intent === "approve") {
    return {
      status: "reviewed",
      source_hash: currentSourceHash,
      reviewed_at: now.toISOString(),
      reviewed_by: reviewer,
    };
  }

  return {
    status: existing?.status === "stale" ? "stale" : "generated",
    source_hash: existing?.source_hash ?? currentSourceHash,
    reviewed_at: null,
    reviewed_by: null,
  };
}

/** 承認を取り消して下書きに戻す。本文と source_hash は変えない */
export function buildRevokeStatusFields(): Omit<
  TranslationStatusFields,
  "source_hash"
> {
  return { status: "generated", reviewed_at: null, reviewed_by: null };
}

/** 画面表示用に source_hash を縮める（v1:0123abcd…） */
export function shortenSourceHash(hash: string, length = 12): string {
  const [version, digest] = hash.split(":");
  if (!digest) return hash;
  return `${version}:${digest.slice(0, length)}…`;
}
