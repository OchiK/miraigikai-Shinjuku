// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BillStatusBadge } from "./bill-status-badge";

describe("BillStatusBadge", () => {
  it("省略時は日本語のラベルを出す", () => {
    render(<BillStatusBadge status="approved" />);
    expect(screen.getByText("可決")).toBeInTheDocument();
  });

  it("英語表示では議決用語を区別したまま英語で出す", () => {
    render(
      <BillStatusBadge
        status="approved"
        statusNote="本会議で承認"
        locale="en"
      />
    );
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("英語表示の審議中", () => {
    render(<BillStatusBadge status="in_committee" locale="en" />);
    expect(screen.getByText("Under deliberation")).toBeInTheDocument();
  });
});
