/**
 * 議案のステータス表示ラベル。
 *
 * web と admin の双方が同じラベルを出す必要があるため、ここに一本化する。
 *
 * ## 議決用語を status_note から取る理由
 *
 * `bills.status` は `approved` / `rejected` のような粗い列挙で、議会が実際に用いる
 * 議決用語とは一対一に対応しない。たとえば新宿区議会 令和8年第2回定例会では、
 * 第42〜62号議案の議決結果は「原案可決」だが、承認第2号・第3号は専決処分の
 * 承認であり「承認」である。どちらも `status = approved` になるため、列挙だけを
 * 見て「可決」と表示すると承認案件を誤って表示することになる。
 *
 * 公式の議決用語は投入時に `bills.status_note`（例:「本会議で承認」）へ入っている。
 * そこで、議決済みのステータスに限り status_note に現れた公式用語を優先し、
 * 該当しなければ従来どおり列挙からラベルを引く。
 *
 * status_note は自由記述のため、ここでは既知の用語だけを拾う。将来 `decision_label`
 * のような専用カラムを持たせる場合も、置き換えるのはこのモジュールの内部だけで済む。
 */

/** bills.status の取りうる値 */
export type BillStatusKey =
  | "preparing"
  | "submitted"
  | "in_committee"
  | "plenary_session"
  | "approved"
  | "rejected"
  | "adopted"
  | "partially_adopted"
  | "reported";

export type BillStatusVariant = "light" | "default" | "dark" | "muted";

export interface BillDecisionInput {
  status: string;
  /** bills.status_note。公式の議決用語を含む想定 */
  statusNote?: string | null;
}

interface OfficialDecisionTerm {
  /** status_note の中から探す公式用語 */
  term: string;
  /** 画面に出すラベル */
  label: string;
  variant: BillStatusVariant;
}

/**
 * 認識する公式の議決用語。
 *
 * 前方の要素から順に部分一致を見るため、長い用語を先に置くこと
 *（「原案可決」より先に「可決」を置くと「原案可決」を拾えない）。
 *
 * 「原案可決」の表示は「可決」のままにしている。公式用語をそのまま出すと
 * 大半の議案が「原案可決」になり、やさしい言葉で伝えるという本サイトの方針から
 * 離れるため。区別が必要なのは可決と承認のように意味の異なる用語である。
 */
const OFFICIAL_DECISION_TERMS: OfficialDecisionTerm[] = [
  { term: "原案可決", label: "可決", variant: "default" },
  { term: "修正可決", label: "修正可決", variant: "default" },
  { term: "趣旨採択", label: "趣旨採択", variant: "default" },
  { term: "不採択", label: "不採択", variant: "dark" },
  { term: "承認", label: "承認", variant: "default" },
  { term: "同意", label: "同意", variant: "default" },
  { term: "認定", label: "認定", variant: "default" },
  { term: "採択", label: "採択", variant: "default" },
  { term: "否決", label: "否決", variant: "dark" },
  { term: "可決", label: "可決", variant: "default" },
];

/**
 * 議決が済んだステータス。
 *
 * 審議中の議案の status_note に予定や経過が書かれていても議決用語として
 * 拾わないよう、参照先をこの集合に限定する。
 */
const DECIDED_STATUSES: ReadonlySet<string> = new Set<BillStatusKey>([
  "approved",
  "rejected",
  "adopted",
  "partially_adopted",
  "reported",
]);

/** status_note から公式の議決用語を取り出す。該当しなければ null */
export function resolveOfficialDecisionTerm({
  status,
  statusNote,
}: BillDecisionInput): OfficialDecisionTerm | null {
  if (!DECIDED_STATUSES.has(status)) {
    return null;
  }

  const note = statusNote?.trim();
  if (!note) {
    return null;
  }

  return OFFICIAL_DECISION_TERMS.find((d) => note.includes(d.term)) ?? null;
}

/** 列挙から引く詳細ラベル（議決用語が取れない場合のフォールバック） */
function getStatusEnumLabel(status: string): string {
  switch (status) {
    case "preparing":
      return "準備中";
    case "submitted":
      return "上程済み";
    case "in_committee":
      return "委員会審査中";
    case "plenary_session":
      return "本会議採決中";
    case "approved":
      return "可決";
    case "rejected":
      return "否決";
    case "adopted":
      return "採択";
    case "partially_adopted":
      return "趣旨採択";
    case "reported":
      return "専決処分報告";
    default:
      return status;
  }
}

/** 列挙から引くカード用の簡略ラベル */
function getCardStatusEnumLabel(status: string): string {
  switch (status) {
    case "submitted":
    case "in_committee":
    case "plenary_session":
      return "議会審議中";
    case "approved":
      return "可決";
    case "rejected":
      return "否決";
    case "adopted":
      return "採択";
    case "partially_adopted":
      return "趣旨採択";
    case "reported":
      return "専決処分報告";
    default:
      return "議案上程前";
  }
}

/** 議案詳細・管理画面向けのステータスラベル */
export function getBillStatusLabel(input: BillDecisionInput): string {
  return (
    resolveOfficialDecisionTerm(input)?.label ?? getStatusEnumLabel(input.status)
  );
}

/** 一覧カード向けの簡略ステータスラベル */
export function getBillCardStatusLabel(input: BillDecisionInput): string {
  return (
    resolveOfficialDecisionTerm(input)?.label ??
    getCardStatusEnumLabel(input.status)
  );
}

/** ステータスに対応する Badge の variant */
export function getBillStatusVariant(
  input: BillDecisionInput
): BillStatusVariant {
  const decision = resolveOfficialDecisionTerm(input);
  if (decision) {
    return decision.variant;
  }

  switch (input.status) {
    case "submitted":
    case "in_committee":
    case "plenary_session":
      return "light";
    case "approved":
    case "adopted":
    case "partially_adopted":
    case "reported":
      return "default";
    case "rejected":
      return "dark";
    default:
      return "muted";
  }
}
