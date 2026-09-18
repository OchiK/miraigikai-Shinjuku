import { describe, expect, it } from "vitest";
import {
  assertDestructiveSeedAllowed,
  destructiveSeedBlockedMessage,
  isDestructiveSeedAllowed,
  isLocalSupabaseUrl,
} from "./destructive-seed-guard";

const PRODUCTION_URL = "https://abcdefghijklmnop.supabase.co";

describe("isLocalSupabaseUrl", () => {
  it("ローカルSupabaseの既定URLを許可する", () => {
    expect(isLocalSupabaseUrl("http://127.0.0.1:54421")).toBe(true);
    expect(isLocalSupabaseUrl("http://localhost:54421")).toBe(true);
  });

  it("本番のプロジェクトURLは許可しない", () => {
    expect(isLocalSupabaseUrl(PRODUCTION_URL)).toBe(false);
  });

  it("ホスト名にローカル名を含むだけの外部URLを誤って許可しない", () => {
    expect(isLocalSupabaseUrl("https://localhost.example.com")).toBe(false);
    expect(isLocalSupabaseUrl("https://127.0.0.1.example.com")).toBe(false);
  });

  it("クエリやパスにローカルアドレスを紛れ込ませても許可しない", () => {
    expect(isLocalSupabaseUrl(`${PRODUCTION_URL}/?host=127.0.0.1`)).toBe(false);
    expect(isLocalSupabaseUrl(`${PRODUCTION_URL}/localhost`)).toBe(false);
  });

  it("空文字やURLとして解釈できない値は許可しない", () => {
    expect(isLocalSupabaseUrl("")).toBe(false);
    expect(isLocalSupabaseUrl("127.0.0.1:54421")).toBe(false);
  });
});

describe("isDestructiveSeedAllowed", () => {
  it("ローカル接続なら解除フラグ無しでも許可する", () => {
    expect(
      isDestructiveSeedAllowed({
        url: "http://127.0.0.1:54421",
        allowFlag: undefined,
      })
    ).toBe(true);
  });

  it("本番接続は既定で拒否する", () => {
    expect(
      isDestructiveSeedAllowed({ url: PRODUCTION_URL, allowFlag: undefined })
    ).toBe(false);
  });

  it("SUPABASE_URL 未設定（空文字）は拒否する", () => {
    expect(isDestructiveSeedAllowed({ url: "", allowFlag: undefined })).toBe(
      false
    );
  });

  it("ALLOW_DESTRUCTIVE_SEED=1 のときだけ本番接続を許可する", () => {
    expect(
      isDestructiveSeedAllowed({ url: PRODUCTION_URL, allowFlag: "1" })
    ).toBe(true);
  });

  it("1 以外の値では解除しない", () => {
    for (const allowFlag of ["true", "yes", "0", "", " 1"]) {
      expect(
        isDestructiveSeedAllowed({ url: PRODUCTION_URL, allowFlag })
      ).toBe(false);
    }
  });
});

describe("assertDestructiveSeedAllowed", () => {
  it("ローカル接続なら何も起きない", () => {
    expect(() =>
      assertDestructiveSeedAllowed({ SUPABASE_URL: "http://127.0.0.1:54421" })
    ).not.toThrow();
  });

  it("本番接続では代替手段を示して停止する", () => {
    expect(() =>
      assertDestructiveSeedAllowed({ SUPABASE_URL: PRODUCTION_URL })
    ).toThrow(/import:production/);
  });

  it("SUPABASE_URL が未設定でも停止する", () => {
    expect(() => assertDestructiveSeedAllowed({})).toThrow(/未設定/);
  });
});

describe("destructiveSeedBlockedMessage", () => {
  it("接続先と代替手段を含める", () => {
    const message = destructiveSeedBlockedMessage(PRODUCTION_URL);

    expect(message).toContain(PRODUCTION_URL);
    expect(message).toContain("import:production");
    expect(message).toContain("ALLOW_DESTRUCTIVE_SEED=1");
  });
});
