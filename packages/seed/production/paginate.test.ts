import { describe, expect, it } from "vitest";
import { chunkValues, paginate } from "./paginate";

describe("paginate", () => {
  it.each([
    0, 1000, 1001, 2500,
  ])("%i 行を最後まで読み、一意順を保つ", async (size) => {
    const rows = Array.from({ length: size }, (_, id) => ({ id: String(id) }));
    const ranges: number[][] = [];
    const events: string[] = [];
    const result = await paginate({
      table: "example",
      batches: [null],
      countRows: async () => {
        events.push("count");
        return size;
      },
      readPage: async (_, from, to) => {
        events.push("page");
        ranges.push([from, to]);
        return rows.slice(from, to + 1);
      },
      keyOf: (row) => row.id,
    });
    expect(result).toEqual(rows);
    expect(events[0]).toBe("count");
    expect(ranges).toEqual(
      Array.from({ length: Math.floor(size / 1000) + 1 }, (_, i) => [
        i * 1000,
        i * 1000 + 999,
      ])
    );
  });

  it.each([0, 2])("数えた1行と読んだ%i行が違えば止める", async (read) => {
    await expect(
      paginate({
        table: "example",
        batches: [null],
        countRows: async () => 1,
        readPage: async () =>
          Array.from({ length: read }, (_, id) => String(id)),
        keyOf: (row) => row,
      })
    ).rejects.toThrow(`example の件数が不一致: count=1, read=${read}`);
  });

  it("ページをまたぐ自然キーの重複で止める", async () => {
    await expect(
      paginate({
        table: "example",
        batches: [null],
        countRows: async () => 1001,
        readPage: async (_, from) =>
          from === 0
            ? Array.from({ length: 1000 }, (_, id) => String(id))
            : ["0"],
        keyOf: (row) => row,
      })
    ).rejects.toThrow("example の読み出しでキーが重複: 0");
  });

  it("塊をまたぐ自然キーの重複で止める", async () => {
    await expect(
      paginate({
        table: "example",
        batches: [1, 2],
        countRows: async () => 1,
        readPage: async () => ["duplicate"],
        keyOf: (row) => row,
      })
    ).rejects.toThrow("example の読み出しでキーが重複: duplicate");
  });

  it("塊ごとに数え、各塊のページを連結する", async () => {
    const rows = Array.from({ length: 1201 }, (_, i) => String(i));
    expect(
      await paginate({
        table: "example",
        batches: [rows, ["other"]],
        countRows: async (batch) => batch.length,
        readPage: async (batch, from, to) => batch.slice(from, to + 1),
        keyOf: (row) => row,
      })
    ).toEqual([...rows, "other"]);
  });

  it("読み出しの失敗をそのまま伝える", async () => {
    await expect(
      paginate({
        table: "example",
        batches: [null],
        countRows: async () => 1,
        readPage: async () => {
          throw new Error("read failed");
        },
        keyOf: (row: string) => row,
      })
    ).rejects.toThrow("read failed");
  });
});

describe("chunkValues", () => {
  it.each([0, 1, 100, 101, 250])("%i件を100件以下に分ける", (size) => {
    const values = Array.from({ length: size }, (_, i) => String(i));
    const chunks = chunkValues(values);
    expect(chunks.flat()).toEqual(values);
    expect(chunks.every((chunk) => chunk.length <= 100)).toBe(true);
    expect(chunks.map((chunk) => chunk.length)).toEqual(
      size === 0
        ? []
        : Array.from({ length: Math.ceil(size / 100) }, (_, i) =>
            Math.min(100, size - i * 100)
          )
    );
  });
});
