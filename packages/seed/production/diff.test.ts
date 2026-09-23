import { describe, expect, it } from "vitest";
import {
  type ImportReport,
  diffFields,
  diffTable,
  formatImportReport,
  formatValue,
  hasChanges,
  normalizeTimestamp,
  normalizeArray,
} from "./diff";

const billFields = [
  { field: "publish_status" },
  { field: "is_review_completed" },
  { field: "published_at", normalize: normalizeTimestamp },
];

describe("diffTable", () => {
  it("DBに無い行を新規として仕分ける", () => {
    const result = diffTable({
      table: "bills",
      label: "議案",
      fields: billFields,
      current: [],
      desired: [
        { key: "gian-42", values: { publish_status: "published" } },
        { key: "gian-43", values: { publish_status: "published" } },
      ],
    });

    expect(result.created).toEqual(["gian-42", "gian-43"]);
    expect(result.updated).toEqual([]);
    expect(result.unchanged).toEqual([]);
  });

  it("値が異なる行を更新として仕分け、変更カラムだけを返す", () => {
    const result = diffTable({
      table: "bills",
      label: "議案",
      fields: billFields,
      current: [
        {
          key: "gian-42",
          values: {
            publish_status: "coming_soon",
            is_review_completed: false,
            published_at: null,
          },
        },
      ],
      desired: [
        {
          key: "gian-42",
          values: {
            publish_status: "published",
            is_review_completed: false,
            published_at: null,
          },
        },
      ],
    });

    expect(result.updated).toEqual([
      {
        key: "gian-42",
        changes: [
          {
            field: "publish_status",
            before: "coming_soon",
            after: "published",
          },
        ],
      },
    ]);
    expect(result.created).toEqual([]);
    expect(result.unchanged).toEqual([]);
  });

  it("値が一致する行は変更なしになる", () => {
    const values = {
      publish_status: "published",
      is_review_completed: true,
      published_at: "2026-06-19T00:00:00+09:00",
    };

    const result = diffTable({
      table: "bills",
      label: "議案",
      fields: billFields,
      current: [{ key: "gian-42", values }],
      desired: [{ key: "gian-42", values: { ...values } }],
    });

    expect(result.unchanged).toEqual(["gian-42"]);
    expect(result.updated).toEqual([]);
  });

  it("タイムスタンプのタイムゾーン表記違いを更新と誤判定しない", () => {
    const result = diffTable({
      table: "bills",
      label: "議案",
      fields: billFields,
      // PostgREST は UTC 表記で返す
      current: [
        { key: "gian-42", values: { published_at: "2026-06-18T15:00:00+00:00" } },
      ],
      // インベントリは JST 表記で持つ
      desired: [
        { key: "gian-42", values: { published_at: "2026-06-19T00:00:00+09:00" } },
      ],
    });

    expect(result.unchanged).toEqual(["gian-42"]);
  });

  it("インベントリ外の行は extraneous として報告し、削除対象にしない", () => {
    const result = diffTable({
      table: "bills",
      label: "議案",
      fields: billFields,
      current: [
        { key: "gian-42", values: { publish_status: "published" } },
        { key: "dummy-999", values: { publish_status: "draft" } },
      ],
      desired: [{ key: "gian-42", values: { publish_status: "published" } }],
      reportExtraneous: true,
    });

    expect(result.extraneous).toEqual(["dummy-999"]);
    expect(result.unchanged).toEqual(["gian-42"]);
  });

  it("reportExtraneous を指定しなければインベントリ外を報告しない", () => {
    const result = diffTable({
      table: "tags",
      label: "タグ",
      fields: [{ field: "description" }],
      current: [{ key: "運用で足したタグ", values: { description: null } }],
      desired: [],
    });

    expect(result.extraneous).toEqual([]);
  });

  it("自然キーが重複していたら投入前に例外を投げる", () => {
    expect(() =>
      diffTable({
        table: "bills",
        label: "議案",
        fields: billFields,
        current: [],
        desired: [
          { key: "gian-42", values: {} },
          { key: "gian-42", values: {} },
        ],
      })
    ).toThrow(/自然キーが重複している/);
  });

  it("比較カラムが空なら存在の有無だけで仕分ける", () => {
    const result = diffTable({
      table: "bills_tags",
      label: "タグ紐付",
      fields: [],
      current: [{ key: "gian-42::くらし・行財政", values: {} }],
      desired: [
        { key: "gian-42::くらし・行財政", values: {} },
        { key: "gian-43::くらし・行財政", values: {} },
      ],
    });

    expect(result.created).toEqual(["gian-43::くらし・行財政"]);
    expect(result.unchanged).toEqual(["gian-42::くらし・行財政"]);
  });
});

describe("diffFields", () => {
  it("null と undefined を同一視する", () => {
    const changes = diffFields(
      { thumbnail_url: null },
      {},
      [{ field: "thumbnail_url" }]
    );

    expect(changes).toEqual([]);
  });

  it("null から値への変更は検出する", () => {
    const changes = diffFields(
      { thumbnail_url: null },
      { thumbnail_url: "https://example.com/a.png" },
      [{ field: "thumbnail_url" }]
    );

    expect(changes).toEqual([
      {
        field: "thumbnail_url",
        before: null,
        after: "https://example.com/a.png",
      },
    ]);
  });

  it("比較対象に指定していないカラムの違いは無視する", () => {
    const changes = diffFields(
      { title: "旧タイトル", updated_at: "2026-01-01T00:00:00Z" },
      { title: "旧タイトル", updated_at: "2026-09-19T00:00:00Z" },
      [{ field: "title" }]
    );

    expect(changes).toEqual([]);
  });
});

describe("normalizeTimestamp", () => {
  it("同じ時刻の異なる表記を同じ値に揃える", () => {
    expect(normalizeTimestamp("2026-06-19T00:00:00+09:00")).toBe(
      normalizeTimestamp("2026-06-18T15:00:00+00:00")
    );
  });

  it("null と undefined は null に揃える", () => {
    expect(normalizeTimestamp(null)).toBeNull();
    expect(normalizeTimestamp(undefined)).toBeNull();
  });

  it("日時として解釈できない文字列はそのまま返す", () => {
    expect(normalizeTimestamp("not-a-date")).toBe("not-a-date");
  });
});

describe("normalizeArray", () => {
  it("同じ要素を持つ別の配列を同じ値に揃える", () => {
    expect(normalizeArray(["公明"])).toBe(normalizeArray(["公明"]));
  });

  it("配列以外はそのまま返す", () => {
    expect(normalizeArray("公明")).toBe("公明");
  });
});

describe("formatValue", () => {
  it("長い本文は先頭だけを出して文字数を添える", () => {
    const formatted = formatValue("あ".repeat(100));

    expect(formatted).toBe(`${"あ".repeat(40)}…(100文字)`);
  });

  it("null は null と表示する", () => {
    expect(formatValue(null)).toBe("null");
  });
});

describe("formatImportReport", () => {
  const report: ImportReport = {
    dryRun: true,
    tables: [
      {
        table: "bills",
        label: "議案",
        created: ["shinjuku-2026-r2-gian-62"],
        updated: [
          {
            key: "shinjuku-2026-r2-gian-42",
            changes: [
              {
                field: "publish_status",
                before: "coming_soon",
                after: "published",
              },
            ],
          },
        ],
        unchanged: ["shinjuku-2026-r2-gian-43"],
        extraneous: ["shinjuku-2026-r2-gian-99"],
      },
    ],
  };

  it("dry-run であることと各件数を出力する", () => {
    const output = formatImportReport(report);

    expect(output).toContain("dry-run");
    expect(output).toContain(
      "議案  新規 1 / 更新 1 / 変更なし 1 / インベントリ外 1"
    );
  });

  it("変更カラムを before -> after の形で出力する", () => {
    expect(formatImportReport(report)).toContain(
      "~ shinjuku-2026-r2-gian-42  publish_status: coming_soon -> published"
    );
  });

  it("インベントリ外は削除しない旨を添えて出力する", () => {
    expect(formatImportReport(report)).toContain(
      "? shinjuku-2026-r2-gian-99（インベントリ外。削除しない）"
    );
  });

  it("インベントリ外の委員会所属は削除対象として出力する", () => {
    expect(
      formatImportReport({
        dryRun: true,
        tables: [
          {
            ...report.tables[0],
            table: "council_member_committees",
          },
        ],
      })
    ).toContain("（インベントリ外。同期時に削除）");
  });
});

describe("hasChanges", () => {
  const emptyTable = {
    table: "bills",
    label: "議案",
    created: [],
    updated: [],
    unchanged: ["gian-42"],
    extraneous: ["gian-99"],
  };

  it("新規も更新も無ければ false", () => {
    expect(
      hasChanges({ dryRun: true, tables: [emptyTable] })
    ).toBe(false);
  });

  it("新規があれば true", () => {
    expect(
      hasChanges({
        dryRun: true,
        tables: [{ ...emptyTable, created: ["gian-62"] }],
      })
    ).toBe(true);
  });

  it("削除対象の委員会所属があれば true", () => {
    expect(
      hasChanges({
        dryRun: true,
        tables: [
          {
            ...emptyTable,
            table: "council_member_committees",
          },
        ],
      })
    ).toBe(true);
  });
});
