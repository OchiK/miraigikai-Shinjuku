// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SEGMENT_SELECTED_CLASS,
  SEGMENT_UNSELECTED_CLASS,
} from "@/lib/segment-control-styles";
import { setDifficultyLevel } from "../../server/actions/set-difficulty-level";
import { DifficultySelector } from "./difficulty-selector";

// setDifficultyLevel は next/headers の cookies() を使い、リクエスト外の jsdom では動かない。
// Cookie を書く本体は set-difficulty-level.integration.test.ts で確かめているので、
// ここでは呼び出しだけを見る
vi.mock("../../server/actions/set-difficulty-level", () => ({
  setDifficultyLevel: vi.fn().mockResolvedValue(undefined),
}));

describe("DifficultySelector", () => {
  beforeEach(() => {
    vi.mocked(setDifficultyLevel).mockClear();
    // jsdom はページの読み直しを実装していないため差し替える
    vi.stubGlobal("location", {
      href: "http://localhost/bills/1",
      reload: vi.fn(),
      replace: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("3段階を並べ、現在の段階を押下状態にする", () => {
    render(<DifficultySelector currentLevel="normal" />);

    expect(
      screen.getByRole("group", { name: "説明の詳しさを切り替え" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "やさしい" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(screen.getByRole("button", { name: "ふつう" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "くわしく" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("別の段階を押すと setDifficultyLevel を呼び、押下状態を移す", async () => {
    const user = userEvent.setup();
    render(<DifficultySelector currentLevel="normal" />);

    await user.click(screen.getByRole("button", { name: "やさしい" }));

    expect(setDifficultyLevel).toHaveBeenCalledWith("easy");
    expect(screen.getByRole("button", { name: "やさしい" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "ふつう" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(window.location.reload).toHaveBeenCalled();
  });

  it("今の段階を押しても setDifficultyLevel を呼ばない", async () => {
    const user = userEvent.setup();
    render(<DifficultySelector currentLevel="normal" />);

    await user.click(screen.getByRole("button", { name: "ふつう" }));

    expect(setDifficultyLevel).not.toHaveBeenCalled();
  });

  it("配色は共有モジュールのクラスを使い、Button 既定のホバー・リング色を残さない", () => {
    render(<DifficultySelector currentLevel="hard" />);

    const group = screen.getByRole("group", { name: "説明の詳しさを切り替え" });
    const selected = screen.getByRole("button", { name: "くわしく" });
    const unselected = screen.getByRole("button", { name: "やさしい" });
    const classesOf = (el: HTMLElement) => el.className.split(/\s+/);

    expect(group).toHaveClass("bg-neutral-100");
    expect(selected).toHaveClass(...SEGMENT_SELECTED_CLASS.split(" "));
    expect(unselected).toHaveClass(...SEGMENT_UNSELECTED_CLASS.split(" "));
    expect(unselected).not.toHaveClass("bg-primary");
    for (const button of [selected, unselected]) {
      expect(classesOf(button)).not.toContain("focus-visible:ring-primary/40");
      expect(classesOf(button)).not.toContain("hover:bg-accent");
      expect(classesOf(button)).not.toContain("hover:text-accent-foreground");
    }
  });
});
