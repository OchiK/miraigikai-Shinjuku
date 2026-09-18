/**
 * 本番インポーターの差分計算。
 *
 * ここには副作用を持つ処理を置かない。DBから読み出した現在の行と、
 * インベントリから組み立てた投入予定の行を受け取り、
 * 「新規 / 更新 / 変更なし / インベントリ外」に仕分けるだけの純粋関数を置く。
 *
 * 比較ロジックをDBアクセスから切り離すことで、ローカルSupabaseなしで
 * 差分の判定基準（タイムスタンプの表記ゆれの吸収など）を検証できる。
 */

/** 比較対象の1カラム。 */
export interface FieldSpec {
  /** カラム名 */
  field: string;
  /**
   * 比較前に値を正規化する関数。
   * DBが返す表記と投入予定の表記が異なるカラム（timestamptz など）で使う。
   */
  normalize?: (value: unknown) => unknown;
}

/** 差分計算に渡す1行。自然キーと比較対象カラムの値だけを持つ。 */
export interface DiffRow {
  /** 自然キー（slug、label、`slug:difficulty` など） */
  key: string;
  /** 比較対象カラムの値 */
  values: Record<string, unknown>;
}

/** 1カラムの変更内容 */
export interface FieldChange {
  field: string;
  before: unknown;
  after: unknown;
}

/** 1行の変更内容 */
export interface RowChange {
  key: string;
  changes: FieldChange[];
}

/** 1テーブル分の差分 */
export interface TableDiff {
  /** テーブル名 */
  table: string;
  /** CLI表示用の日本語ラベル */
  label: string;
  /** インベントリにあり、DBに無い行の自然キー */
  created: string[];
  /** 両方にあり、値が異なる行 */
  updated: RowChange[];
  /** 両方にあり、値が一致する行の自然キー */
  unchanged: string[];
  /**
   * DBにあり、インベントリに無い行の自然キー。
   * インポーターはこれらを削除しない。人が判断するための報告に留める。
   */
  extraneous: string[];
}

/** 触れない利用者データの件数（報告のみ） */
export interface UserDataCount {
  table: string;
  count: number;
}

/** インポート1回分の報告 */
export interface ImportReport {
  /** true なら書き込みを行っていない */
  dryRun: boolean;
  tables: TableDiff[];
  userData: UserDataCount[];
}

export interface DiffTableParams {
  table: string;
  label: string;
  fields: FieldSpec[];
  /** DBの現在の行 */
  current: DiffRow[];
  /** インベントリから組み立てた投入予定の行 */
  desired: DiffRow[];
  /**
   * DBにのみ存在する行を extraneous として報告するか。
   * 突合範囲を絞り込めないテーブル（tags など）では false にする。
   */
  reportExtraneous?: boolean;
}

/** 自然キーで突合し、テーブル1つ分の差分を組み立てる。 */
export function diffTable({
  table,
  label,
  fields,
  current,
  desired,
  reportExtraneous = false,
}: DiffTableParams): TableDiff {
  const currentByKey = indexByKey(current, `${table}（DB側）`);
  const desiredByKey = indexByKey(desired, `${table}（インベントリ側）`);

  const created: string[] = [];
  const updated: RowChange[] = [];
  const unchanged: string[] = [];

  for (const row of desired) {
    const existing = currentByKey.get(row.key);
    if (!existing) {
      created.push(row.key);
      continue;
    }

    const changes = diffFields(existing.values, row.values, fields);
    if (changes.length > 0) {
      updated.push({ key: row.key, changes });
    } else {
      unchanged.push(row.key);
    }
  }

  const extraneous = reportExtraneous
    ? current.map((row) => row.key).filter((key) => !desiredByKey.has(key))
    : [];

  return { table, label, created, updated, unchanged, extraneous };
}

/** 2行の値を比較し、異なるカラムだけを返す。 */
export function diffFields(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  fields: FieldSpec[]
): FieldChange[] {
  const changes: FieldChange[] = [];

  for (const { field, normalize } of fields) {
    const beforeValue = before[field];
    const afterValue = after[field];
    const apply = normalize ?? ((value: unknown) => value);

    if (!isEqual(apply(beforeValue), apply(afterValue))) {
      changes.push({ field, before: beforeValue, after: afterValue });
    }
  }

  return changes;
}

/**
 * timestamptz の表記ゆれを吸収する。
 *
 * インベントリは `2026-06-19T00:00:00+09:00` の形で持つが、
 * PostgREST は `2026-06-18T15:00:00+00:00` を返す。
 * 同じ時刻を「更新あり」と誤判定しないため、エポックミリ秒に揃えて比較する。
 */
export function normalizeTimestamp(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return value;

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? value : parsed;
}

/** null と undefined を同一視して比較する（DBの NULL と未設定を区別しない）。 */
function isEqual(a: unknown, b: unknown): boolean {
  if (a === null || a === undefined) return b === null || b === undefined;
  if (b === null || b === undefined) return false;
  return a === b;
}

function indexByKey(rows: DiffRow[], context: string): Map<string, DiffRow> {
  const map = new Map<string, DiffRow>();
  for (const row of rows) {
    if (map.has(row.key)) {
      throw new Error(`自然キーが重複している: ${context} / ${row.key}`);
    }
    map.set(row.key, row);
  }
  return map;
}

/** 報告をCLI出力用の文字列に整形する。 */
export function formatImportReport(report: ImportReport): string {
  const lines: string[] = [];

  lines.push(
    report.dryRun
      ? "=== dry-run（DBへの書き込みは行っていない） ==="
      : "=== 本番インポート結果 ==="
  );

  for (const table of report.tables) {
    lines.push(
      `${table.label}  新規 ${table.created.length} / 更新 ${table.updated.length} / 変更なし ${table.unchanged.length} / インベントリ外 ${table.extraneous.length}`
    );

    for (const key of table.created) {
      lines.push(`  + ${key}`);
    }

    for (const row of table.updated) {
      for (const change of row.changes) {
        lines.push(
          `  ~ ${row.key}  ${change.field}: ${formatValue(change.before)} -> ${formatValue(change.after)}`
        );
      }
    }

    for (const key of table.extraneous) {
      lines.push(`  ? ${key}（インベントリ外。削除しない）`);
    }
  }

  if (report.userData.length > 0) {
    const counts = report.userData
      .map((entry) => `${entry.table} ${entry.count}件`)
      .join(" / ");
    lines.push(`利用者データ  ${counts}（読み書きしない）`);
  }

  return lines.join("\n");
}

/** 差分表示用に値を短く整形する。長い本文は先頭だけを出す。 */
export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value !== "string") return String(value);
  if (value.length <= 40) return value;
  return `${value.slice(0, 40)}…(${value.length}文字)`;
}

/** 報告全体に1件でも書き込み対象があるか。 */
export function hasChanges(report: ImportReport): boolean {
  return report.tables.some(
    (table) => table.created.length > 0 || table.updated.length > 0
  );
}
