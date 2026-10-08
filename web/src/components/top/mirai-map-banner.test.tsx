// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site.config";
import { getUiMessages } from "@/features/i18n/shared/ui-messages";
import { MiraiMapBanner } from "./mirai-map-banner";

describe("MiraiMapBanner", () => {
  it.each([
    "ja",
    "en",
  ] as const)("%s 表示で見出し・説明・ボタンラベルを出す", (locale) => {
    const { miraiMap } = getUiMessages(locale).home;
    render(<MiraiMapBanner locale={locale} />);

    expect(
      screen.getByRole("heading", { level: 2, name: miraiMap.title })
    ).toBeInTheDocument();
    expect(screen.getByText(miraiMap.badge)).toBeInTheDocument();
    expect(screen.getByText(miraiMap.description)).toBeInTheDocument();
    expect(screen.getByText(miraiMap.buttonLabel)).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: miraiMap.title })
    ).toHaveAttribute("lang", locale);
  });

  it.each([
    "ja",
    "en",
  ] as const)("%s 表示でリンクが設定先を新しいタブで安全に開く", (locale) => {
    const { miraiMap } = getUiMessages(locale).home;
    render(<MiraiMapBanner locale={locale} />);

    const link = screen.getByRole("link", { name: miraiMap.ariaLabel });
    expect(link).toHaveAttribute(
      "href",
      siteConfig.externalLinks.miraiGikaiMap
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it.each([
    "ja",
    "en",
  ] as const)("%s 表示でリンクのアクセシブルネームが表示ラベルを含む", (locale) => {
    const { miraiMap } = getUiMessages(locale).home;

    expect(miraiMap.ariaLabel).toContain(miraiMap.buttonLabel);
  });

  it("URL が空文字列なら何も描画しない", () => {
    const { container } = render(<MiraiMapBanner locale="ja" href="" />);

    expect(container).toBeEmptyDOMElement();
  });
});
