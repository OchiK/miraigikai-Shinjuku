// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site.config";
import { HomeLink } from "./home-link";

describe("HomeLink", () => {
  it("トップページではサイト名だけのリンクにする", () => {
    render(<HomeLink isHome />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/");
    expect(link).toHaveAccessibleName(siteConfig.siteName);
    expect(link).not.toHaveAttribute("title");
  });

  it("下層ページでは「トップへ」を足してトップへ戻れることを示す", () => {
    render(<HomeLink isHome={false} />);

    const link = screen.getByRole("link", { name: /トップへ/ });
    expect(link).toHaveAttribute("href", "/");
    expect(link).toHaveAccessibleName(
      expect.stringContaining(siteConfig.siteName)
    );
    expect(link).toHaveAttribute("title", "トップページへ戻る");
  });

  it("狭いヘッダーの下層ページでも、サイト名は読み上げ用に残す", () => {
    render(<HomeLink isHome={false} compact />);

    const link = screen.getByRole("link", { name: /トップへ/ });
    expect(link).toHaveAccessibleName(
      expect.stringContaining(siteConfig.siteName)
    );
    expect(screen.getByText(siteConfig.siteName)).toHaveClass("sr-only");
  });
});
