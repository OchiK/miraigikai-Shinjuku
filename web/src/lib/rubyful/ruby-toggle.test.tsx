// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SEGMENT_SELECTED_CLASS,
  SEGMENT_UNSELECTED_CLASS,
} from "@/lib/segment-control-styles";
import { RubyToggle } from "./ruby-toggle";

describe("RubyToggle (pill)", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // 切り替えるとページを読み直すため、jsdom 未実装の reload を差し替える
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, reload: vi.fn() },
      writable: true,
    });
    localStorage.clear();
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  const getPill = () =>
    screen.getByRole("button", { name: "ふりがな表示の切り替え" });

  it("押すたびに aria-pressed を切り替える", async () => {
    const user = userEvent.setup();
    render(<RubyToggle variant="pill" />);

    expect(getPill()).toHaveAttribute("aria-pressed", "false");
    await user.click(getPill());
    expect(getPill()).toHaveAttribute("aria-pressed", "true");
    await user.click(getPill());
    expect(getPill()).toHaveAttribute("aria-pressed", "false");
  });

  it("className は Button ではなく地のラッパーに付く", () => {
    render(<RubyToggle variant="pill" className="hidden sm:inline-flex" />);

    const pill = getPill();
    const wrapper = pill.parentElement as HTMLElement;
    const classesOf = (el: HTMLElement) => el.className.split(/\s+/);

    expect(wrapper).toHaveClass("hidden", "sm:inline-flex", "bg-neutral-100");
    // ヘッダーの hidden が基本の inline-flex に負けない
    expect(classesOf(wrapper)).not.toContain("inline-flex");
    expect(pill).not.toHaveClass("hidden");
    expect(pill).not.toHaveClass("sm:inline-flex");
  });

  it("オフは非選択、オンは選択中のクラスを使い、オン中のホバーは影で示す", () => {
    const { unmount } = render(<RubyToggle variant="pill" />);
    expect(getPill()).toHaveClass(...SEGMENT_UNSELECTED_CLASS.split(" "));
    expect(getPill()).not.toHaveClass("hover:shadow-mirai-md");
    unmount();

    localStorage.setItem("rubyful-enabled", "true");
    render(<RubyToggle variant="pill" />);
    const pill = getPill();
    const classes = pill.className.split(/\s+/);

    expect(pill).toHaveAttribute("aria-pressed", "true");
    expect(pill).toHaveClass(
      ...SEGMENT_SELECTED_CLASS.split(" "),
      "hover:shadow-mirai-md"
    );
    expect(classes).not.toContain("focus-visible:ring-primary/40");
    expect(classes).not.toContain("hover:bg-accent");
    expect(classes).not.toContain("hover:text-accent-foreground");
  });
});
