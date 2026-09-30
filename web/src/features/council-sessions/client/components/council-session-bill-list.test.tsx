// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CouncilSession } from "../../shared/types";
import { CouncilSessionBillList } from "./council-session-bill-list";

// フィルター付き一覧はこのテストの対象外（見出しだけを確かめる）
vi.mock("./bill-list-with-status-filter", () => ({
  BillListWithStatusFilter: () => null,
}));

const makeSession = (isActive: boolean): CouncilSession => ({
  id: "s3",
  name: "令和8年第3回定例会",
  slug: "r8-3",
  council_url: null,
  start_date: "2026-09-01",
  end_date: "2026-10-15",
  is_active: isActive,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
});

describe("CouncilSessionBillList のヘッダー", () => {
  it("現在の定例会では Archive を出さず、定例会名と最新バッジを出す", () => {
    render(<CouncilSessionBillList session={makeSession(true)} bills={[]} />);

    expect(screen.queryByAltText("Archive")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /令和8年第3回定例会/ })
    ).toBeInTheDocument();
    expect(screen.getByText("最新")).toBeInTheDocument();
    expect(
      screen.getByText("現在審議されている議案の一覧")
    ).toBeInTheDocument();
  });

  it("終わった定例会では Archive を出す", () => {
    render(<CouncilSessionBillList session={makeSession(false)} bills={[]} />);

    expect(screen.getByAltText("Archive")).toBeInTheDocument();
    expect(screen.queryByText("最新")).not.toBeInTheDocument();
  });
});
