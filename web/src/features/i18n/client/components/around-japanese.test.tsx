// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AroundJapanese } from "./around-japanese";

describe("AroundJapanese", () => {
  it("前後の文言の間に、差し込んだ日本語を lang=ja で挟む", () => {
    const { container } = render(
      <p>
        <AroundJapanese around={{ before: "Bills: ", after: " (2026)" }}>
          令和8年第2回定例会
        </AroundJapanese>
      </p>
    );

    expect(screen.getByText("令和8年第2回定例会")).toHaveAttribute(
      "lang",
      "ja"
    );
    expect(container).toHaveTextContent("Bills: 令和8年第2回定例会 (2026)");
  });
});
