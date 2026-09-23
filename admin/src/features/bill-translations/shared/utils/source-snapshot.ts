import type { TranslationSource } from "@mirai-gikai/shared/i18n/source-hash";

/** source_hash を記録した時点の日本語（bill_content_translations.source_snapshot） */
export type SourceSnapshot = {
  title: string;
  summary: string;
  content: string;
};

export function toSourceSnapshot(source: SourceSnapshot): SourceSnapshot {
  return {
    title: source.title,
    summary: source.summary,
    content: source.content,
  };
}

/** DB の jsonb を SourceSnapshot として読む。形が違えば null */
export function parseSourceSnapshot(value: unknown): SourceSnapshot | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const { title, summary, content } = value as Record<string, unknown>;
  if (
    typeof title !== "string" ||
    typeof summary !== "string" ||
    typeof content !== "string"
  ) {
    return null;
  }
  return { title, summary, content };
}

/**
 * スナップショットが source_hash の元になった日本語そのものかを確かめてから返す。
 * 一致しないスナップショットで差分を出すと、実際の改定と違う箇所を示してしまうため、
 * その場合は null（差分を出さない）にする。
 */
export function verifySourceSnapshot(params: {
  snapshot: unknown;
  difficultyLevel: string;
  sourceHash: string;
  hashSource: (source: TranslationSource) => string;
}): SourceSnapshot | null {
  const snapshot = parseSourceSnapshot(params.snapshot);
  if (!snapshot) return null;
  const hash = params.hashSource({
    difficulty_level: params.difficultyLevel,
    ...snapshot,
  });
  return hash === params.sourceHash ? snapshot : null;
}
