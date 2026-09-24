// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LanguageSelector } from "./language-selector";

describe("LanguageSelector", () => {
  it("日本語と English だけを選べる", () => {
    render(<LanguageSelector currentLocale="ja" />);

    const select = screen.getByLabelText("言語 / Language");
    expect(select).toHaveValue("ja");
    expect(
      screen.getAllByRole("option").map((option) => option.textContent)
    ).toEqual(["日本語", "English"]);
  });

  it("多言語案内ページへのリンクを出さない（P8-3）", () => {
    render(<LanguageSelector currentLocale="ja" />);

    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.queryByText(/Language guides/)).not.toBeInTheDocument();
  });
});
