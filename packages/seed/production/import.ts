/**
 * 本番DBへの非破壊インポート CLI。
 *
 *   pnpm --filter @mirai-gikai/seed import:production:dry-run
 *   pnpm --filter @mirai-gikai/seed import:production
 *
 * 破壊的な開発シード（main/run.ts）とは別経路であり、一次資料・利用者データの
 * 行は削除しない。現行状態を表す議員の委員会所属だけを名簿に合わせる。
 */
import { createAdminClient } from "../shared/helper";
import { parseCliArgs, requireSupabaseEnv } from "./cli-args";
import { formatImportReport, hasChanges } from "./diff";
import { importInventory } from "./importer";

async function main() {
  const { dryRun } = parseCliArgs(process.argv.slice(2));
  const { url } = requireSupabaseEnv(process.env);

  console.log(`接続先: ${url}`);
  console.log(
    dryRun
      ? "モード: dry-run（差分の表示のみ。DBへは書き込まない）"
      : "モード: 本番反映（自然キーによる同期。一次資料・利用者データは削除しない）"
  );

  const report = await importInventory(createAdminClient(), { dryRun });

  console.log(formatImportReport(report));

  if (dryRun && !hasChanges(report)) {
    console.log("差分なし（インベントリとDBは一致している）");
  }
}

main().catch((error) => {
  console.error("❌ 本番インポートに失敗:", error);
  process.exit(1);
});
