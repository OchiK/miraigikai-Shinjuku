import type { Database } from "@mirai-gikai/supabase";
import { createBillContents } from "../main/bill-contents-data";
import type { SeededBillRef } from "../main/bill-ref";
import {
  committees,
  councilSessions,
  billSessionSlugByBillSlug,
  bills,
  createBillsTags,
  factions,
  tags,
} from "../main/data";
import {
  COUNCIL_ROSTER_URL,
  councilMembers,
  type SeedCouncilMember,
} from "../main/shinjuku-council-members";
import {
  type CouncilMemberQuestionImportRow,
  councilMemberQuestions,
  findUnknownQuestionSessionSlugs,
  toCouncilMemberQuestionImportRows,
} from "../main/shinjuku-council-questions";
import {
  type FactionStanceImportRow,
  R8_1_VOTE_COLUMNS,
  r8_1BillVotes,
  R8_2_VOTE_COLUMNS,
  r8_2BillVotes,
  R8_3_VOTE_COLUMNS,
  r8_3BillVotes,
  toFactionStanceImportRows,
} from "../main/shinjuku-faction-stances";
import type { AdminClient } from "../shared/helper";
import {
  type DiffRow,
  type FieldSpec,
  type ImportReport,
  type TableDiff,
  diffTable,
  hasChanges,
  normalizeArray,
  normalizeTimestamp,
} from "./diff";
import { chunkValues, paginate } from "./paginate";

type BillInsert = Database["public"]["Tables"]["bills"]["Insert"];
type BillContentInsert = Database["public"]["Tables"]["bill_contents"]["Insert"];
type BillsTagsInsert = Database["public"]["Tables"]["bills_tags"]["Insert"];
type CouncilSessionInsert =
  Database["public"]["Tables"]["council_sessions"]["Insert"];
type CommitteeInsert = Database["public"]["Tables"]["committees"]["Insert"];
type FactionInsert = Database["public"]["Tables"]["factions"]["Insert"];
type TagInsert = Database["public"]["Tables"]["tags"]["Insert"];

/** タグの自然キーは label。DBから読む前でも差分を組めるよう id と label を持つ */
type TagRef = { id: string; label: string };

const SHINJUKU_COUNCIL_ROSTER_KEY = "shinjuku-city-council";

/**
 * インポート対象の一次資料層データ。
 *
 * 既定値は本番インベントリだが、統合テストが名前空間を付けた複製を
 * 流し込めるように差し替え可能にしてある。
 */
export interface ImportDataset {
  councilSessions: CouncilSessionInsert[];
  /** 会期指定が無い議案を紐づける既定の会期 slug（後方互換用） */
  billSessionSlug: string;
  /** 議案 slug ごとの所属会期。複数会期を一度に同期するときに使う */
  billSessionSlugByBillSlug?: Readonly<Record<string, string>>;
  tags: TagInsert[];
  factions: FactionInsert[];
  committees: CommitteeInsert[];
  /** 自治体単位で名簿の管理範囲を固定する（出典URLが変わっても変えない） */
  councilRosterKey: string;
  /** 議員情報の出典として表示する公式名簿URL */
  councilRosterUrl: string;
  councilMembers: SeedCouncilMember[];
  /** 議員の質問要約。議員は名簿の氏名、会期は slug の自然キーで表す */
  councilMemberQuestions: CouncilMemberQuestionImportRow[];
  /** 会派の賛否。議案は slug、会派は name の自然キーで表す */
  factionStances: FactionStanceImportRow[];
  bills: BillInsert[];
  createBillContents: (bills: SeededBillRef[]) => BillContentInsert[];
  createBillsTags: (bills: SeededBillRef[], tags: TagRef[]) => BillsTagsInsert[];
}

/** 本番に投入する一次資料層（リポジトリを唯一の正とみなす範囲） */
export const productionDataset: ImportDataset = {
  councilSessions,
  billSessionSlug: "r8-2",
  billSessionSlugByBillSlug,
  tags,
  factions,
  committees,
  councilRosterKey: SHINJUKU_COUNCIL_ROSTER_KEY,
  councilRosterUrl: COUNCIL_ROSTER_URL,
  councilMembers,
  councilMemberQuestions: toCouncilMemberQuestionImportRows(
    councilMemberQuestions,
    councilMembers
  ),
  factionStances: [
    ...toFactionStanceImportRows(r8_1BillVotes, factions, R8_1_VOTE_COLUMNS),
    ...toFactionStanceImportRows(r8_2BillVotes, factions, R8_2_VOTE_COLUMNS),
    ...toFactionStanceImportRows(r8_3BillVotes, factions, R8_3_VOTE_COLUMNS),
  ],
  bills,
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
  dataset: ImportDataset;
}

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
  // is_featured は管理画面で切り替える運用値。新規作成時だけインベントリの値を入れ、
  // 既存の議案では比較も上書きもしない（import_production_inventory と揃える）
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

const FACTION_FIELDS: FieldSpec[] = [
  { field: "display_name" },
  { field: "alternative_names", normalize: normalizeArray },
  { field: "logo_url" },
  { field: "sort_order" },
  { field: "is_active" },
];

const COMMITTEE_FIELDS: FieldSpec[] = [
  { field: "description" },
  { field: "sort_order" },
  { field: "is_active" },
];

const COUNCIL_MEMBER_FIELDS: FieldSpec[] = [
  { field: "name_kana" },
  { field: "faction_name" },
  { field: "faction_role" },
  { field: "official_url" },
  { field: "website_url" },
  { field: "x_url" },
  { field: "terms" },
  { field: "sort_order" },
  { field: "is_active" },
];

const COUNCIL_MEMBER_COMMITTEE_FIELDS: FieldSpec[] = [{ field: "role" }];

const COUNCIL_MEMBER_QUESTION_FIELDS: FieldSpec[] = [
  { field: "session_slug" },
  { field: "session_name" },
  { field: "venue_type" },
  { field: "question_kind" },
  { field: "title" },
  { field: "summary" },
  { field: "topic_tags", normalize: normalizeArray },
  { field: "speech_date" },
];

// comment は管理画面の AI 収集が持つ値なので比較も上書きもしない（RPC と揃える）
const FACTION_STANCE_FIELDS: FieldSpec[] = [
  { field: "type" },
  { field: "faction_name_at_vote" },
];

/**
 * 自然キーによる非破壊 upsert で、一次資料層を最新インベントリに揃える。
 *
 * - 一次資料・利用者データの行は削除しない。名簿から外れた議員は非現職にし、
 *   現行状態を表す委員会所属だけを名簿に合わせて置き換える。
 * - bills は `slug` で突合するため、既存行の id が保たれる。
 *   id が変わると詳細ページのURLが 404 になり、interview_configs の
 *   CASCADE で利用者データまで失われる。
 * - 議員の質問要約は（議員の氏名・出典URL）で突合して upsert する。
 *   インベントリから外れた質問は削除せず、インベントリ外として報告する。
 * - 会派の賛否は（議案 slug・会派名）で突合して upsert する。comment は触らず、
 *   インベントリ外の賛否は削除せず報告する。
 * - interview_configs / interview_questions は Admin 側の運用対象なので触らない。
 */
export async function importInventory(
  supabase: AdminClient,
  options: ImportOptions
): Promise<ImportReport> {
  const context: ImportContext = {
    supabase,
    dataset: options.dataset ?? productionDataset,
  };

  const session = await syncCouncilSessions(context);
  const tagsDiff = await syncTags(context);
  const factionsDiff = await syncFactions(context);
  const committeesDiff = await syncCommittees(context);
  const councilMembersDiff = await syncCouncilMembers(context);
  const councilMemberCommitteesDiff = await syncCouncilMemberCommittees(context);
  const councilMemberQuestionsDiff = await syncCouncilMemberQuestions(context);
  const bill = await syncBills(context, session.sessionIdBySlug);
  const contents = await syncBillContents(context, bill);
  const billsTags = await syncBillsTags(context, bill);
  const factionStances = await syncFactionStances(context, bill);

  const report: ImportReport = {
    dryRun: options.dryRun,
    tables: [
      session.diff,
      tagsDiff,
      factionsDiff,
      committeesDiff,
      councilMembersDiff,
      councilMemberCommitteesDiff,
      councilMemberQuestionsDiff,
      bill.diff,
      contents,
      billsTags,
      factionStances,
    ],
  };

  if (!options.dryRun && hasChanges(report)) {
    await applyInventoryTransaction(supabase, context.dataset);
  }

  return report;
}

// ---------------------------------------------------------------------------
// 会派・委員会・議員
// ---------------------------------------------------------------------------

async function syncFactions(context: ImportContext): Promise<TableDiff> {
  const { supabase, dataset } = context;
  const desired = dataset.factions;
  const current = await fetchFactions(
    supabase,
    desired.map((faction) => faction.name)
  );

  return diffTable({
    table: "factions",
    label: "会派",
    fields: FACTION_FIELDS,
    current: current.map((row) => toDiffRow(row.name, row)),
    desired: desired.map((row) => toDiffRow(row.name, row)),
    reportExtraneous: false,
  });
}

async function syncCommittees(context: ImportContext): Promise<TableDiff> {
  const { supabase, dataset } = context;
  const desired = dataset.committees;
  const current = await fetchCommittees(
    supabase,
    desired.map((committee) => committee.name)
  );

  return diffTable({
    table: "committees",
    label: "委員会",
    fields: COMMITTEE_FIELDS,
    current: current.map((row) => toDiffRow(row.name, row)),
    desired: desired.map((row) => toDiffRow(row.name, row)),
    reportExtraneous: false,
  });
}

async function syncCouncilMembers(context: ImportContext): Promise<TableDiff> {
  const { supabase, dataset } = context;
  const desired = councilMemberRows(
    dataset.councilMembers,
    dataset.councilRosterKey,
    dataset.councilRosterUrl
  );
  const current = await fetchCouncilMembers(supabase, dataset.councilRosterKey);
  const desiredNames = new Set(desired.map((member) => member.name));
  const effectiveDesired = [
    ...desired,
    ...current
      .filter((member) => !desiredNames.has(member.name))
      .map((member) => ({
        ...member,
        faction_name: member.factions?.name ?? null,
        is_active: false,
      })),
  ];

  return diffTable({
    table: "council_members",
    label: "議員",
    fields: COUNCIL_MEMBER_FIELDS,
    current: current.map((row) =>
      toDiffRow(row.name, {
        ...row,
        faction_name: row.factions?.name ?? null,
      })
    ),
    desired: effectiveDesired.map((row) => toDiffRow(row.name, row)),
    reportExtraneous: false,
  });
}

async function syncCouncilMemberCommittees(
  context: ImportContext
): Promise<TableDiff> {
  const { supabase, dataset } = context;
  const desired = councilMemberCommitteeRows(dataset.councilMembers);
  const current = await fetchCouncilMemberCommittees(
    supabase,
    dataset.councilRosterKey
  );

  return diffTable({
    table: "council_member_committees",
    label: "議員の委員会所属",
    fields: COUNCIL_MEMBER_COMMITTEE_FIELDS,
    current: current.flatMap((row) =>
      row.council_members && row.committees
        ? [
            toDiffRow(
              compositeKey(row.council_members.name, row.committees.name),
              row
            ),
          ]
        : []
    ),
    desired: desired.map((row) =>
      toDiffRow(compositeKey(row.member_name, row.committee_name), row)
    ),
    reportExtraneous: true,
  });
}

async function syncCouncilMemberQuestions(
  context: ImportContext
): Promise<TableDiff> {
  const { supabase, dataset } = context;
  const desired = dataset.councilMemberQuestions;
  // RPC と同じ検証を dry-run でも行い、本番実行で初めて失敗するのを防ぐ
  const unknownSlugs = findUnknownQuestionSessionSlugs(
    desired,
    dataset.councilSessions.map(requireSlug)
  );
  if (unknownSlugs.length > 0) {
    throw new Error(
      `質問要約が投入対象にない会期を参照している: ${unknownSlugs.join(", ")}`
    );
  }
  const current = await fetchCouncilMemberQuestions(
    supabase,
    dataset.councilRosterKey
  );

  return diffTable({
    table: "council_member_questions",
    label: "議員の質問要約",
    fields: COUNCIL_MEMBER_QUESTION_FIELDS,
    // 出典URLの無い行は RPC が作らない（空URLを拒否する）ため突合対象にしない
    current: current.flatMap((row) =>
      row.council_members && row.source_url
        ? [
            toDiffRow(
              compositeKey(row.council_members.name, row.source_url),
              { ...row, session_slug: row.council_sessions?.slug ?? null }
            ),
          ]
        : []
    ),
    desired: desired.map((row) =>
      toDiffRow(compositeKey(row.member_name, row.source_url), row)
    ),
    // インベントリから外れた質問は削除せず報告する（一次資料由来の要約のため）
    reportExtraneous: true,
  });
}

// ---------------------------------------------------------------------------
// 会期
// ---------------------------------------------------------------------------

async function syncCouncilSessions(
  context: ImportContext
): Promise<{ diff: TableDiff; sessionIdBySlug: Map<string, string> }> {
  const { supabase, dataset } = context;
  const desired = dataset.councilSessions;

  const current = await fetchCouncilSessions(supabase, desired.map(requireSlug));

  const diff = diffTable({
    table: "council_sessions",
    label: "会期",
    fields: SESSION_FIELDS,
    current: current.map((row) => toDiffRow(requireSlug(row), row)),
    desired: desired.map((row) => toDiffRow(requireSlug(row), row)),
  });

  // dry-run で未作成の会期は Map に入らず、slug:<会期> を期待値に使う。
  const sessionIdBySlug = new Map(
    current.map((row) => [requireSlug(row), row.id])
  );

  return { diff, sessionIdBySlug };
}

// ---------------------------------------------------------------------------
// タグ
// ---------------------------------------------------------------------------

async function syncTags(
  context: ImportContext
): Promise<TableDiff> {
  const { supabase, dataset } = context;
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

  return diff;
}

// ---------------------------------------------------------------------------
// 議案
// ---------------------------------------------------------------------------

interface BillSyncResult {
  diff: TableDiff;
  /** 差分計算時点でDBに存在する議案参照 */
  billRefs: SeededBillRef[];
  /** 議案 id → slug。解説・タグ紐付の突合キーを組み立てるのに使う */
  slugById: Map<string, string>;
  /** インベントリに載っている議案の id */
  inventoryBillIds: string[];
}

async function syncBills(
  context: ImportContext,
  sessionIdBySlug: Map<string, string>
): Promise<BillSyncResult> {
  const { supabase, dataset } = context;

  const desired = dataset.bills.map((bill) => {
    const sessionSlug = billSessionSlug(dataset, bill);
    return {
      ...bill,
      council_session_id:
        sessionIdBySlug.get(sessionSlug) ?? `slug:${sessionSlug}`,
    };
  });
  const managedSessionIds = [
    ...new Set(
      dataset.bills
        .map((bill) => sessionIdBySlug.get(billSessionSlug(dataset, bill)))
        .filter((id): id is string => Boolean(id))
    ),
  ];
  const desiredSlugs = desired.map(requireSlug);
  const current = await fetchBills(supabase, desiredSlugs, managedSessionIds);

  const diff = diffTable({
    table: "bills",
    label: "議案",
    fields: [...BILL_FIELDS, { field: "council_session_id" }],
    current: current.map((row) => toDiffRow(billKey(row), row)),
    desired: desired.map((row) => toDiffRow(requireSlug(row), row)),
    // 会期に紐づくがインベントリに無い議案は、削除せず報告する。
    // bills を消すと interview_configs が CASCADE で落ち、
    // その先のセッションとレポートまで失われる。
    reportExtraneous: true,
  });

  const billRefs: SeededBillRef[] = current
    .filter((bill) => bill.slug !== null)
    .map((bill) => ({ id: bill.id, name: bill.name, slug: bill.slug }));

  return buildBillSyncResult(diff, billRefs, desiredSlugs);
}

function buildBillSyncResult(
  diff: TableDiff,
  billRefs: SeededBillRef[],
  desiredSlugs: string[]
): BillSyncResult {
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
  const { supabase, dataset } = context;

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

  return diff;
}

// ---------------------------------------------------------------------------
// タグ紐付
// ---------------------------------------------------------------------------

async function syncBillsTags(
  context: ImportContext,
  bill: BillSyncResult
): Promise<TableDiff> {
  const { supabase, dataset } = context;

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

  return diff;
}

async function syncFactionStances(
  context: ImportContext,
  bill: BillSyncResult
): Promise<TableDiff> {
  const { supabase, dataset } = context;
  const desired = dataset.factionStances;
  // RPC と同じ検証を dry-run でも行い、本番実行で初めて失敗するのを防ぐ
  const billSlugs = new Set(dataset.bills.map(requireSlug));
  const factionNames = new Set(dataset.factions.map((f) => f.name));
  const unknown = desired.filter(
    (row) => !billSlugs.has(row.bill_slug) || !factionNames.has(row.faction_name)
  );
  if (unknown.length > 0) {
    throw new Error(
      `会派の賛否が投入対象にない議案・会派を参照している: ${unknown
        .map((row) => `${row.bill_slug}/${row.faction_name}`)
        .join(", ")}`
    );
  }
  const current = await fetchFactionStances(supabase, bill.inventoryBillIds);

  return diffTable({
    table: "faction_stances",
    label: "会派の賛否",
    fields: FACTION_STANCE_FIELDS,
    current: current.map((row) =>
      toDiffRow(
        compositeKey(
          bill.slugById.get(row.bill_id) ?? row.bill_id,
          row.factions?.name ?? row.faction_id
        ),
        row
      )
    ),
    desired: desired.map((row) =>
      toDiffRow(compositeKey(row.bill_slug, row.faction_name), row)
    ),
    // 管理画面で足された賛否は削除せず報告する
    reportExtraneous: true,
  });
}

/** 全対象テーブルの書き込みを1トランザクションで確定する。 */
async function applyInventoryTransaction(
  supabase: AdminClient,
  dataset: ImportDataset
): Promise<void> {
  type Args =
    Database["public"]["Functions"]["import_production_inventory"]["Args"];

  const contents = dataset
    .createBillContents(slugRefs(dataset))
    .map(({ bill_id, ...content }) => ({ bill_slug: bill_id, ...content }));
  const billsTags = dataset
    .createBillsTags(slugRefs(dataset), labelRefs(dataset))
    .map(({ bill_id, tag_id }) => ({ bill_slug: bill_id, tag_label: tag_id }));
  const members = councilMemberRows(
    dataset.councilMembers,
    dataset.councilRosterKey,
    dataset.councilRosterUrl
  );
  const memberCommittees = councilMemberCommitteeRows(dataset.councilMembers);
  const billsWithSessionSlugs = dataset.bills.map((bill) => ({
    ...bill,
    council_session_slug: billSessionSlug(dataset, bill),
  }));
  const billSessions = billsWithSessionSlugs.map((bill) => ({
    bill_slug: requireSlug(bill),
    council_session_slug: bill.council_session_slug,
  }));
  const toJson = (value: unknown) =>
    JSON.parse(JSON.stringify(value)) as Args["p_bills"];

  const { error } = await supabase.rpc("import_production_inventory", {
    p_council_sessions: toJson(dataset.councilSessions),
    p_tags: toJson(dataset.tags),
    p_bills: toJson(billsWithSessionSlugs),
    p_bill_contents: toJson(contents),
    p_bills_tags: toJson(billsTags),
    p_bill_session_slug: dataset.billSessionSlug,
    p_bill_sessions: toJson(billSessions),
    p_factions: toJson(dataset.factions),
    p_committees: toJson(dataset.committees),
    p_council_members: toJson(members),
    p_council_member_committees: toJson(memberCommittees),
    p_council_roster_key: dataset.councilRosterKey,
    p_council_member_questions: toJson(dataset.councilMemberQuestions),
    p_faction_stances: toJson(dataset.factionStances),
  });
  if (error) {
    throw new Error(`本番インポートのトランザクションに失敗: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// 読み出し
// ---------------------------------------------------------------------------

/** 最小限の構造型で Supabase のクエリの推論結果を保つ。 */
interface PageQuery<T>
  extends PromiseLike<{
    data: T[] | null;
    count: number | null;
    error: { message: string } | null;
  }> {
  order(column: string): PageQuery<T>;
  range(from: number, to: number): PageQuery<T>;
}

async function fetchPages<T, B>(
  table: string,
  batches: readonly B[],
  query: (batch: B, head: boolean) => PageQuery<T>,
  keyOf: (row: T) => string,
  orderColumns = ["id"]
) {
  return paginate({
    table,
    batches,
    keyOf,
    countRows: async (batch) => {
      const { count, error } = await query(batch, true);
      if (error) throw new Error(`${table} の件数取得に失敗: ${error.message}`);
      if (count === null) throw new Error(`${table} の件数が取得できない`);
      return count;
    },
    readPage: async (batch, from, to) => {
      let page = query(batch, false);
      for (const column of orderColumns) page = page.order(column);
      const { data, error } = await page.range(from, to);
      if (error) throw new Error(`${table} の取得に失敗: ${error.message}`);
      return data ?? [];
    },
  });
}

async function fetchCouncilSessions(supabase: AdminClient, slugs: string[]) {
  return fetchPages(
    "council_sessions",
    chunkValues(slugs),
    (batch, head) =>
      supabase
        .from("council_sessions")
        .select(
          "id, name, slug, council_url, start_date, end_date, is_active",
          { count: "exact", head }
        )
        .in("slug", batch),
    requireSlug
  );
}

async function fetchTags(supabase: AdminClient, labels: string[]) {
  return fetchPages(
    "tags",
    chunkValues(labels),
    (batch, head) =>
      supabase
        .from("tags")
        .select("id, label, description, featured_priority", {
          count: "exact",
          head,
        })
        .in("label", batch),
    (row) => row.label
  );
}

async function fetchFactions(supabase: AdminClient, names: string[]) {
  return fetchPages(
    "factions",
    chunkValues(names),
    (batch, head) =>
      supabase
        .from("factions")
        .select(
          "name, display_name, alternative_names, logo_url, sort_order, is_active",
          { count: "exact", head }
        )
        .in("name", batch),
    (row) => row.name
  );
}

async function fetchCommittees(supabase: AdminClient, names: string[]) {
  return fetchPages(
    "committees",
    chunkValues(names),
    (batch, head) =>
      supabase
        .from("committees")
        .select("name, description, sort_order, is_active", {
          count: "exact",
          head,
        })
        .in("name", batch),
    (row) => row.name
  );
}

async function fetchCouncilMembers(supabase: AdminClient, rosterKey: string) {
  return fetchPages(
    "council_members",
    [rosterKey],
    (batch, head) =>
      supabase
        .from("council_members")
        .select(
          "name, name_kana, faction_role, official_url, website_url, x_url, terms, sort_order, is_active, roster_key, factions(name)",
          { count: "exact", head }
        )
        .eq("roster_key", batch),
    (row) => row.name
  );
}

async function fetchCouncilMemberCommittees(
  supabase: AdminClient,
  rosterKey: string
) {
  return fetchPages(
    "council_member_committees",
    [rosterKey],
    (batch, head) =>
      supabase
        .from("council_member_committees")
        .select(
          "role, council_members!inner(name, roster_key), committees(name)",
          { count: "exact", head }
        )
        .eq("council_members.roster_key", batch),
    (row) =>
      compositeKey(row.council_members?.name ?? "", row.committees?.name ?? "")
  );
}

async function fetchCouncilMemberQuestions(
  supabase: AdminClient,
  rosterKey: string
) {
  return fetchPages(
    "council_member_questions",
    [rosterKey],
    (batch, head) =>
      supabase
        .from("council_member_questions")
        .select(
          "session_name, venue_type, question_kind, title, summary, topic_tags, speech_date, source_url, council_members!inner(name, roster_key), council_sessions(slug)",
          { count: "exact", head }
        )
        .eq("council_members.roster_key", batch)
        // 出典のない質問は既存の差分計算でも対象外。NULL は一意制約の対象外。
        .not("source_url", "is", null),
    (row) => compositeKey(row.council_members?.name ?? "", row.source_url ?? "")
  );
}

async function fetchBillContents(supabase: AdminClient, billIds: string[]) {
  return fetchPages(
    "bill_contents",
    chunkValues(billIds),
    (batch, head) =>
      supabase
        .from("bill_contents")
        .select("bill_id, difficulty_level, title, summary, content", {
          count: "exact",
          head,
        })
        .in("bill_id", batch),
    (row) => compositeKey(row.bill_id, row.difficulty_level)
  );
}

async function fetchBillsTags(supabase: AdminClient, billIds: string[]) {
  return fetchPages(
    "bills_tags",
    chunkValues(billIds),
    (batch, head) =>
      supabase
        .from("bills_tags")
        .select("bill_id, tag_id, tags(label)", { count: "exact", head })
        .in("bill_id", batch),
    (row) => compositeKey(row.bill_id, row.tags?.label ?? row.tag_id),
    ["bill_id", "tag_id"]
  );
}

async function fetchFactionStances(supabase: AdminClient, billIds: string[]) {
  return fetchPages(
    "faction_stances",
    chunkValues(billIds),
    (batch, head) =>
      supabase
        .from("faction_stances")
        .select(
          "bill_id, faction_id, type, faction_name_at_vote, factions(name)",
          { count: "exact", head }
        )
        .in("bill_id", batch),
    (row) => compositeKey(row.bill_id, row.factions?.name ?? row.faction_id)
  );
}

type BillRow = {
  id: string;
  name: string;
  slug: string | null;
  [key: string]: unknown;
};

const BILL_COLUMNS =
  "id, name, slug, bill_number, status, status_note, publish_status, published_at, is_featured, is_review_completed, thumbnail_url, pdf_url, overview_pdf_url, source_page_url, decision_source_url, council_session_id";

/** slug と会期の検索結果は重なるため、それぞれ検査した後で ID により統合する。 */
async function fetchBills(
  supabase: AdminClient,
  slugs: string[],
  sessionIds: string[]
) {
  const bySlug = await fetchPages(
    "bills",
    chunkValues(slugs),
    (batch, head) =>
      supabase
        .from("bills")
        .select(BILL_COLUMNS, { count: "exact", head })
        .in("slug", batch),
    billKey
  );
  const bySession = await fetchPages(
    "bills",
    chunkValues(sessionIds),
    (batch, head) =>
      supabase
        .from("bills")
        .select(BILL_COLUMNS, { count: "exact", head })
        .in("council_session_id", batch),
    billKey
  );
  const byId = new Map<string, BillRow>();
  for (const row of [...bySlug, ...bySession]) byId.set(row.id, row);
  return [...byId.values()];
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

/** 議案ごとの指定を優先し、未指定なら従来の単一会期指定へフォールバックする。 */
function billSessionSlug(dataset: ImportDataset, bill: BillInsert): string {
  const slug = requireSlug(bill);
  const sessionSlug =
    dataset.billSessionSlugByBillSlug?.[slug] ?? dataset.billSessionSlug;
  if (!sessionSlug) {
    throw new Error(`議案の会期 slug が未設定: ${slug}`);
  }
  if (!dataset.councilSessions.some((session) => session.slug === sessionSlug)) {
    throw new Error(`議案が投入対象にない会期を参照している: ${slug}/${sessionSlug}`);
  }
  return sessionSlug;
}

/** 同じ理由で、id の代わりに label を入れたタグ参照 */
function labelRefs(dataset: ImportDataset): TagRef[] {
  return dataset.tags.map((tag) => ({ id: tag.label, label: tag.label }));
}

function councilMemberRows(
  members: SeedCouncilMember[],
  councilRosterKey: string,
  councilRosterUrl: string
) {
  return members.map((member, index) => ({
    name: member.name,
    name_kana: member.nameKana,
    faction_name: member.faction,
    faction_role: member.factionRole,
    roster_key: councilRosterKey,
    official_url: councilRosterUrl,
    website_url: member.websiteUrl,
    x_url: member.xUrl,
    terms: member.terms,
    sort_order: index + 1,
    is_active: member.isActive ?? true,
  }));
}

function councilMemberCommitteeRows(members: SeedCouncilMember[]) {
  return members.flatMap((member) =>
    Object.entries(member.committees).map(([committeeName, role]) => ({
      member_name: member.name,
      committee_name: committeeName,
      role,
    }))
  );
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

function requireSlug(row: { slug?: string | null; name?: string }): string {
  if (!row.slug) {
    throw new Error(`slug が未設定: ${row.name ?? JSON.stringify(row)}`);
  }
  return row.slug;
}
