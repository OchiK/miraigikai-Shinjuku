import { describe, expect, it } from "vitest";
import type { CouncilSession } from "../types";
import {
  hasSessionsBesides,
  hasSlug,
  pickHeaderSession,
} from "./pick-header-session";

function session(overrides: Partial<CouncilSession>): CouncilSession {
  return {
    id: "id",
    name: "令和8年第2回定例会",
    slug: "r8-2",
    council_url: null,
    start_date: "2026-06-01",
    end_date: null,
    is_active: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("hasSlug", () => {
  it("slug があれば true、null や空文字なら false", () => {
    expect(hasSlug(session({ slug: "r8-2" }))).toBe(true);
    expect(hasSlug(session({ slug: null }))).toBe(false);
    expect(hasSlug(session({ slug: "" }))).toBe(false);
  });
});

describe("pickHeaderSession", () => {
  it("アクティブな定例会を優先する", () => {
    const sessions = [
      session({ id: "new", slug: "r8-3" }),
      session({ id: "active", slug: "r8-2", is_active: true }),
    ];
    expect(pickHeaderSession(sessions)?.id).toBe("active");
  });

  it("アクティブな定例会が無ければ先頭（最新）を返す", () => {
    const sessions = [
      session({ id: "new", slug: "r8-3" }),
      session({ id: "old", slug: "r8-2" }),
    ];
    expect(pickHeaderSession(sessions)?.id).toBe("new");
  });

  it("slug の無い定例会は、アクティブでも選ばない", () => {
    const sessions = [
      session({ id: "active-no-slug", slug: null, is_active: true }),
      session({ id: "old", slug: "r8-2" }),
    ];
    expect(pickHeaderSession(sessions)?.id).toBe("old");
  });

  it("選べる定例会が無ければ null", () => {
    expect(pickHeaderSession([])).toBeNull();
    expect(pickHeaderSession([session({ slug: null })])).toBeNull();
  });
});

describe("hasSessionsBesides", () => {
  const header = { ...session({ id: "r8-2", slug: "r8-2" }), slug: "r8-2" };

  it("ヘッダーの定例会しか無ければ false", () => {
    expect(hasSessionsBesides([header], header)).toBe(false);
  });

  it("slug のあるほかの定例会があれば true", () => {
    const other = session({ id: "r8-1", slug: "r8-1" });
    expect(hasSessionsBesides([header, other], header)).toBe(true);
  });

  it("slug の無い定例会は数えない", () => {
    const noSlug = session({ id: "r7-4", slug: null });
    expect(hasSessionsBesides([header, noSlug], header)).toBe(false);
  });

  it("ヘッダーの定例会が無ければ、slug のある定例会があるかで決まる", () => {
    expect(hasSessionsBesides([], null)).toBe(false);
    expect(hasSessionsBesides([session({ slug: null })], null)).toBe(false);
  });
});
