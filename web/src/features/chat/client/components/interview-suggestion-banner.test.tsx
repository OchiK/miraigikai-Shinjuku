// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InterviewSuggestionBanner } from "./interview-suggestion-banner";

describe("InterviewSuggestionBanner", () => {
  it("日本語の案内を表示する", () => {
    render(<InterviewSuggestionBanner billId="bill-1" billName="議案第1号" />);

    expect(screen.getByText("議案の当事者の方へ")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /AIインタビューを受ける/ })
    ).toBeTruthy();
  });

  it("英語表示ではバナー内のすべての固定文言を英語にする", () => {
    const { container } = render(
      <InterviewSuggestionBanner
        billId="bill-1"
        billName="Bill No. 1"
        locale="en"
      />
    );

    expect(screen.getByText("For people affected by this bill")).toBeTruthy();
    expect(screen.getByText("Share your views on Bill No. 1")).toBeTruthy();
    expect(screen.getByText("Takes about 5 minutes or more")).toBeTruthy();
    expect(
      screen.getByText("AI asks follow-up questions about your views")
    ).toBeTruthy();
    expect(
      screen.getByText("Your input will inform policy discussions")
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /Start the AI interview/ })
    ).toBeTruthy();
    expect(container.textContent).not.toMatch(/[぀-ヿ一-鿿]/);
  });
});
