// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CouncilSession } from "../../shared/types";
import { CurrentSessionHeader } from "./current-session-header";

const session: CouncilSession = {
  id: "s3",
  name: "令和8年第3回定例会",
  slug: "r8-3",
  council_url: null,
  start_date: "2026-09-01",
  end_date: "2026-10-15",
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("CurrentSessionHeader", () => {
  it("定例会名・開会中バッジ・会期（開始日〜終了日）を出す", () => {
    render(<CurrentSessionHeader session={session} isInSession />);

    expect(
      screen.getByRole("heading", { name: "令和8年第3回定例会" })
    ).toBeInTheDocument();
    expect(screen.getByText("開会中")).toBeInTheDocument();
    expect(screen.getByText("2026.9.1〜2026.10.15")).toBeInTheDocument();
  });

  it("閉会中は「閉会中」を出す", () => {
    render(<CurrentSessionHeader session={session} isInSession={false} />);
    expect(screen.getByText("閉会中")).toBeInTheDocument();
  });

  it("終了日が未定なら開始日だけを出す", () => {
    render(
      <CurrentSessionHeader
        session={{ ...session, end_date: null }}
        isInSession
      />
    );
    expect(screen.getByText("2026.9.1〜")).toBeInTheDocument();
  });

  it("英語表示では英語で出す", () => {
    render(<CurrentSessionHeader session={session} isInSession locale="en" />);
    expect(screen.getByText("In session")).toBeInTheDocument();
    expect(screen.getByText("2026.9.1 – 2026.10.15")).toBeInTheDocument();
  });
});
