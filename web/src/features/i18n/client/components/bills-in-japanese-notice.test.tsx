// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BillsInJapaneseNotice } from "./bills-in-japanese-notice";

describe("BillsInJapaneseNotice", () => {
  it("英語表示では、議案名等が日本語のままであることを案内する", () => {
    render(<BillsInJapaneseNotice locale="en" />);
    expect(screen.getByText(/shown in Japanese/)).toBeInTheDocument();
  });

  it("日本語表示では何も出さない", () => {
    const { container } = render(<BillsInJapaneseNotice locale="ja" />);
    expect(container).toBeEmptyDOMElement();
  });
});
