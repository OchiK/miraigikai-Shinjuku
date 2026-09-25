import type { Database } from "@mirai-gikai/supabase";
import { createBillContents } from "../main/bill-contents-data";
import type { SeededBillRef } from "../main/bill-ref";
import {
  committees,
  councilSessions,
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
import { R8_2_SESSION, toBillInserts } from "../main/shinjuku-r8-2-inventory";
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
  /** 議案を紐づける会期の slug */
  billSessionSlug: string;
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
  bills: BillInsert[];
  createBillContents: (bills: SeededBillRef[]) => BillContentInsert[];
  createBillsTags: (bills: SeededBillRef[], tags: TagRef[]) => BillsTagsInsert[];
}

/** 本番に投入する一次資料層（リポジトリを唯一の正とみなす範囲） */
export const productionDataset: ImportDataset = {
  councilSessions,
  billSessionSlug: requireSlug(R8_2_SESSION),
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
  dataset: ImportDataset;
}

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
  const bill = await syncBills(context, session.billSessionId);
  const contents = await syncBillContents(context, bill);
  const billsTags = await syncBillsTags(context, bill);

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
): Promise<{ diff: TableDiff; billSessionId: string | null }> {
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

  // 議案を紐づける会期の id。dry-run で会期が未作成なら null のままになる。
  const existingId =
    current.find((row) => row.slug === dataset.billSessionSlug)?.id ?? null;

  return { diff, billSessionId: existingId };
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
  billSessionId: string | null
): Promise<BillSyncResult> {
  const { supabase, dataset } = context;

  const desired = dataset.bills.map((bill) => ({
    ...bill,
    council_session_id: billSessionId,
  }));
  const desiredSessionKey =
    billSessionId ?? `slug:${dataset.billSessionSlug}`;
  const desiredSlugs = desired.map(requireSlug);
  const current = await fetchBills(supabase, desiredSlugs, billSessionId);

  const diff = diffTable({
    table: "bills",
    label: "議案",
    fields: [...BILL_FIELDS, { field: "council_session_id" }],
    current: current.map((row) => toDiffRow(billKey(row), row)),
    desired: desired.map((row) =>
      toDiffRow(requireSlug(row), {
        ...row,
        council_session_id: desiredSessionKey,
      })
    ),
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
  const toJson = (value: unknown) =>
    JSON.parse(JSON.stringify(value)) as Args["p_bills"];

  const { error } = await supabase.rpc("import_production_inventory", {
    p_council_sessions: toJson(dataset.councilSessions),
    p_tags: toJson(dataset.tags),
    p_bills: toJson(dataset.bills),
    p_bill_contents: toJson(contents),
    p_bills_tags: toJson(billsTags),
    p_bill_session_slug: dataset.billSessionSlug,
    p_factions: toJson(dataset.factions),
    p_committees: toJson(dataset.committees),
    p_council_members: toJson(members),
    p_council_member_committees: toJson(memberCommittees),
    p_council_roster_key: dataset.councilRosterKey,
    p_council_member_questions: toJson(dataset.councilMemberQuestions),
  });
  if (error) {
    throw new Error(`本番インポートのトランザクションに失敗: ${error.message}`);
  }
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

async function fetchFactions(supabase: AdminClient, names: string[]) {
  if (names.length === 0) return [];
  const { data, error } = await supabase
    .from("factions")
    .select(
      "name, display_name, alternative_names, logo_url, sort_order, is_active"
    )
    .in("name", names);
  if (error) {
    throw new Error(`factions の取得に失敗: ${error.message}`);
  }
  return assertWithinRowLimit(data ?? [], "factions");
}

async function fetchCommittees(supabase: AdminClient, names: string[]) {
  if (names.length === 0) return [];
  const { data, error } = await supabase
    .from("committees")
    .select("name, description, sort_order, is_active")
    .in("name", names);
  if (error) {
    throw new Error(`committees の取得に失敗: ${error.message}`);
  }
  return assertWithinRowLimit(data ?? [], "committees");
}

async function fetchCouncilMembers(supabase: AdminClient, rosterKey: string) {
  const { data, error } = await supabase
    .from("council_members")
    .select(
      "name, name_kana, faction_role, official_url, website_url, terms, sort_order, is_active, roster_key, factions(name)"
    )
    .eq("roster_key", rosterKey);
  if (error) {
    throw new Error(`council_members の取得に失敗: ${error.message}`);
  }
  return assertWithinRowLimit(data ?? [], "council_members");
}

async function fetchCouncilMemberCommittees(
  supabase: AdminClient,
  rosterKey: string
) {
  const { data, error } = await supabase
    .from("council_member_committees")
    .select(
      "role, council_members!inner(name, roster_key), committees(name)"
    )
    .eq("council_members.roster_key", rosterKey);
  if (error) {
    throw new Error(
      `council_member_committees の取得に失敗: ${error.message}`
    );
  }
  return assertWithinRowLimit(data ?? [], "council_member_committees");
}

async function fetchCouncilMemberQuestions(
  supabase: AdminClient,
  rosterKey: string
) {
  const { data, error } = await supabase
    .from("council_member_questions")
    .select(
      "session_name, venue_type, question_kind, title, summary, topic_tags, speech_date, source_url, council_members!inner(name, roster_key), council_sessions(slug)"
    )
    .eq("council_members.roster_key", rosterKey);
  if (error) {
    throw new Error(`council_member_questions の取得に失敗: ${error.message}`);
  }
  return assertWithinRowLimit(data ?? [], "council_member_questions");
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
    terms: member.terms,
    sort_order: index + 1,
    is_active: true,
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
