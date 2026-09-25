import { describe, expect, it } from "vitest";

import {
  extractBillIdFromPath,
  hasChatSidebar,
  isInterviewPage,
  isInterviewSection,
  isMainPage,
} from "./page-layout-utils";

describe("isMainPage", () => {
  it("returns true for the top page", () => {
    expect(isMainPage("/")).toBe(true);
  });

  it("returns true for a bill detail page", () => {
    expect(isMainPage("/bills/abc-123")).toBe(true);
  });

  it("returns false for a bill sub-page", () => {
    expect(isMainPage("/bills/abc-123/interview")).toBe(false);
  });

  it("returns false for an unrelated path", () => {
    expect(isMainPage("/about")).toBe(false);
  });

  it("returns false for the bills list page", () => {
    expect(isMainPage("/bills")).toBe(false);
    expect(isMainPage("/bills/")).toBe(false);
  });

  it("returns true for a council session bills page", () => {
    expect(isMainPage("/sessions/r8-2/bills")).toBe(true);
    expect(isMainPage("/sessions/r8-3/bills")).toBe(true);
  });

  it("returns false for session paths other than the bills page", () => {
    expect(isMainPage("/sessions")).toBe(false);
    expect(isMainPage("/sessions/r8-2")).toBe(false);
    expect(isMainPage("/sessions/r8-2/bills/")).toBe(false);
  });
});

describe("hasChatSidebar", () => {
  it("returns true for a bill detail page", () => {
    expect(hasChatSidebar("/bills/abc-123")).toBe(true);
  });

  it("returns false for the top page", () => {
    expect(hasChatSidebar("/")).toBe(false);
  });

  it("returns false for a bill sub-page", () => {
    expect(hasChatSidebar("/bills/abc-123/interview")).toBe(false);
  });

  it("returns false for the bills list page", () => {
    expect(hasChatSidebar("/bills")).toBe(false);
    expect(hasChatSidebar("/bills/")).toBe(false);
  });

  it("returns false for an unrelated path", () => {
    expect(hasChatSidebar("/about")).toBe(false);
  });

  it("returns false for a council session bills page", () => {
    expect(hasChatSidebar("/sessions/r8-2/bills")).toBe(false);
  });
});

describe("isInterviewPage", () => {
  it("returns true for an interview chat page", () => {
    expect(isInterviewPage("/bills/abc-123/interview/chat")).toBe(true);
  });

  it("returns false for an interview page without /chat", () => {
    expect(isInterviewPage("/bills/abc-123/interview")).toBe(false);
  });

  it("returns false for a bill detail page", () => {
    expect(isInterviewPage("/bills/abc-123")).toBe(false);
  });

  it("returns false for the top page", () => {
    expect(isInterviewPage("/")).toBe(false);
  });
});

describe("isInterviewSection", () => {
  it("returns true for the interview LP page", () => {
    expect(isInterviewSection("/bills/abc-123/interview")).toBe(true);
  });

  it("returns true for the interview chat page", () => {
    expect(isInterviewSection("/bills/abc-123/interview/chat")).toBe(true);
  });

  it("returns false for a bill detail page", () => {
    expect(isInterviewSection("/bills/abc-123")).toBe(false);
  });

  it("returns false for the top page", () => {
    expect(isInterviewSection("/")).toBe(false);
  });

  it("returns false for unrelated paths", () => {
    expect(isInterviewSection("/about")).toBe(false);
  });
});

describe("extractBillIdFromPath", () => {
  it("extracts bill ID from a bill detail path", () => {
    expect(extractBillIdFromPath("/bills/abc-123")).toBe("abc-123");
  });

  it("extracts bill ID from a bill sub-path", () => {
    expect(extractBillIdFromPath("/bills/abc-123/interview/chat")).toBe(
      "abc-123"
    );
  });

  it("returns null when path does not contain /bills/", () => {
    expect(extractBillIdFromPath("/about")).toBeNull();
  });

  it("returns null for the top page", () => {
    expect(extractBillIdFromPath("/")).toBeNull();
  });
});
