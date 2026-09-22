/**
 * 本番インポート CLI の引数解釈。
 *
 * `--dry-run` の取りこぼしがそのまま本番DBへの書き込みになるため、
 * 未知の引数は黙って無視せず停止する（`--dryrun` のようなタイポ対策）。
 */

const DRY_RUN_FLAG = "--dry-run";

export interface CliArgs {
  dryRun: boolean;
}

export function parseCliArgs(argv: string[]): CliArgs {
  const unknown = argv.filter((arg) => arg !== DRY_RUN_FLAG);

  if (unknown.length > 0) {
    throw new Error(
      `未知の引数: ${unknown.join(" ")}（使えるのは ${DRY_RUN_FLAG} だけ）`
    );
  }

  return { dryRun: argv.includes(DRY_RUN_FLAG) };
}

/** 本番インポートに必要な環境変数が揃っているかを確かめ、接続先を返す。 */
export function requireSupabaseEnv(env: NodeJS.ProcessEnv): { url: string } {
  const url = env.SUPABASE_URL;

  if (!url || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してから実行すること。"
    );
  }

  return { url };
}
