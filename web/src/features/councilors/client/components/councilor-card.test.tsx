// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Councilor } from "../../shared/types";
import { CouncilorCard } from "./councilor-card";

const councilor: Councilor = {
  id: "c1",
  name: "新宿 花子",
  nameKana: "しんじゅく はなこ",
  factionRole: "幹事長",
  terms: 3,
  officialUrl: null,
  websiteUrl: null,
  xUrl: null,
  sortOrder: 1,
  faction: null,
  committees: [
    {
      id: "k1",
      name: "総務区民委員会",
      role: "委員長",
      kind: "standing",
      sortOrder: 1,
    },
    {
      id: "k2",
      name: "福祉健康委員会",
      role: "委員",
      kind: "standing",
      sortOrder: 2,
    },
  ],
  questionsCount: 1,
  questionVenueCounts: { plenary: 1, budget: 0, committee: 0 },
  latestQuestionDate: "2026-06-10",
};

describe("CouncilorCard", () => {
  it("省略時は日本語の表記で出す", () => {
    render(<CouncilorCard councilor={councilor} />);
    expect(screen.getByText("3期")).toBeInTheDocument();
    expect(screen.getByText("質問 1件")).toBeInTheDocument();
    expect(screen.getByText("総務区民委員会").parentElement).toHaveTextContent(
      "総務区民委員会（委員長）、福祉健康委員会"
    );
  });

  it("英語表示では UI 文言を英語にし、氏名・役職・委員会名は lang=ja のまま出す", () => {
    render(<CouncilorCard councilor={councilor} locale="en" />);
    expect(screen.getByText("3 terms")).toBeInTheDocument();
    expect(screen.getByText("1 question")).toBeInTheDocument();
    expect(screen.getByText("新宿 花子")).toHaveAttribute("lang", "ja");
    expect(screen.getByText("幹事長")).toHaveAttribute("lang", "ja");
    expect(screen.getByText("総務区民委員会")).toHaveAttribute("lang", "ja");
    expect(screen.getByText("総務区民委員会").parentElement).toHaveTextContent(
      "総務区民委員会 (Chair), 福祉健康委員会"
    );
  });
});
