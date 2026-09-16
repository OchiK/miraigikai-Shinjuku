# 多言語・やさしい日本語設計

## Target locales

```ts
export const SUPPORTED_LOCALES = [
  "ja",
  "en",
  "zh-Hans",
  "ko",
  "ne",
  "my",
  "vi",
] as const;
```

## 表示言語と内容難易度を分ける

`locale = ja` と `difficulty = easy` を組み合わせて「やさしい日本語」を表現する。

「やさしい日本語」を独立localeとして扱わない。

## やさしい日本語の原則

- 1文1情報を基本にする
- 長い修飾を減らす
- 二重否定を避ける
- 主語・対象が曖昧なら補う
- 行政用語は最初に短く説明する
- 略語だけで済ませない
- 数字、日付、金額、対象条件は勝手に丸めない
- 法的効果を「必ず」「禁止」などに強めない
- 原文で不明なことを補完しない
- 難しい固有の制度名は、簡単な説明＋正式名称を併記する
- UIでは可能ならふりがな支援を検討する

## 翻訳原則

公式日本語:
`source of truth`

翻訳:
`AI-generated aid`

各翻訳ページに短い表示:

> この翻訳は日本語の公式資料をもとに作成した参考情報です。内容の確認には日本語の公式資料をご利用ください。

## 翻訳更新

翻訳レコードに`source_hash`を持たせる。

日本語元コンテンツのhashが変わった場合:

```text
translation.status = stale
```

再生成後:

```text
translation.status = generated
```

必要なら:

```text
translation.status = reviewed
```

## 中国語

初期は `zh-Hans` を採用。
台湾籍住民への対応として `zh-Hant` を追加しやすいコードにしておく。

## UI翻訳と議案翻訳を分ける

UI翻訳:
- ボタン
- ナビ
- エラー
- disclaimer
- 日付ラベル

議案翻訳:
- title
- summary
- content

UI翻訳はversion control。
議案翻訳はDB。

## 言語fallback

```text
requested locale
 -> translated normal content
 -> Japanese normal content + translation unavailable notice
```

内容がないからといって、別議案の翻訳やモデルの一般知識で穴埋めしない。
