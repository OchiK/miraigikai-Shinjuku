/**
 * 破壊的シード（clearAllData）の実行可否判定。
 *
 * clearAllData は利用者のインタビュー回答・レポート・チャット履歴を含む
 * 全行を削除する。本番の資格情報で叩かれると取り返しがつかないため、
 * ローカル以外への接続は既定で拒否する。
 *
 * 判定は外部依存を持たない純粋関数として切り出してある。
 * 最後の砦なので、挙動をテストで固定しておくこと。
 */

/** ローカル Supabase とみなすホスト名 */
const LOCAL_HOSTNAMES = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

/**
 * ローカル Supabase への接続先かどうか。
 *
 * 部分一致ではなくホスト名で判定する。
 * `https://localhost.example.com` や `https://xxx.supabase.co/?h=127.0.0.1`
 * のような文字列をローカルと誤認しないため。
 */
export function isLocalSupabaseUrl(url: string): boolean {
  if (!url) return false;

  try {
    return LOCAL_HOSTNAMES.has(new URL(url).hostname);
  } catch {
    // URL として解釈できない値はローカルと認めない
    return false;
  }
}

export interface DestructiveSeedContext {
  /** 接続先（SUPABASE_URL）。未設定なら空文字を渡す */
  url: string;
  /** ALLOW_DESTRUCTIVE_SEED の値。`"1"` のときだけ解除する */
  allowFlag: string | undefined;
}

/** 破壊的シードを実行してよいか。 */
export function isDestructiveSeedAllowed({
  url,
  allowFlag,
}: DestructiveSeedContext): boolean {
  return isLocalSupabaseUrl(url) || allowFlag === "1";
}

/** 拒否時のエラーメッセージ。何が起きるのかと代替手段を必ず示す。 */
export function destructiveSeedBlockedMessage(url: string): string {
  return (
    `破壊的シードは clearAllData() で利用者データを含む全行を削除する。ローカル以外では実行できない（接続先: ${url || "未設定"}）。` +
    "本番へ投入するときは import:production を使うこと。" +
    "本番相当の検証環境を作り直す場合のみ ALLOW_DESTRUCTIVE_SEED=1 を明示すること。"
  );
}

/** 実行可否を判定し、許されない場合は例外を投げる。 */
export function assertDestructiveSeedAllowed(
  env: NodeJS.ProcessEnv = process.env
): void {
  const url = env.SUPABASE_URL ?? "";

  if (isDestructiveSeedAllowed({ url, allowFlag: env.ALLOW_DESTRUCTIVE_SEED })) {
    return;
  }

  throw new Error(destructiveSeedBlockedMessage(url));
}
