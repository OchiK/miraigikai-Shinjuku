# Data Pipeline

## MVP戦略

最初から完全スクレイパーを作らない。

### Fixture

2026年第2回定例会を最初の完成データセットにする。

理由:
- 提出議案ページが公開済み
- 議案PDFが公開済み
- 議決結果も公開済み
- lifecycleを最後までテストできる

### Live target

2026年第3回定例会を最初の更新対象にする。

公式ページ上の会期は2026-09-16から2026-10-15。

## ステップ

### 1. Discovery

定例会ページから取得:
- 会期名
- 会期開始/終了
- 議案番号
- 公式議案名
- category
- PDF URL
- 概要PDF URL

### 2. Fetch

PDFを保存またはテキスト抽出。

保存する情報:
- source_url
- fetched_at
- content hash
- HTTP metadataが取れればlast-modified等

### 3. Parse

PDFから以下を抽出:
- 条例改正の対象
- 改正理由
- 主な変更
- 施行日
- 予算額等

AI抽出だけに依存せず、元テキストも保持する。

### 4. Generate

日本語:
- easy: やさしい日本語
- normal: 一般向け
- hard: 詳細

その後:
- en
- zh-Hans
- ko
- ne
- my
- vi

翻訳は日本語normal/easyから生成し、外国語ごとに独自の政策解釈を作らない。

### 5. Review

最低限の自動チェック:
- 数字が原文に存在するか
- 日付が原文に存在するか
- 議案番号一致
- source URLあり
- 空欄なし

できれば目視:
- easy版
- 翻訳のタイトル
- 可決/否決等のstatus

### 6. Publish

Supabaseへupsert。

### 7. Result update

会期中はstatus未確定。
議決結果ページ公開後に更新。

## ID方針

議案番号だけでは年度・会期をまたいで衝突しうるため、external keyを作る。

例:

```text
shinjuku-2026-r2-gian-45     # 第45号議案
shinjuku-2026-r2-shonin-2    # 承認第2号
```

案件種別（`gian` / `shonin`）を必ず含めること。
承認第2号と承認第3号は件名がいずれも「専決処分の承認について」で一致するため、
件名や番号だけでは一意に定まらない。

令和8年第2回定例会では `bills.slug`（ユニークインデックスあり）をこのキーとして使用している。

## 将来自動化

```text
scheduled check
  -> session page hash changed?
     -> new/changed PDF?
        -> ingest
        -> parse
        -> generate
        -> QA flags
        -> draft in admin
        -> publish
```

個人運営では「自動公開」より「自動でdraft生成、最後だけ確認」の方が事故が少ない。

## 議事録

Phase 2以降。

課題:
- 別検索システム
- 会議・委員会構造
- 発言者分離
- 人名揺れ
- 長文
- RAG用chunking

最初のMVPでは対象外。
