// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Footer } from "./footer";

// usePathname は App Router のコンテキスト外（jsdom）では値を返さない
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

describe("Footer", () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue("/");
  });

  it("省略時は日本語で出す", () => {
    render(<Footer />);

    expect(screen.getByRole("link", { name: "利用規約" })).toHaveAttribute(
      "href",
      "/terms"
    );
    expect(
      screen.getByText(
        "これは政党チームみらいが運営しているものではありません。"
      )
    ).toBeInTheDocument();
  });

  it("英語表示ではリンク・免責・著作権表示を英語で出す", () => {
    render(<Footer locale="en" />);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByRole("link", { name: "Terms of Use" })).toHaveAttribute(
      "href",
      "/terms"
    );
    expect(
      screen.getByRole("link", { name: "Privacy Policy" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "FAQ" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "This site is not run by the political party Team Mirai."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Operator: Shinjuku Resident A/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/非公式サービス/)).not.toBeInTheDocument();
  });

  it("インタビューページでは出さない", () => {
    vi.mocked(usePathname).mockReturnValue("/bills/abc/interview/chat");
    const { container } = render(<Footer locale="en" />);
    expect(container).toBeEmptyDOMElement();
  });
});
