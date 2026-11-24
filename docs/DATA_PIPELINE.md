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

議案の公開翻訳は英語のみ。R8-3 は区長提出22件の日本語 `normal`（採決文を合成した本文）から英訳の下書きを作る。他の5言語は案内ページのみとする。外国語ごとに独自の政策解釈を作らない。

2026-11-24 にローカル Supabase で22件の下書きの同期と表示切替を確認した。本番の反映・承認・公開状態は未確認。機械検査、ローカル検証、人の承認、本番公開は別の状態として記録する。

### 5. Review

最低限の自動チェック:
- 数字が原文に存在するか
- 日付が原文に存在するか
- 議案番号一致
- source URLあり
- 空欄なし

英訳は全22件を日本語と対照し、金額・日付・モダリティ・賛否・不記載事項を確認する。機械検査だけで確認済みにはしない。承認は Admin で人が行う。

### 6. Publish

Supabaseへupsert。

本番DBへの反映は `Import Production DB (非破壊)`（[.github/workflows/import_production.yml](../.github/workflows/import_production.yml)）から行う。
中身は [packages/seed/production/import.ts](../packages/seed/production/import.ts) で、自然キーによる upsert のみを行い、削除は一切しない。

| テーブル | 自然キー |
| --- | --- |
| council_sessions | `slug` |
| bills | `slug` |
| bill_contents | `(bill_id, difficulty_level)` |
| bill_content_translations（R8-3 の `normal/en` 22件のみ） | `(bill_content_id, locale)` |
| tags | `label` |
| bills_tags | `(bill_id, tag_id)` |
| factions | `name` |
| committees | `name` |
| council_members | `name` |
| council_member_committees | `(council_member_id, committee_id)` |
| council_member_questions | `(council_member_id, source_url)` |
| faction_stances | `(bill_id, faction_id)` |

`bills.id` が保たれるため、詳細ページのURLは変わらず、`interview_configs` の CASCADE で
インタビュー回答・レポートが失われることもない。インベントリから消えた議案は削除せず、
「インベントリ外」として報告するだけに留める。

`interview_configs` / `interview_questions` は Admin での運用対象なのでインポーターは触らない。
`interview_sessions` / `interview_messages` / `interview_report` / `chats` は件数だけを数え、
本文は読まないし書かない。

上書きの境界は次のとおり。Admin で直した値でも、インポーターが持つ列は次回の反映で
インベントリの値に戻る。英訳には下表の保護規則がある。戻したくない変更はインベントリ側（`packages/seed/main/`）に入れること。

| 層 | テーブル・列 | 正とする場所 |
| --- | --- | --- |
| 一次資料 | `council_sessions`（`name` / `council_url` / 会期日 / `is_active`） | リポジトリ（毎回上書き） |
| 一次資料 | `bills`（件名・議案番号・議決・`publish_status` / `published_at` / `is_featured` / `is_review_completed` / 各PDF URL / `thumbnail_url`） | リポジトリ（毎回上書き） |
| 一次資料 | `bill_contents`（`title` / `summary` / `content`） | リポジトリ（毎回上書き） |
| 一次資料 | `tags`（`description` / `featured_priority`）、`bills_tags` | リポジトリ（毎回上書き） |
| 一次資料 | 会派・委員会・議員・所属・質問・会派賛否 | リポジトリ（各自然キーで同期） |
| 英訳下書き | `bill_content_translations` の訳文・原文 hash/snapshot・model・prompt_version | Git。ただし承認済み・Admin 作成/編集行は DB を保護 |
| 英訳承認 | `status=reviewed`・`reviewed_at`・`reviewed_by` | DB（Admin）のみ。Git と importer は承認しない |
| 運用 | `interview_configs` / `interview_questions` | Admin（インポーターは触らない） |
| 利用者 | `interview_sessions` / `interview_messages` / `interview_report` / `chats` | 利用者（件数のみ確認） |

dry-run の差分表示が、意図しない上書きに気づく唯一の歯止めになる。反映前に必ず目を通すこと。

手順:

1. `dry_run: true` でワークフローを実行し、ログの差分を確認する。
2. 意図した差分だけであれば `dry_run: false` / `confirm: apply` で再実行する。
   書き込み前に下記の10テーブルを `pg_dump --data-only --table` で1回取得する。英訳の `reviewed_by` は NULL を保ち、それ以外を `redacted` に置換する。生ファイルを削除し、置換後の `backup-data.sql` だけを artifact（保持14日）に保存する。COPY ブロック・列・終端・列数の検査に失敗すると upload/import は行わない。
3. 反映後、設定済みなら `CACHE_TAGS.BILLS` 等の無効化と Vercel 再ビルド要求が走る。キャッシュ用の設定が空なら無効化はスキップされる。成功ログだけで英語表示を確認済みとはしない。

英訳は15引数版 `import_production_inventory` で日本語の反映と同じトランザクションに入る。未存在行は `generated` で作成し、未承認かつ `imported_snapshot` と現在の訳文が等しい行だけを更新する。承認済み行と Admin 作成・編集行は変更しない。インベントリ外も削除しない。他言語は同期・報告の対象外。apply の英訳件数は RPC が実際に書いたキーを基にし、直前の承認・編集で適用しなかった行は保護として報告する。

保護だけが残る場合の「書き込み対象なし」は DB と Git の一致を意味しない。集計行は新規・更新・変更なし・インベントリ外の件数を示し、保護が1件以上あるときだけ末尾に「保護 N」を加える。保護が0件のときは、この欄を表示しない。日本語が変わった承認済み英訳は DB に残るが、読み出し時の hash 不一致で公開対象から外れる。[英訳の本番同期と確認手順](20261124_1135_英訳の本番同期と確認手順.md)を参照。

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

artifact の対象は `council_sessions` / `tags` / `bills` / `bill_contents` / `bill_content_translations` / `bills_tags` / `factions` / `committees` / `council_members` / `council_member_committees` の10テーブル。利用者データは含めない。`council_member_questions` と `faction_stances` は importer が書くが既存 workflow のバックアップには含まれない。

1. 反映前の artifact（`backup-data.sql`）を取得する。本番へ直接一括投入せず、ローカルの隔離した検証 DB に読み込み、復旧対象のテーブル分を一時テーブルへ移す。COPY の値は PostgreSQL で読み込み、文字列置換で復元しない。
2. 現在の DB を別途保全し、壊れた・消えた行だけを id で列挙する。一次資料層の誤りは原則として Git を修正して通常の非破壊 import で戻す。`bill_contents` も id を保つ。`bills` / `council_sessions` / `tags` は削除してはいけない。`bills` を削除すると、`interview_configs` を経由する CASCADE によりインタビュー回答とレポートも削除される。翻訳の外部キーや承認を失う一括削除・truncate・CASCADE も行わない。
3. 英訳は一時テーブルと現在の行を id と自然キーで照合して選択復旧する。残存行の `reviewed_by` は保持し、現在の行が承認済み・Admin 編集済みなら上書きしない。復旧対象を確定後にも同じ状態であることをトランザクション内で確認する。競合したら中止して判断し直す。欠落行の INSERT は id と自然キーの競合がない場合だけ行う。
4. 消えた承認済み英訳では訳文と `reviewed_at` は戻るが、`reviewed_by` は `redacted` になる。誰が承認したかは artifact から復元できない。必要なら Admin で内容を再確認して承認し直す。バックアップ後に増えた行・承認された行は触らない。
5. COMMIT 前に対象行と非対象行を比較し、後者の全列が変わっていないことを確認する。復旧後に dry-run を読み、保護を含む意図した差分かを確認する。差分ゼロを得るために保護を解除しない。キャッシュを無効化し、公開条件と表示を確認する。

**2026-11-24・ローカル Supabase での検証記録**: 修正した英訳22件を更新し、再 import では変更なし22・インベントリ外2となった。22件は `generated`、`imported_snapshot` あり、確認者なし。アクティブ会期はr8-3へ戻した。15引数版 RPC の12個の SET 代入を1つずつ外す検証では、12通りすべてでテストが失敗し、元の関数と復元後の関数では35件すべて成功した。

バックアップからの選択復旧も、修正後の状態で再確認した。対象10テーブルの dump の差分4行は `reviewed_by` 列だけで、メールアドレス残存0。不正な dump は終了コード1、出力ファイルなし。削除した承認済み行と壊れた未編集下書きだけを選択復旧し、その他の行は全列比較で変更0だった。残存する確認者、Admin 編集、バックアップ後の新規行・承認を保持し、削除した承認済み行の `reviewed_by` は `redacted` として復元した。検証用 DB は終了後に削除した。

lint・型チェック・ビルド・単体テスト・統合テストは、再実行を含めすべて終了コード0で、tests/supabase 229件・web 148件が成功した。第63号の画面でも修正後の英語・引用注記、承認取消、再 import 時の行全体の保持を再確認した。日本語変更による表示切替は同日の先行確認の記録を保持し、コードに変更がないため再実施していない。初回のチャット統合テスト6件の失敗原因と再実行、キャッシュに関する観察は[運用手順の検証記録](20261124_1135_英訳の本番同期と確認手順.md#2026-11-24-のローカル検証記録)に記載。本番の状態、GitHub 上の workflow 実行、CI は未確認。

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
