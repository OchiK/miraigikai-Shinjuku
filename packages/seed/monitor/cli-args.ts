/**
 * 更新検知 CLI の引数解釈。未知の引数は黙って無視せず停止する（`--dryrun` のようなタイポ対策）。
 */

const DRY_RUN_FLAG = "--dry-run";

export interface MonitorCliArgs {
  /** 取得と比較だけ行い、ファイルを書き出さない */
  dryRun: boolean;
}

export function parseMonitorCliArgs(argv: string[]): MonitorCliArgs {
  // pnpm の引数区切り（`pnpm monitor:shinjuku -- --dry-run`）は無視する
  const args = argv.filter((arg) => arg !== "--");
  const unknown = args.filter((arg) => arg !== DRY_RUN_FLAG);

  if (unknown.length > 0) {
    throw new Error(
      `未知の引数: ${unknown.join(" ")}（使えるのは ${DRY_RUN_FLAG} だけ）`
    );
  }

  return { dryRun: args.includes(DRY_RUN_FLAG) };
}
