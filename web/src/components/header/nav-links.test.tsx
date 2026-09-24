// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CouncilSessionWithSlug } from "@/features/council-sessions/shared/types";
import { NavLinks } from "./nav-links";

const session: CouncilSessionWithSlug = {
  id: "session-1",
  name: "令和8年第2回定例会",
  slug: "r8-2",
  council_url: null,
  start_date: "2026-06-01",
  end_date: null,
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("NavLinks", () => {
  it("議案一覧・議員一覧と会期バッジを出す", () => {
    render(<NavLinks pathname="/" session={session} />);

    expect(screen.getByRole("link", { name: "議案一覧" })).toHaveAttribute(
      "href",
      "/sessions/r8-2/bills"
    );
    expect(screen.getByRole("link", { name: "議員一覧" })).toHaveAttribute(
      "href",
      "/councilors"
    );
    expect(screen.getByText("令和8年第2回定例会")).toBeInTheDocument();
  });

  it("今いるページのリンクに aria-current を付ける", () => {
    render(<NavLinks pathname="/councilors" session={session} />);

    expect(screen.getByRole("link", { name: "議員一覧" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "議案一覧" })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("定例会が無ければ議案一覧と会期バッジを出さない", () => {
    render(<NavLinks pathname="/" session={null} />);

    expect(
      screen.queryByRole("link", { name: "議案一覧" })
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/現在の会期/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "議員一覧" })).toBeInTheDocument();
  });

  it("英語表示では英語のラベルで出す", () => {
    render(<NavLinks pathname="/" session={session} locale="en" />);

    expect(screen.getByRole("link", { name: "Bills" })).toHaveAttribute(
      "href",
      "/sessions/r8-2/bills"
    );
    expect(screen.getByRole("link", { name: "Councilors" })).toHaveAttribute(
      "href",
      "/councilors"
    );
    expect(
      screen.getByRole("navigation", { name: "Main navigation" })
    ).toBeInTheDocument();
  });
});
