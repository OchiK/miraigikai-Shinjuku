import { calculateSourceHash } from "@mirai-gikai/shared/i18n/source-hash";
import { diffFields, type TableDiff } from "./diff";

export type TranslationText = {
  title: string;
  summary: string;
  content: string;
};
export type TranslationPayload = TranslationText & {
  bill_slug: string;
  difficulty_level: string;
  locale: string;
  source_hash: string;
  source_snapshot: TranslationText;
  model: string | null;
  prompt_version: string | null;
};
export type CurrentTranslation = Omit<TranslationPayload, "source_snapshot"> & {
  source_snapshot: unknown;
  imported_snapshot: unknown;
  status: string;
};
export type TranslationKey = Pick<
  TranslationPayload,
  "bill_slug" | "difficulty_level" | "locale"
>;
export type TranslationWrites = {
  created: TranslationKey[];
  updated: TranslationKey[];
};

export function translationKey(row: TranslationKey): string {
  return `${row.bill_slug}::${row.difficulty_level}::${row.locale}`;
}
export function translationText(row: TranslationText): TranslationText {
  return { title: row.title, summary: row.summary, content: row.content };
}
// JSONB objects compare by value, independently of property order.
function equal(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  return (
    Object.keys(left).length === Object.keys(right).length &&
    Object.keys(left).every(
      (key) => Object.hasOwn(right, key) && equal(left[key], right[key])
    )
  );
}

/** Validate against the Japanese inventory that the transaction will write. */
export function validateTranslations(
  desired: TranslationPayload[],
  billSlugs: readonly string[],
  sources: (TranslationText & { bill_slug: string; difficulty_level: string })[]
): void {
  const seen = new Set<string>();
  for (const row of desired) {
    const key = translationKey(row);
    if (seen.has(key)) throw new Error(`翻訳キー重複: ${key}`);
    seen.add(key);
    const source = sources.find(
      (source) =>
        source.bill_slug === row.bill_slug &&
        source.difficulty_level === row.difficulty_level
    );
    if (!billSlugs.includes(row.bill_slug) || !source)
      throw new Error(`翻訳元が存在しない: ${key}`);
    if (row.locale !== "en" || row.difficulty_level !== "normal")
      throw new Error(`翻訳は en/normal のみ: ${key}`);
    if (
      [row.title, row.summary, row.content].some(
        (value) => typeof value !== "string" || !value.trim()
      )
    )
      throw new Error(`翻訳本文が空: ${key}`);
    if (
      !/^v[0-9]+:[0-9a-f]{64}$/.test(row.source_hash) ||
      row.source_hash !==
        calculateSourceHash({ ...source, difficulty_level: "normal" })
    )
      throw new Error(`翻訳 source_hash 不一致: ${key}`);
    if (!equal(row.source_snapshot, translationText(source)))
      throw new Error(`翻訳 source_snapshot 不一致: ${key}`);
  }
}

/** Ordered state table shared by dry-run and the apply prediction. SQL owns writes. */
export function classifyTranslations(
  current: CurrentTranslation[],
  desired: TranslationPayload[]
): TableDiff {
  const result: TableDiff = {
    table: "bill_content_translations",
    label: "英訳",
    created: [],
    updated: [],
    unchanged: [],
    extraneous: [],
    protected: [],
  };
  const rows = new Map(
    current
      .filter((row) => row.locale === "en")
      .map((row) => [translationKey(row), row])
  );
  const keys = new Set(desired.map(translationKey));
  for (const row of desired) {
    const key = translationKey(row);
    const existing = rows.get(key);
    if (!existing) {
      result.created.push(key);
      continue;
    }
    const sameText = equal(translationText(existing), translationText(row));
    const sameSource = existing.source_hash === row.source_hash;
    const protect = (reason: string) => result.protected.push({ key, reason });
    if (existing.status === "reviewed") {
      if (sameText && sameSource) result.unchanged.push(key);
      else
        protect(
          !sameSource
            ? "承認済み・日本語が変わったため再確認が必要"
            : "承認済み・Git の訳文と異なる"
        );
    } else if (!equal(existing.imported_snapshot, translationText(existing))) {
      if (sameText && sameSource) result.unchanged.push(key);
      else protect("Admin で編集または作成された");
    } else {
      const fields = [
        "title",
        "summary",
        "content",
        "source_hash",
        "source_snapshot",
        "model",
        "prompt_version",
      ] as const;
      const changes = diffFields(
        existing,
        row,
        fields.map((field) => ({
          field,
          normalize: (value: unknown) =>
            field === "source_snapshot"
              ? equal(value, row.source_snapshot)
              : value,
        }))
      );
      if (changes.length) result.updated.push({ key, changes });
      else result.unchanged.push(key);
    }
  }
  result.extraneous = [...rows.keys()].filter((key) => !keys.has(key));
  return result;
}

/** Replace predicted writes with authoritative RPC outcomes, including Admin races. */
export function reconcileTranslationWrites(
  predicted: TableDiff,
  written: TranslationWrites
): TableDiff {
  const created = written.created.map(translationKey);
  const updatedKeys = written.updated.map(translationKey);
  const actual = new Set([...created, ...updatedKeys]);
  const skipped = [
    ...predicted.created,
    ...predicted.updated.map((row) => row.key),
  ].filter((key) => !actual.has(key));
  return {
    ...predicted,
    created,
    updated: updatedKeys.map(
      (key) =>
        predicted.updated.find((row) => row.key === key) ?? { key, changes: [] }
    ),
    unchanged: predicted.unchanged.filter((key) => !actual.has(key)),
    protected: [
      ...predicted.protected.filter((row) => !actual.has(row.key)),
      ...skipped.map((key) => ({
        key,
        reason: "反映の直前に変わったため適用しなかった",
      })),
    ],
  };
}
