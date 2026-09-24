// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setLocale } from "../../server/actions/set-locale";
import { LanguageToggle } from "./language-toggle";

// setLocale は next/headers の cookies() を使い、リクエスト外の jsdom では動かない。
// Cookie を書く本体（setLocaleCore）は set-locale-core.integration.test.ts で
// モックなしに確かめているので、ここでは呼び出しだけを見る
vi.mock("../../server/actions/set-locale", () => ({
  setLocale: vi.fn().mockResolvedValue(undefined),
}));

describe("LanguageToggle", () => {
  beforeEach(() => {
    vi.mocked(setLocale).mockClear();
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

  it("日本語と English を自言語表記で並べ、現在の言語を押下状態にする", () => {
    render(<LanguageToggle currentLocale="en" />);

    expect(
      screen.getByRole("group", { name: "言語 / Language" })
    ).toBeInTheDocument();
    const ja = screen.getByRole("button", { name: "日本語" });
    const en = screen.getByRole("button", { name: "English" });
    expect(ja).toHaveAttribute("aria-pressed", "false");
    expect(en).toHaveAttribute("aria-pressed", "true");
    expect(en).toHaveAttribute("lang", "en");
  });

  it("別の言語を押すと setLocale を呼び、押下状態を移す", async () => {
    const user = userEvent.setup();
    render(<LanguageToggle currentLocale="ja" />);

    await user.click(screen.getByRole("button", { name: "English" }));

    expect(setLocale).toHaveBeenCalledWith("en");
    expect(screen.getByRole("button", { name: "English" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(window.location.reload).toHaveBeenCalled();
  });

  it("?lang があれば外した URL へ移る", async () => {
    const user = userEvent.setup();
    window.location.href = "http://localhost/bills/1?lang=ja";
    render(<LanguageToggle currentLocale="ja" />);

    await user.click(screen.getByRole("button", { name: "English" }));

    expect(window.location.replace).toHaveBeenCalledWith(
      "http://localhost/bills/1"
    );
  });

  it("保存に失敗したら元の言語に戻し、再び押せるようにする", async () => {
    const user = userEvent.setup();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(setLocale).mockRejectedValueOnce(new Error("failed"));
    render(<LanguageToggle currentLocale="ja" />);

    await user.click(screen.getByRole("button", { name: "English" }));

    expect(screen.getByRole("button", { name: "日本語" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "English" })).toBeEnabled();
    expect(window.location.reload).not.toHaveBeenCalled();
  });

  it("今の言語を押しても setLocale を呼ばない", async () => {
    const user = userEvent.setup();
    render(<LanguageToggle currentLocale="ja" />);

    await user.click(screen.getByRole("button", { name: "日本語" }));

    expect(setLocale).not.toHaveBeenCalled();
  });
});
