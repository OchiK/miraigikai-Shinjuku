/** PostgREST の返却上限以下で読む。Supabase の呼び出しは引数で受け取る。 */
export const POSTGREST_MAX_ROWS = 1000;
const IN_BATCH_SIZE = 100;

export function chunkValues<T>(values: readonly T[]): T[][] {
  const chunks: T[][] = [];
  for (let offset = 0; offset < values.length; offset += IN_BATCH_SIZE) {
    chunks.push(values.slice(offset, offset + IN_BATCH_SIZE));
  }
  return chunks;
}

/** 件数は各塊の読み出し前に取得し、キーの重複は塊をまたいで検査する。 */
export async function paginate<T, B>({
  table,
  batches,
  countRows,
  readPage,
  keyOf,
}: {
  table: string;
  batches: readonly B[];
  countRows: (batch: B) => Promise<number>;
  readPage: (batch: B, from: number, to: number) => Promise<T[]>;
  keyOf: (row: T) => string;
}): Promise<T[]> {
  const rows: T[] = [];
  const seen = new Set<string>();
  for (const batch of batches) {
    const expected = await countRows(batch);
    let read = 0;
    for (let from = 0; ; from += POSTGREST_MAX_ROWS) {
      const page = await readPage(batch, from, from + POSTGREST_MAX_ROWS - 1);
      for (const row of page) {
        const key = keyOf(row);
        if (seen.has(key)) {
          throw new Error(`${table} の読み出しでキーが重複: ${key}`);
        }
        seen.add(key);
        rows.push(row);
      }
      read += page.length;
      if (read > expected || page.length < POSTGREST_MAX_ROWS) break;
    }
    if (read !== expected) {
      throw new Error(
        `${table} の件数が不一致: count=${expected}, read=${read}`
      );
    }
  }
  return rows;
}
