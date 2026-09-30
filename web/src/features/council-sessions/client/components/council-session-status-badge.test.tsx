// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CouncilSessionStatusBadge } from "./council-session-status-badge";

describe("CouncilSessionStatusBadge", () => {
  it("会期中は「開会中」、そうでなければ「閉会中」と出す", () => {
    const { rerender } = render(<CouncilSessionStatusBadge isInSession />);
    expect(screen.getByText("開会中")).toBeInTheDocument();

    rerender(<CouncilSessionStatusBadge isInSession={false} />);
    expect(screen.getByText("閉会中")).toBeInTheDocument();
  });

  it("英語表示では英語で出す", () => {
    render(<CouncilSessionStatusBadge isInSession locale="en" />);
    expect(screen.getByText("In session")).toBeInTheDocument();
  });
});
