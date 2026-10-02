import { describe, expect, it } from "vitest";
import { validateChatQuestion } from "./validate-chat-question";

const passes = (text: string) => validateChatQuestion(text).ok;

describe("validateChatQuestion", () => {
  describe("通す（議案・区政の質問）", () => {
    it.each([
      "この条例の対象者は誰？",
      "予算規模は？",
      "いつから施行される？",
      "給食のカレーの値段は変わる？",
      "プログラミング教育の予算は？",
      "What does this bill change for renters?",
      "Who is eligible under this ordinance?",
      "テスト質問です",
      "わが家は対象になりますか？",
    ])("%s", (text) => {
      expect(passes(text)).toBe(true);
    });

    it("選択テキストを差し込むテンプレートはどんな語でも通す", () => {
      expect(passes("「レシピ」について教えてください。")).toBe(true);
      expect(passes("「Pythonでコードを書いて」について教えてください。")).toBe(
        true
      );
      expect(passes('Please tell me about "recipe".')).toBe(true);
    });
  });

  describe("止める", () => {
    it("空白・記号・数字だけは empty", () => {
      expect(validateChatQuestion("   ")).toEqual({
        ok: false,
        reason: "empty",
      });
      expect(validateChatQuestion("？？？")).toEqual({
        ok: false,
        reason: "empty",
      });
      expect(validateChatQuestion("1+1=")).toEqual({
        ok: false,
        reason: "empty",
      });
    });

    it.each([
      "Pythonでクイックソート書いて",
      "JavaScriptの関数を書いて",
      "Write a Python script to scrape a website",
      "美味しいカレーの作り方を教えて",
      "Give me a recipe for pasta",
    ])("%s は off_topic", (text) => {
      expect(validateChatQuestion(text)).toEqual({
        ok: false,
        reason: "off_topic",
      });
    });

    it("議案に触れていれば、コードや作り方の語があっても通す", () => {
      expect(passes("この条例の申請の作り方を教えて")).toBe(true);
    });
  });
});
