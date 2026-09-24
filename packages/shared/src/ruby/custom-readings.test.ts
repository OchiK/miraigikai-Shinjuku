import { describe, expect, it } from "vitest";
import {
  DEFAULT_RUBY_CUSTOM_READINGS,
  findInvalidRubyCustomReadings,
  isValidRubyReading,
  mergeRubyCustomReadings,
} from "./custom-readings";

describe("DEFAULT_RUBY_CUSTOM_READINGS", () => {
  it("誤読が確認された固有語を含む", () => {
    expect(DEFAULT_RUBY_CUSTOM_READINGS).toMatchObject({
      在日米軍: "ざいにちべいぐん",
      米軍: "べいぐん",
      角筈: "つのはず",
      百人町: "ひゃくにんちょう",
      繰越明許費: "くりこしめいきょひ",
    });
  });

  it("1月から12月までの読みをすべて持つ", () => {
    const months = Array.from({ length: 12 }, (_, i) => `${i + 1}月`);
    for (const month of months) {
      expect(DEFAULT_RUBY_CUSTOM_READINGS[month]).toBeDefined();
    }
    expect(DEFAULT_RUBY_CUSTOM_READINGS["4月"]).toBe("しがつ");
    expect(DEFAULT_RUBY_CUSTOM_READINGS["9月"]).toBe("くがつ");
    expect(DEFAULT_RUBY_CUSTOM_READINGS["11月"]).toBe("じゅういちがつ");
  });

  it("文脈で読みが割れる日付は登録しない", () => {
    expect(DEFAULT_RUBY_CUSTOM_READINGS["1日"]).toBeUndefined();
  });

  it("すべての読みがひらがなで書かれている", () => {
    expect(findInvalidRubyCustomReadings(DEFAULT_RUBY_CUSTOM_READINGS)).toEqual(
      []
    );
  });

  it("書き換えられない", () => {
    expect(Object.isFrozen(DEFAULT_RUBY_CUSTOM_READINGS)).toBe(true);
  });
});

describe("isValidRubyReading", () => {
  it("ひらがな・踊り字・長音符を受け付ける", () => {
    expect(isValidRubyReading("つのはず")).toBe(true);
    expect(isValidRubyReading("びーる")).toBe(true);
    expect(isValidRubyReading("いすゞ")).toBe(true);
  });

  it("空文字・カタカナ・漢字・空白を含む読みを拒否する", () => {
    expect(isValidRubyReading("")).toBe(false);
    expect(isValidRubyReading("ツノハズ")).toBe(false);
    expect(isValidRubyReading("角はず")).toBe(false);
    expect(isValidRubyReading("つの はず")).toBe(false);
  });
});

describe("findInvalidRubyCustomReadings", () => {
  it("読みが不正な語と空の語を返す", () => {
    expect(
      findInvalidRubyCustomReadings({
        角筈: "つのはず",
        百人町: "ヒャクニンチョウ",
        " ": "から",
      })
    ).toEqual(["百人町", " "]);
  });
});

describe("mergeRubyCustomReadings", () => {
  it("追加分を加え、同じ語は追加分の読みで上書きする", () => {
    const merged = mergeRubyCustomReadings(
      { 角筈: "かくはず", 米軍: "べいぐん" },
      { 角筈: "つのはず", 百人町: "ひゃくにんちょう" }
    );
    expect(merged).toEqual({
      角筈: "つのはず",
      米軍: "べいぐん",
      百人町: "ひゃくにんちょう",
    });
  });

  it("元の辞書を変更しない", () => {
    const base = { 角筈: "つのはず" };
    mergeRubyCustomReadings(base, { 米軍: "べいぐん" });
    expect(base).toEqual({ 角筈: "つのはず" });
  });
});
