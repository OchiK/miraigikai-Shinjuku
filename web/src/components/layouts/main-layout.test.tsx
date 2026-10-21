// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { describe, expect, it, vi } from "vitest";
import { MainLayout } from "./main-layout";

// App Router のコンテキストを使わず、実際のルート判定を検証する。
vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

describe("MainLayout のインタビュー背景", () => {
  it.each([
    "/bills/bill-id/interview",
    "/bills/bill-id/interview/disclosure",
    "/bills/bill-id/interview/chat",
    "/preview/bills/bill-id/interview",
    "/preview/bills/bill-id/interview/disclosure",
    "/preview/bills/bill-id/interview/chat",
  ])("%s の main 全体に従来の地色を指定する", (pathname) => {
    vi.mocked(usePathname).mockReturnValue(pathname);
    render(
      <MainLayout>
        <main className="bg-background">
          <div>背景を持たないエラー表示</div>
        </main>
      </MainLayout>
    );

    const main = screen.getByRole("main");
    // 本文の高さや子要素の背景に依存せず、直下の main を塗る。
    expect(main.parentElement).toHaveClass("[&>main]:bg-mirai-surface");
    expect(main.parentElement).not.toHaveClass("sm:shadow-lg");
    expect(main).toHaveClass("bg-background");
  });

  it.each([
    "/",
    "/sessions/r8-3/bills",
    "/bills/bill-id",
    "/preview/bills/bill-id",
    "/bills/bill-id/report",
    "/faq",
  ])("%s は P8-25 のページ地を維持する", (pathname) => {
    vi.mocked(usePathname).mockReturnValue(pathname);
    render(
      <MainLayout>
        <main className="bg-background">議案などのページ</main>
      </MainLayout>
    );

    const main = screen.getByRole("main");
    expect(main.parentElement).not.toHaveClass("[&>main]:bg-mirai-surface");
    expect(main.parentElement).toHaveClass("sm:shadow-lg");
    expect(main).toHaveClass("bg-background");
  });
});
