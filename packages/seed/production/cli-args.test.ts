import { describe, expect, it } from "vitest";
import { parseCliArgs, requireSupabaseEnv } from "./cli-args";

describe("parseCliArgs", () => {
  it("引数なしは本番反映（dryRun: false）", () => {
    expect(parseCliArgs([])).toEqual({ dryRun: false });
  });

  it("--dry-run を渡すと dryRun: true", () => {
    expect(parseCliArgs(["--dry-run"])).toEqual({ dryRun: true });
  });

  it("タイポを黙って本番反映に倒さず停止する", () => {
    for (const typo of ["--dryrun", "--dry_run", "--dry-run=true", "-d"]) {
      expect(() => parseCliArgs([typo])).toThrow(/未知の引数/);
    }
  });

  it("正しいフラグと未知の引数が混ざっていても停止する", () => {
    expect(() => parseCliArgs(["--dry-run", "--force"])).toThrow(/--force/);
  });
});

describe("requireSupabaseEnv", () => {
  it("両方揃っていれば接続先を返す", () => {
    expect(
      requireSupabaseEnv({
        SUPABASE_URL: "http://127.0.0.1:54421",
        SUPABASE_SERVICE_ROLE_KEY: "key",
      })
    ).toEqual({ url: "http://127.0.0.1:54421" });
  });

  it("service_role key が無ければ停止する", () => {
    expect(() =>
      requireSupabaseEnv({ SUPABASE_URL: "http://127.0.0.1:54421" })
    ).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  it("URL が無ければ停止する", () => {
    expect(() =>
      requireSupabaseEnv({ SUPABASE_SERVICE_ROLE_KEY: "key" })
    ).toThrow(/SUPABASE_URL/);
  });
});
