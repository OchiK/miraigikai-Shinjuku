// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type {
  CommitteeRole,
  Councilor,
  CouncilorCommittee,
  CouncilorFaction,
} from "../../shared/types";
import { getCommitteeKind } from "../../shared/utils/committee-kind";
import { CouncilorListView } from "./councilor-list-view";

const jimin: CouncilorFaction = {
  id: "jimin",
  slug: "jimin-sansei",
  displayName: "自民・参政クラブ",
  sortOrder: 1,
};
const komei: CouncilorFaction = {
  id: "komei",
  slug: "komei",
  displayName: "新宿区議会公明党",
  sortOrder: 2,
};

const committeeOrders: Record<string, number> = {
  総務区民委員会: 1,
  福祉健康委員会: 4,
  議会運営委員会: 5,
  防災等安全対策特別委員会: 6,
};
const membership = (name: string, role: CommitteeRole): CouncilorCommittee => ({
  id: name,
  name,
  role,
  kind: getCommitteeKind(name),
  sortOrder: committeeOrders[name],
});

const councilor = (
  overrides: Partial<Councilor> &
    Pick<Councilor, "id" | "name" | "nameKana" | "sortOrder">
): Councilor => ({
  factionRole: null,
  terms: 1,
  officialUrl: null,
  websiteUrl: null,
  xUrl: null,
  faction: null,
  committees: [],
  questionsCount: 0,
  questionVenueCounts: { plenary: 0, budget: 0, committee: 0 },
  latestQuestionDate: null,
  ...overrides,
});

const councilors = [
  councilor({
    id: "a",
    name: "佐藤 一郎",
    nameKana: "さとう いちろう",
    sortOrder: 1,
    faction: jimin,
    committees: [
      membership("総務区民委員会", "委員長"),
      membership("防災等安全対策特別委員会", "委員"),
    ],
  }),
  councilor({
    id: "b",
    name: "鈴木 花子",
    nameKana: "すずき はなこ",
    sortOrder: 2,
    faction: komei,
    committees: [
      membership("総務区民委員会", "委員"),
      membership("議会運営委員会", "副委員長"),
    ],
  }),
  councilor({
    id: "c",
    name: "高橋 次郎",
    nameKana: "たかはし じろう",
    sortOrder: 3,
    faction: jimin,
    committees: [
      membership("福祉健康委員会", "委員"),
      membership("防災等安全対策特別委員会", "委員長"),
    ],
  }),
];

const headings = () =>
  screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);

describe("CouncilorListView", () => {
  it("初期表示は会派別で、切り替えボタンの aria-pressed が合っている", () => {
    render(<CouncilorListView councilors={councilors} />);
    expect(screen.getByRole("button", { name: "会派別" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "委員会別" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(screen.getByText("3人を表示しています")).toBeInTheDocument();
    expect(headings()).toEqual(["自民・参政クラブ", "新宿区議会公明党"]);
  });

  it("委員会別では委員会ごとのセクションを種別順に出し、件数は重複を除いた人数にする", async () => {
    const user = userEvent.setup();
    render(<CouncilorListView councilors={councilors} />);
    await user.click(screen.getByRole("button", { name: "委員会別" }));

    expect(screen.getByRole("button", { name: "委員会別" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(headings()).toEqual([
      "総務区民委員会",
      "福祉健康委員会",
      "議会運営委員会",
      "防災等安全対策特別委員会",
    ]);
    // 延べ6件だが、議員は3人
    expect(
      screen.getByText("4委員会・3人を表示しています")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "すべて 3" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("表示を切り替えても検索語が残る", async () => {
    const user = userEvent.setup();
    render(<CouncilorListView councilors={councilors} />);
    await user.type(screen.getByRole("searchbox"), "さとう");
    await user.click(screen.getByRole("button", { name: "委員会別" }));

    expect(screen.getByRole("searchbox")).toHaveValue("さとう");
    expect(
      screen.getByText("2委員会・1人を表示しています")
    ).toBeInTheDocument();
  });

  it("会派で絞り込んでから委員会別に切り替えても、会派フィルタは効かない", async () => {
    const user = userEvent.setup();
    render(<CouncilorListView councilors={councilors} />);
    await user.click(
      screen.getByRole("button", { name: "新宿区議会公明党 1" })
    );
    expect(screen.getByText("1人を表示しています")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "委員会別" }));
    expect(
      screen.getByText("4委員会・3人を表示しています")
    ).toBeInTheDocument();

    // 会派別に戻ると会派フィルタは残っている
    await user.click(screen.getByRole("button", { name: "会派別" }));
    expect(screen.getByText("1人を表示しています")).toBeInTheDocument();
  });

  it("委員会のチップで1委員会だけにし、委員長 → 委員の順に並べる", async () => {
    const user = userEvent.setup();
    render(<CouncilorListView councilors={councilors} />);
    await user.click(screen.getByRole("button", { name: "委員会別" }));
    await user.click(
      screen.getByRole("button", { name: "防災等安全対策特別委員会 2" })
    );

    expect(headings()).toEqual(["防災等安全対策特別委員会"]);
    expect(
      screen.getByText("1委員会・2人を表示しています")
    ).toBeInTheDocument();
    const names = screen
      .getAllByRole("link")
      .map((link) => link.querySelector("p")?.textContent);
    expect(names).toEqual(["高橋 次郎", "佐藤 一郎"]);
    expect(screen.getByText("委員長")).toBeInTheDocument();
  });

  it("該当する議員がいなければメッセージを出す", async () => {
    const user = userEvent.setup();
    render(<CouncilorListView councilors={councilors} />);
    await user.click(screen.getByRole("button", { name: "委員会別" }));
    await user.type(screen.getByRole("searchbox"), "該当なし");

    expect(screen.getByText("該当する議員がいません")).toBeInTheDocument();
    expect(screen.queryAllByRole("heading", { level: 2 })).toEqual([]);
  });

  it("英語表示では切り替えと件数を英語にする", async () => {
    const user = userEvent.setup();
    render(<CouncilorListView councilors={councilors} locale="en" />);
    await user.click(screen.getByRole("button", { name: "By committee" }));

    expect(screen.getByText("Filter by committee")).toBeInTheDocument();
    expect(
      screen.getByText("Showing 3 councilors in 4 committees")
    ).toBeInTheDocument();
    expect(screen.getAllByText("Special committees")).toHaveLength(1);
  });
});
