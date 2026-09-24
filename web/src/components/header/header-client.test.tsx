// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { siteConfig } from "@/config/site.config";
import type { CouncilSession } from "@/features/council-sessions/shared/types";
import { HeaderClient } from "./header-client";

// usePathname は App Router のコンテキスト外（jsdom）では値を返さない
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Server Action は next/headers の cookies() を使い、jsdom では動かない。
// このテストでは言語・難易度の切り替え操作をしないので、読み込めれば足りる
vi.mock("@/features/i18n/server/actions/set-locale", () => ({
  setLocale: vi.fn(),
}));
vi.mock(
  "@/features/bill-difficulty/server/actions/set-difficulty-level",
  () => ({
    setDifficultyLevel: vi.fn(),
  })
);

const makeSession = (
  id: string,
  slug: string,
  name: string,
  isActive: boolean
): CouncilSession => ({
  id,
  name,
  slug,
  council_url: null,
  start_date: "2026-06-01",
  end_date: null,
  is_active: isActive,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
});

const r82 = makeSession("s2", "r8-2", "令和8年第2回定例会", true);
const r81 = makeSession("s1", "r8-1", "令和8年第1回定例会", false);

function renderHeader(
  pathname: string,
  sessions: CouncilSession[],
  locale: "ja" | "en" = "ja"
) {
  vi.mocked(usePathname).mockReturnValue(pathname);
  return render(
    <HeaderClient
      difficultyLevel="normal"
      locale={locale}
      sessions={sessions}
    />
  );
}

const rubyPill = () =>
  screen.queryByRole("button", { name: "ふりがな表示の切り替え" });
const menuTrigger = () =>
  screen.getByRole("button", { name: "メニューを開く" });

describe("HeaderClient", () => {
  beforeEach(() => {
    localStorage.clear();
    // 切り替えるとページを読み直すが、jsdom は読み直しを実装していない
    vi.stubGlobal("location", { ...window.location, reload: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("ふりがなの切り替え（P8-10）", () => {
    it("メニューを開かずに押せるピル型ボタンをヘッダーに出す", () => {
      renderHeader("/councilors", [r82]);

      const pill = rubyPill();
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveAttribute("aria-pressed", "false");
      expect(pill).toHaveTextContent("ふりがな");
    });

    it("押すと押下状態になり、設定を保存してページを読み直す", async () => {
      renderHeader("/councilors", [r82]);

      await userEvent.click(rubyPill() as HTMLElement);

      expect(rubyPill()).toHaveAttribute("aria-pressed", "true");
      expect(window.location.reload).toHaveBeenCalled();
    });

    it("多言語案内ページでは出さない", () => {
      renderHeader("/guide/zh-Hans", [r82]);

      expect(rubyPill()).not.toBeInTheDocument();
    });

    it("英語表示ではルビが付かないので出さない", () => {
      renderHeader("/councilors", [r82], "en");

      expect(rubyPill()).not.toBeInTheDocument();
    });

    it("ボタンが並ぶ下層ページでは、狭い画面のサイト名を読み上げ専用にする", () => {
      renderHeader("/councilors", [r82]);
      expect(screen.getByText(siteConfig.siteName)).toHaveClass("sr-only");
    });

    it("ボタンが無い多言語案内ページでは、サイト名をそのまま見せる", () => {
      renderHeader("/guide/zh-Hans", [r82]);
      expect(screen.getByText(siteConfig.siteName)).not.toHaveClass("sr-only");
    });

    it("難易度セレクタが並ぶページでは、狭い画面でヘッダーから隠しメニューに回す", async () => {
      renderHeader("/", [r82]);

      expect(rubyPill()).toHaveClass("hidden", "sm:inline-flex");

      await userEvent.click(menuTrigger());
      const menuSwitch = screen.getByRole("switch", {
        name: "ふりがな表示の切り替え",
      });
      expect(menuSwitch.parentElement).toHaveClass("sm:hidden");
    });

    it("ほかのページでは 360px 未満でだけメニューに回す", async () => {
      renderHeader("/councilors", [r82]);

      expect(rubyPill()).toHaveClass("hidden", "xs:inline-flex");

      await userEvent.click(menuTrigger());
      const menuSwitch = screen.getByRole("switch", {
        name: "ふりがな表示の切り替え",
      });
      expect(menuSwitch.parentElement).toHaveClass("xs:hidden");
    });

    it("ヘッダーに出さないページでは、メニューにも出さない", async () => {
      renderHeader("/guide/zh-Hans", [r82]);

      await userEvent.click(menuTrigger());
      expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    });
  });

  describe("英語表示（P8-12）", () => {
    it("ナビ・難易度・ホーム導線・メニューを英語で出し、サイト名は日本語のまま", async () => {
      renderHeader("/", [r82, r81], "en");

      expect(screen.getByRole("link", { name: "Bills" })).toHaveAttribute(
        "href",
        "/sessions/r8-2/bills"
      );
      expect(
        screen.getAllByRole("link", { name: "Councilors" })[0]
      ).toBeInTheDocument();
      const difficulty = screen.getByRole("group", {
        name: "Choose how detailed the explanation is",
      });
      for (const label of ["Plain", "Standard", "Detailed"]) {
        expect(
          within(difficulty).getByRole("button", { name: label })
        ).toBeInTheDocument();
      }
      expect(screen.getByText(siteConfig.siteName)).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
      const dialog = screen.getByRole("dialog");
      expect(
        within(dialog).getByRole("link", { name: "Bills: 令和8年第1回定例会" })
      ).toBeInTheDocument();
    });

    it("下層ページのホーム導線を英語で出す", () => {
      renderHeader("/councilors", [r82], "en");

      const home = screen.getByRole("link", { name: /Home/ });
      expect(home).toHaveAttribute("href", "/");
      expect(home).toHaveAttribute("title", "Back to the home page");
    });
  });

  describe("デスクトップでのメニューの重複解消（P8-11）", () => {
    it("ヘッダーに無い項目が無ければ、デスクトップではメニューごと隠す", () => {
      renderHeader("/councilors", [r82]);

      expect(menuTrigger()).toHaveClass("lg:hidden");
    });

    it("ほかの定例会があれば、デスクトップでもその議案一覧だけを残す", async () => {
      renderHeader("/councilors", [r82, r81]);

      expect(menuTrigger()).not.toHaveClass("lg:hidden");

      await userEvent.click(menuTrigger());
      const dialog = screen.getByRole("dialog");
      const headerSessionLink = within(dialog).getByRole("link", {
        name: "令和8年第2回定例会の議案一覧",
      });
      const otherSessionLink = within(dialog).getByRole("link", {
        name: "令和8年第1回定例会の議案一覧",
      });
      expect(headerSessionLink.closest("li")).toHaveClass("lg:hidden");
      expect(otherSessionLink.closest("li")).not.toHaveClass("lg:hidden");
      expect(
        within(dialog).getByRole("link", { name: "議員一覧" })
      ).toHaveClass("lg:hidden");
      expect(
        within(dialog).getByRole("combobox").parentElement?.parentElement
      ).toHaveClass("lg:hidden");
    });
  });
});
