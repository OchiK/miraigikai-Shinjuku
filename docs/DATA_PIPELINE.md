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

本番DBへの反映は `Import Production DB (非破壊)`（[.github/workflows/import_production.yml](../.github/workflows/import_production.yml)）から行う。
中身は [packages/seed/production/import.ts](../packages/seed/production/import.ts) で、自然キーによる upsert のみを行い、削除は一切しない。

| テーブル | 自然キー |
| --- | --- |
| council_sessions | `slug` |
| bills | `slug` |
| bill_contents | `(bill_id, difficulty_level)` |
| tags | `label` |
| bills_tags | `(bill_id, tag_id)` |

`bills.id` が保たれるため、詳細ページのURLは変わらず、`interview_configs` の CASCADE で
インタビュー回答・レポートが失われることもない。インベントリから消えた議案は削除せず、
「インベントリ外」として報告するだけに留める。

`interview_configs` / `interview_questions` は Admin での運用対象なのでインポーターは触らない。
`interview_sessions` / `interview_messages` / `interview_report` / `chats` は件数だけを数え、
本文は読まないし書かない。

上書きの境界は次のとおり。Admin で直した値でも、インポーターが持つ列は次回の反映で
インベントリの値に戻る。戻したくない変更はインベントリ側（`packages/seed/main/`）に入れること。

| 層 | テーブル・列 | 正とする場所 |
| --- | --- | --- |
| 一次資料 | `council_sessions`（`name` / `council_url` / 会期日 / `is_active`） | リポジトリ（毎回上書き） |
| 一次資料 | `bills`（件名・議案番号・議決・`publish_status` / `published_at` / `is_featured` / `is_review_completed` / 各PDF URL / `thumbnail_url`） | リポジトリ（毎回上書き） |
| 一次資料 | `bill_contents`（`title` / `summary` / `content`） | リポジトリ（毎回上書き） |
| 一次資料 | `tags`（`description` / `featured_priority`）、`bills_tags` | リポジトリ（毎回上書き） |
| 運用 | `interview_configs` / `interview_questions` | Admin（インポーターは触らない） |
| 利用者 | `interview_sessions` / `interview_messages` / `interview_report` / `chats` | 利用者（件数のみ確認） |

dry-run の差分表示が、意図しない上書きに気づく唯一の歯止めになる。反映前に必ず目を通すこと。

手順:

1. `dry_run: true` でワークフローを実行し、ログの差分を確認する。
2. 意図した差分だけであれば `dry_run: false` / `confirm: apply` で再実行する。
   書き込み前に一次資料層の5テーブルだけを `pg_dump --data-only --table` で取得し、
   artifact（保持14日）として保存する。`supabase db dump` はテーブル指定ができないため使わない。
3. 反映後、`CACHE_TAGS.BILLS` の無効化と Vercel 再デプロイが自動で走る。

ローカルで同じ経路をなぞる場合:

```bash
pnpm --filter @mirai-gikai/seed import:production:dry-run
pnpm --filter @mirai-gikai/seed import:production
```

`pnpm seed`（[packages/seed/main/run.ts](../packages/seed/main/run.ts)）は `clearAllData()` で
利用者データごと全削除するため、ローカル以外の接続先では実行できない。
本番相当の検証環境を作り直すときだけ `ALLOW_DESTRUCTIVE_SEED=1` で解除する
（`Seed Production DB (DESTRUCTIVE / 破壊的)` ワークフロー）。

#### 復旧手順

artifact は一次資料層（`council_sessions` / `tags` / `bills` / `bill_contents` / `bills_tags`）だけの
`--data-only` ダンプである。利用者データはインポーターが触らないため、バックアップにも含めない
（含めると個人データが artifact として外に出る）。

1. 書き込み前の artifact（`backup-data.sql`）をワークフロー実行画面から取得する。
2. 戻し方は層によって違う。`--data-only` ダンプには TRUNCATE が含まれないため、
   既存行が残ったまま流すと主キー重複で落ちる。

   - `bill_contents` / `bills_tags`: 先に消してから流してよい。
     これらを消しても利用者データには波及しない。

     ```bash
     psql "$PRODUCTION_DB_URL" -c 'truncate public.bills_tags, public.bill_contents;'
     psql "$PRODUCTION_DB_URL" -f backup-data.sql   # 該当テーブル分のみ通る
     ```

   - `bills` / `council_sessions` / `tags`: **消してはいけない**。
     `bills` の削除は `interview_configs` の CASCADE でインタビュー回答とレポートを巻き込む。
     インポーターは id を保つので、誤った値を戻したいだけならインベントリ側
     （`packages/seed/main/`）を直して import:production を流し直すのが正規の手順。
     ダンプは「反映前の値がどうだったか」の記録として使う。

3. 戻した直後に dry-run を流し、差分が空であることを確認する。

この手順は本番で必要になる前に、ローカルまたは検証環境で一度リハーサルしておくこと。

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
