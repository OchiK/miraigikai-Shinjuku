import type { Database } from "@mirai-gikai/supabase";
import { createBillContents } from "../main/bill-contents-data";
import type { SeededBillRef } from "../main/bill-ref";
import { councilSessions, createBillsTags, tags } from "../main/data";
import { R8_2_SESSION, toBillInserts } from "../main/shinjuku-r8-2-inventory";
import type { AdminClient } from "../shared/helper";
import {
  type DiffRow,
  type FieldSpec,
  type ImportReport,
  type TableDiff,
  type UserDataCount,
  diffTable,
  normalizeTimestamp,
} from "./diff";

type BillInsert = Database["public"]["Tables"]["bills"]["Insert"];
type BillContentInsert = Database["public"]["Tables"]["bill_contents"]["Insert"];
type BillsTagsInsert = Database["public"]["Tables"]["bills_tags"]["Insert"];
type CouncilSessionInsert =
  Database["public"]["Tables"]["council_sessions"]["Insert"];
type TagInsert = Database["public"]["Tables"]["tags"]["Insert"];

/** タグの自然キーは label。DBから読む前でも差分を組めるよう id と label を持つ */
type TagRef = { id: string; label: string };

/**
 * インポート対象の一次資料層データ。
 *
 * 既定値は本番インベントリだが、統合テストが名前空間を付けた複製を
 * 流し込めるように差し替え可能にしてある。
 */
export interface ImportDataset {
  councilSessions: CouncilSessionInsert[];
  /** 議案を紐づける会期の slug */
  billSessionSlug: string;
  tags: TagInsert[];
  bills: BillInsert[];
  createBillContents: (bills: SeededBillRef[]) => BillContentInsert[];
  createBillsTags: (bills: SeededBillRef[], tags: TagRef[]) => BillsTagsInsert[];
}

/** 本番に投入する一次資料層（リポジトリを唯一の正とみなす範囲） */
export const productionDataset: ImportDataset = {
  councilSessions,
  billSessionSlug: requireSlug(R8_2_SESSION),
  tags,
  bills: toBillInserts(),
  createBillContents,
  createBillsTags,
};

export interface ImportOptions {
  /** true なら DB へ書き込まず、差分の報告だけを返す */
  dryRun: boolean;
  /** 既定は本番インベントリ。統合テストのみ差し替える */
  dataset?: ImportDataset;
}

/** 各ステップが共有する実行文脈 */
interface ImportContext {
  supabase: AdminClient;
  dryRun: boolean;
  dataset: ImportDataset;
}

/**
 * 件数だけを確認する利用者データ層。
 *
 * インポーターはこれらの行を作成・更新・削除しない。
 * 本文や個人データを読み出さないよう、件数のみを取得する（`head: true`）。
 */
const USER_DATA_TABLES = [
  "interview_sessions",
  "interview_messages",
  "interview_report",
  "chats",
] as const;

/**
 * PostgREST の既定の返却上限。
 * 上限に達した読み出しは「DBに無い」と誤判定しかねないため、
 * 黙って進めずに停止する（現在は23議案・69変種で遠く及ばない）。
 */
const POSTGREST_MAX_ROWS = 1000;

const SESSION_FIELDS: FieldSpec[] = [
  { field: "name" },
  { field: "council_url" },
  { field: "start_date" },
  { field: "end_date" },
  { field: "is_active" },
];

const BILL_FIELDS: FieldSpec[] = [
  { field: "name" },
  { field: "bill_number" },
  { field: "status" },
  { field: "status_note" },
  { field: "publish_status" },
  { field: "published_at", normalize: normalizeTimestamp },
  { field: "is_featured" },
  { field: "is_review_completed" },
  { field: "thumbnail_url" },
  { field: "pdf_url" },
  { field: "overview_pdf_url" },
  { field: "source_page_url" },
  { field: "decision_source_url" },
];

const BILL_CONTENT_FIELDS: FieldSpec[] = [
  { field: "title" },
  { field: "summary" },
  { field: "content" },
];

const TAG_FIELDS: FieldSpec[] = [
  { field: "description" },
  { field: "featured_priority" },
];

/**
 * 自然キーによる非破壊 upsert で、一次資料層を最新インベントリに揃える。
 *
 * - 削除は一切行わない。インベントリから消えた行は報告に留める。
 * - bills は `slug` で突合するため、既存行の id が保たれる。
 *   id が変わると詳細ページのURLが 404 になり、interview_configs の
 *   CASCADE で利用者データまで失われる。
 * - interview_configs / interview_questions は Admin 側の運用対象なので触らない。
 */
export async function importInventory(
  supabase: AdminClient,
  options: ImportOptions
): Promise<ImportReport> {
  const context: ImportContext = {
    supabase,
    dryRun: options.dryRun,
    dataset: options.dataset ?? productionDataset,
  };

  const session = await syncCouncilSessions(context);
  const tagResult = await syncTags(context);
  const bill = await syncBills(context, session.billSessionId);
  const contents = await syncBillContents(context, bill);
  const billsTags = await syncBillsTags(context, bill, tagResult.tagRefs);

  return {
    dryRun: context.dryRun,
    tables: [
      session.diff,
      tagResult.diff,
      bill.diff,
      contents,
      billsTags,
    ],
    userData: await countUserData(supabase),
  };
}

// ---------------------------------------------------------------------------
// 会期
// ---------------------------------------------------------------------------

async function syncCouncilSessions(
  context: ImportContext
): Promise<{ diff: TableDiff; billSessionId: string | null }> {
  const { supabase, dryRun, dataset } = context;
  const desired = dataset.councilSessions;

  const current = await fetchCouncilSessions(supabase, desired.map(requireSlug));

  const diff = diffTable({
    table: "council_sessions",
    label: "会期",
    fields: SESSION_FIELDS,
    current: current.map((row) => toDiffRow(requireSlug(row), row)),
    desired: desired.map((row) => toDiffRow(requireSlug(row), row)),
  });

  // 議案を紐づける会期の id。dry-run で会期が未作成なら null のままになる。
  const existingId =
    current.find((row) => row.slug === dataset.billSessionSlug)?.id ?? null;

  if (dryRun) {
    return { diff, billSessionId: existingId };
  }

  const { data, error } = await supabase
    .from("council_sessions")
    .upsert(desired, { onConflict: "slug" })
    .select("id, slug");
  if (error) {
    throw new Error(`council_sessions の upsert に失敗: ${error.message}`);
  }

  const billSessionId =
    data?.find((row) => row.slug === dataset.billSessionSlug)?.id ?? null;
  if (!billSessionId) {
    throw new Error(
      `会期が見つからない: ${dataset.billSessionSlug}（議案を紐づけられない）`
    );
  }

  return { diff, billSessionId };
}

// ---------------------------------------------------------------------------
// タグ
// ---------------------------------------------------------------------------

async function syncTags(
  context: ImportContext
): Promise<{ diff: TableDiff; tagRefs: TagRef[] }> {
  const { supabase, dryRun, dataset } = context;
  const desired = dataset.tags;

  const current = await fetchTags(
    supabase,
    desired.map((tag) => tag.label)
  );

  const diff = diffTable({
    table: "tags",
    label: "タグ",
    fields: TAG_FIELDS,
    current: current.map((row) => toDiffRow(row.label, row)),
    desired: desired.map((row) => toDiffRow(row.label, row)),
    // 運用側で足したタグはインベントリの管理対象外なので報告しない。
    // 対象を label で絞って読んでいるため、そもそも current に入ってこない。
    reportExtraneous: false,
  });

  if (dryRun) {
    return {
      diff,
      tagRefs: current.map((tag) => ({ id: tag.id, label: tag.label })),
    };
  }

  const { data, error } = await supabase
    .from("tags")
    .upsert(desired, { onConflict: "label" })
    .select("id, label");
  if (error) {
    throw new Error(`tags の upsert に失敗: ${error.message}`);
  }

  return { diff, tagRefs: data ?? [] };
}

// ---------------------------------------------------------------------------
// 議案
// ---------------------------------------------------------------------------

interface BillSyncResult {
  diff: TableDiff;
  /** 投入後（dry-run では投入前）の議案参照 */
  billRefs: SeededBillRef[];
  /** 議案 id → slug。解説・タグ紐付の突合キーを組み立てるのに使う */
  slugById: Map<string, string>;
  /** インベントリに載っている議案の id */
  inventoryBillIds: string[];
}

async function syncBills(
  context: ImportContext,
  billSessionId: string | null
): Promise<BillSyncResult> {
  const { supabase, dryRun, dataset } = context;

  const desired = dataset.bills.map((bill) => ({
    ...bill,
    council_session_id: billSessionId,
  }));
  const desiredSlugs = desired.map(requireSlug);
  const current = await fetchBills(supabase, desiredSlugs, billSessionId);

  const diff = diffTable({
    table: "bills",
    label: "議案",
    fields: billFields(billSessionId),
    current: current.map((row) => toDiffRow(billKey(row), row)),
    desired: desired.map((row) => toDiffRow(requireSlug(row), row)),
    // 会期に紐づくがインベントリに無い議案は、削除せず報告する。
    // bills を消すと interview_configs が CASCADE で落ち、
    // その先のセッションとレポートまで失われる。
    reportExtraneous: true,
  });

  let billRefs: SeededBillRef[] = current
    .filter((bill) => bill.slug !== null)
    .map((bill) => ({ id: bill.id, name: bill.name, slug: bill.slug }));

  if (!dryRun) {
    const { data, error } = await supabase
      .from("bills")
      .upsert(desired, { onConflict: "slug" })
      .select("id, name, slug");
    if (error) {
      throw new Error(`bills の upsert に失敗: ${error.message}`);
    }
    billRefs = data ?? [];
  }

  const slugById = new Map(
    billRefs
      .filter((bill): bill is SeededBillRef & { slug: string } =>
        Boolean(bill.slug)
      )
      .map((bill) => [bill.id, bill.slug])
  );
  const inventoryBillIds = [...slugById.entries()]
    .filter(([, slug]) => desiredSlugs.includes(slug))
    .map(([id]) => id);

  return { diff, billRefs, slugById, inventoryBillIds };
}

// ---------------------------------------------------------------------------
// 解説
// ---------------------------------------------------------------------------

async function syncBillContents(
  context: ImportContext,
  bill: BillSyncResult
): Promise<TableDiff> {
  const { supabase, dryRun, dataset } = context;

  const desired = dataset.createBillContents(slugRefs(dataset));
  const current = await fetchBillContents(supabase, bill.inventoryBillIds);

  const diff = diffTable({
    table: "bill_contents",
    label: "解説",
    fields: BILL_CONTENT_FIELDS,
    current: current.map((row) =>
      toDiffRow(
        compositeKey(
          bill.slugById.get(row.bill_id) ?? row.bill_id,
          row.difficulty_level
        ),
        row
      )
    ),
    desired: desired.map((row) =>
      toDiffRow(compositeKey(row.bill_id, row.difficulty_level), row)
    ),
    // 難易度を減らしても余った変種は削除せず報告に留める
    reportExtraneous: true,
  });

  if (!dryRun) {
    const { error } = await supabase
      .from("bill_contents")
      .upsert(dataset.createBillContents(bill.billRefs), {
        onConflict: "bill_id,difficulty_level",
      });
    if (error) {
      throw new Error(`bill_contents の upsert に失敗: ${error.message}`);
    }
  }

  return diff;
}

// ---------------------------------------------------------------------------
// タグ紐付
// ---------------------------------------------------------------------------

async function syncBillsTags(
  context: ImportContext,
  bill: BillSyncResult,
  tagRefs: TagRef[]
): Promise<TableDiff> {
  const { supabase, dryRun, dataset } = context;

  const desired = dataset.createBillsTags(slugRefs(dataset), labelRefs(dataset));
  const current = await fetchBillsTags(supabase, bill.inventoryBillIds);

  const diff = diffTable({
    table: "bills_tags",
    label: "タグ紐付",
    // 紐付は存在の有無がすべてなので、比較するカラムは無い
    fields: [],
    current: current.map((row) =>
      toDiffRow(
        compositeKey(
          bill.slugById.get(row.bill_id) ?? row.bill_id,
          row.tags?.label ?? row.tag_id
        ),
        row
      )
    ),
    desired: desired.map((row) =>
      toDiffRow(compositeKey(row.bill_id, row.tag_id), row)
    ),
    // インベントリの議案に付いた分類はリポジトリが正とみなす範囲なので、
    // 運用側で足された紐付は削除せず報告する（tags 本体とは扱いが異なる）。
    reportExtraneous: true,
  });

  if (!dryRun) {
    const { error } = await supabase
      .from("bills_tags")
      .upsert(dataset.createBillsTags(bill.billRefs, tagRefs), {
        onConflict: "bill_id,tag_id",
      });
    if (error) {
      throw new Error(`bills_tags の upsert に失敗: ${error.message}`);
    }
  }

  return diff;
}

// ---------------------------------------------------------------------------
// 読み出し
// ---------------------------------------------------------------------------

async function fetchCouncilSessions(supabase: AdminClient, slugs: string[]) {
  if (slugs.length === 0) return [];
  const { data, error } = await supabase
    .from("council_sessions")
    .select("id, name, slug, council_url, start_date, end_date, is_active")
    .in("slug", slugs);
  if (error) {
    throw new Error(`council_sessions の取得に失敗: ${error.message}`);
  }
  return assertWithinRowLimit(data ?? [], "council_sessions");
}

async function fetchTags(supabase: AdminClient, labels: string[]) {
  if (labels.length === 0) return [];
  const { data, error } = await supabase
    .from("tags")
    .select("id, label, description, featured_priority")
    .in("label", labels);
  if (error) {
    throw new Error(`tags の取得に失敗: ${error.message}`);
  }
  return assertWithinRowLimit(data ?? [], "tags");
}

type BillRow = {
  id: string;
  name: string;
  slug: string | null;
  [key: string]: unknown;
};

const BILL_COLUMNS =
  "id, name, slug, bill_number, status, status_note, publish_status, published_at, is_featured, is_review_completed, thumbnail_url, pdf_url, overview_pdf_url, source_page_url, decision_source_url, council_session_id";

/**
 * インベントリの slug に一致する議案と、対象会期に紐づく議案の両方を読む。
 * 後者はインベントリ外の議案を検出するために必要で、削除には使わない。
 */
async function fetchBills(
  supabase: AdminClient,
  slugs: string[],
  sessionId: string | null
) {
  const byId = new Map<string, BillRow>();

  if (slugs.length > 0) {
    const { data, error } = await supabase
      .from("bills")
      .select(BILL_COLUMNS)
      .in("slug", slugs);
    if (error) {
      throw new Error(`bills の取得に失敗: ${error.message}`);
    }
    for (const row of assertWithinRowLimit(data ?? [], "bills")) {
      byId.set(row.id, row);
    }
  }

  if (sessionId) {
    const { data, error } = await supabase
      .from("bills")
      .select(BILL_COLUMNS)
      .eq("council_session_id", sessionId);
    if (error) {
      throw new Error(`会期に紐づく bills の取得に失敗: ${error.message}`);
    }
    for (const row of assertWithinRowLimit(data ?? [], "bills")) {
      byId.set(row.id, row);
    }
  }

  return [...byId.values()];
}

async function fetchBillContents(supabase: AdminClient, billIds: string[]) {
  if (billIds.length === 0) return [];
  const { data, error } = await supabase
    .from("bill_contents")
    .select("bill_id, difficulty_level, title, summary, content")
    .in("bill_id", billIds);
  if (error) {
    throw new Error(`bill_contents の取得に失敗: ${error.message}`);
  }
  return assertWithinRowLimit(data ?? [], "bill_contents");
}

async function fetchBillsTags(supabase: AdminClient, billIds: string[]) {
  if (billIds.length === 0) return [];
  const { data, error } = await supabase
    .from("bills_tags")
    .select("bill_id, tag_id, tags(label)")
    .in("bill_id", billIds);
  if (error) {
    throw new Error(`bills_tags の取得に失敗: ${error.message}`);
  }
  return assertWithinRowLimit(data ?? [], "bills_tags");
}

/**
 * 利用者データ層の件数だけを数える。
 * 本文・個人データは取得せず、行の作成・更新・削除も行わない。
 */
async function countUserData(supabase: AdminClient): Promise<UserDataCount[]> {
  const counts: UserDataCount[] = [];

  for (const table of USER_DATA_TABLES) {
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    if (error) {
      throw new Error(`${table} の件数取得に失敗: ${error.message}`);
    }
    counts.push({ table, count: count ?? 0 });
  }

  return counts;
}

/**
 * 返却上限に達した読み出しをそのまま差分計算へ渡さない。
 * 読み落とした行を「DBに無い＝新規」と報告してしまうため。
 */
function assertWithinRowLimit<T>(rows: T[], table: string): T[] {
  if (rows.length >= POSTGREST_MAX_ROWS) {
    throw new Error(
      `${table} の読み出しが返却上限（${POSTGREST_MAX_ROWS}件）に達した。差分が正しく出せないため、ページング処理を実装すること。`
    );
  }
  return rows;
}

// ---------------------------------------------------------------------------
// キーの組み立て
// ---------------------------------------------------------------------------

/**
 * id の代わりに slug を入れた議案参照。
 * DBへ書き込む前でも解説・タグ紐付の差分を slug ベースで組み立てられる。
 */
function slugRefs(dataset: ImportDataset): SeededBillRef[] {
  return dataset.bills.map((bill) => ({
    id: requireSlug(bill),
    name: bill.name,
    slug: requireSlug(bill),
  }));
}

/** 同じ理由で、id の代わりに label を入れたタグ参照 */
function labelRefs(dataset: ImportDataset): TagRef[] {
  return dataset.tags.map((tag) => ({ id: tag.label, label: tag.label }));
}

function toDiffRow(key: string, row: object): DiffRow {
  return { key, values: row as Record<string, unknown> };
}

/** slug を持たない議案も突合対象に含められるようにする */
function billKey(bill: { id: string; slug: string | null }): string {
  return bill.slug ?? `id:${bill.id}`;
}

function compositeKey(billKeyValue: string, childKey: string): string {
  return `${billKeyValue}::${childKey}`;
}

/**
 * 会期 id が確定しているときだけ council_session_id を比較する。
 * dry-run で会期が未作成の場合、比較すると既存の紐付けを
 * 「null に変わる」と誤って報告してしまう。
 */
function billFields(sessionId: string | null): FieldSpec[] {
  return sessionId
    ? [...BILL_FIELDS, { field: "council_session_id" }]
    : BILL_FIELDS;
}

function requireSlug(row: { slug?: string | null; name?: string }): string {
  if (!row.slug) {
    throw new Error(`slug が未設定: ${row.name ?? JSON.stringify(row)}`);
  }
  return row.slug;
}
