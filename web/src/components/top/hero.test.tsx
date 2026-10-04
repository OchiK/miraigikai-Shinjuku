// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site.config";
import { Hero } from "./hero";

describe("Hero", () => {
  it("日本語表示でサイト名バッジとヒーロー見出しを表示する", () => {
    render(<Hero locale="ja" />);

    expect(screen.getByText(siteConfig.siteName)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("英語表示で英語サイト名バッジを表示する", () => {
    render(<Hero locale="en" />);

    expect(screen.getByText(siteConfig.english.siteName)).toBeInTheDocument();
  });
});
