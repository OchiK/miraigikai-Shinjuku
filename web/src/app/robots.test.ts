import { afterEach, beforeEach, describe, expect, it } from "vitest";
import robots from "./robots";

describe("robots()", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("staging環境では全ページをクロール拒否する", () => {
    process.env.VERCEL_TARGET_ENV = "staging";
    const result = robots();
    expect(result).toEqual({
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    });
  });

  it("本番環境では公開ページを許可し、api/devを除外してsitemapを指す", () => {
    delete process.env.VERCEL_TARGET_ENV;
    process.env.NEXT_PUBLIC_WEB_URL =
      "https://miraigikai-shinjuku-web.vercel.app";
    const result = robots();
    expect(result).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dev/"],
      },
      sitemap: "https://miraigikai-shinjuku-web.vercel.app/sitemap.xml",
    });
  });
});
