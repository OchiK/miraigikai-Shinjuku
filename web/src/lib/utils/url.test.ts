import { describe, expect, it } from "vitest";
import { buildOriginUrl, resolveSiteUrl } from "./url";

describe("buildOriginUrl", () => {
  it("should build URL from host and proto", () => {
    expect(buildOriginUrl("example.com", "https")).toBe("https://example.com");
  });

  it("should use http proto when specified", () => {
    expect(buildOriginUrl("localhost:3000", "http")).toBe(
      "http://localhost:3000"
    );
  });

  it("should default proto to https when null", () => {
    expect(buildOriginUrl("example.com", null)).toBe("https://example.com");
  });

  it("should handle null host", () => {
    expect(buildOriginUrl(null, "https")).toBe("https://null");
  });
});

describe("resolveSiteUrl", () => {
  it("should return webUrl when set to production domain", () => {
    expect(
      resolveSiteUrl({
        webUrl: "https://miraigikai-shinjuku-web.vercel.app",
        vercelUrl: "miraigikai-preview-123.vercel.app",
      })
    ).toBe("https://miraigikai-shinjuku-web.vercel.app");
  });

  it("should strip trailing slashes", () => {
    expect(
      resolveSiteUrl({
        webUrl: "https://miraigikai-shinjuku-web.vercel.app/",
      })
    ).toBe("https://miraigikai-shinjuku-web.vercel.app");
  });

  it("should fall back to vercelProjectProductionUrl when webUrl is localhost default", () => {
    expect(
      resolveSiteUrl({
        webUrl: "http://localhost:3000",
        vercelProjectProductionUrl: "miraigikai-shinjuku-web.vercel.app",
      })
    ).toBe("https://miraigikai-shinjuku-web.vercel.app");
  });

  it("should fall back to vercelUrl when webUrl is localhost and production url is empty", () => {
    expect(
      resolveSiteUrl({
        webUrl: "http://localhost:3000",
        vercelUrl: "miraigikai-preview-123.vercel.app",
      })
    ).toBe("https://miraigikai-preview-123.vercel.app");
  });

  it("should return localhost:3000 when no options or env vars are set", () => {
    expect(
      resolveSiteUrl({
        webUrl: "",
        vercelProjectProductionUrl: "",
        vercelUrl: "",
      })
    ).toBe("http://localhost:3000");
  });
});
