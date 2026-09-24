// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createMockBill } from "@/app/dev/_lib/mock-data";
import { FeaturedBillSection } from "./featured-bill-section";

const makeBills = (count: number) =>
  Array.from({ length: count }, (_, i) =>
    createMockBill({
      id: `bill-${i + 1}`,
      is_featured: true,
      bill_content: {
        id: `content-${i + 1}`,
        bill_id: `bill-${i + 1}`,
        title: `注目議案${i + 1}`,
        summary: "要約",
        content: "",
        difficulty_level: "normal",
        created_at: "2026-02-15T00:00:00Z",
        updated_at: "2026-02-15T00:00:00Z",
      },
    })
  );

const cardLinks = () =>
  screen
    .getAllByRole("link")
    .filter((a) => a.getAttribute("href")?.includes("/bills/bill-"));

describe("FeaturedBillSection", () => {
  it("0件ならセクションを出さない", () => {
    const { container } = render(<FeaturedBillSection bills={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("1件なら全幅のカードを1枚出す", () => {
    render(<FeaturedBillSection bills={makeBills(1)} />);
    const links = cardLinks();
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveClass("md:col-span-2");
    expect(screen.getByText("注目議案1")).toBeInTheDocument();
  });

  it("2件なら2カラムに並べ、全幅のカードは作らない", () => {
    render(<FeaturedBillSection bills={makeBills(2)} />);
    const links = cardLinks();
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).not.toHaveClass("md:col-span-2");
    }
  });

  it("3件なら先頭だけを全幅の主役カードにする", () => {
    render(<FeaturedBillSection bills={makeBills(3)} />);
    const links = cardLinks();
    expect(links).toHaveLength(3);
    expect(links.map((l) => l.classList.contains("md:col-span-2"))).toEqual([
      true,
      false,
      false,
    ]);
    expect(links[0]).toHaveAttribute("href", expect.stringContaining("bill-1"));
  });
});
