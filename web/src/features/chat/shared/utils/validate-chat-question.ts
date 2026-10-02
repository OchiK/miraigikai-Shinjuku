/**
 * 有料LLMを呼ぶ前の事前フィルタ。
 *
 * 誤って議案の質問を弾くほうが害が大きいので、判定は狭くしている。
 * 明らかに議案と無関係な依頼（空入力・記号だけ・コード生成・レシピ）だけを止め、
 * それ以外はプロンプト側の「関係ない話題は断る」ルールに任せる。
 */

export type ChatQuestionVerdict =
  | { ok: true }
  | { ok: false; reason: "empty" | "off_topic" };

/** 本文の選択テキストを差し込むテンプレート（「…」について教えてください）対策で、引用部分は判定から外す */
const QUOTED = /「[^」]*」|"[^"]*"|“[^”]*”/g;

/** 議案・区政に触れていれば、無関係とは判定しない */
const ON_TOPIC =
  /議案|条例|予算|区議会|区政|新宿|議会|議員|会派|委員会|補助|税|bill|ordinance|budget|council|ward|shinjuku|resolution/i;

const PROGRAMMING_LANGUAGE =
  /python|javascript|typescript|java\b|c\+\+|c#|rust|golang|ruby|php|swift|kotlin|sql|html|css|bash|パイソン|クイックソート/i;
const CODE_NOUN =
  /コード|プログラム|スクリプト|関数|アルゴリズム|code|script|function|program/i;
const CODE_VERB =
  /書いて|書け|書き直|作って|作成して|生成して|実装して|write|implement|generate|create/i;

const RECIPE = /レシピ|recipe|[^\s。、]{1,12}の作り方/i;

export function validateChatQuestion(text: string): ChatQuestionVerdict {
  // 文字（\p{L}）が1つも無い入力は質問として成立しない（空白・記号・数字だけ）
  if (!/\p{L}/u.test(text)) {
    return { ok: false, reason: "empty" };
  }

  const unquoted = text.replace(QUOTED, " ");
  if (ON_TOPIC.test(unquoted)) {
    return { ok: true };
  }

  const isCodeRequest =
    CODE_VERB.test(unquoted) &&
    (PROGRAMMING_LANGUAGE.test(unquoted) || CODE_NOUN.test(unquoted));
  if (isCodeRequest || RECIPE.test(unquoted)) {
    return { ok: false, reason: "off_topic" };
  }

  return { ok: true };
}
