# S5-2 本番DB migration履歴・制約・出典列確認

## 実施情報

- 実施日時: 2026年9月28日 07:43 JST
- 対象: Supabase 本番プロジェクト `bdfkjdanycpxtoljxeho`
- 検証元SHA: `e3c651a536e1637bc8eb2df4925d80762945f25c`
- GitHub Actions:
  [Import Production DB #36356218840](https://github.com/OchiK/miraigikai-Shinjuku/actions/runs/36356218840)
- 実行方法: 本番DBへ `psql` で接続し、読み取り専用クエリと検証用の
  `DO` ブロックを実行

通常のインポートdry-run、バックアップ、インポート、キャッシュ無効化、
Vercel再デプロイはすべてスキップした。本番DBへの書き込みは行っていない。
検証時だけ `s5-2-db-verification` を GitHub の `production` environment の
許可ブランチに追加し、workflow終了直後に削除した。終了後の許可ブランチは
`main` のみである。

## 判定

**PASS。S5-2 の受入条件をすべて満たす。**

| 確認項目 | 結果 | 本番DBで確認した内容 |
| --- | --- | --- |
| migration履歴 | PASS | ローカル105件、本番105件。バージョン一覧の差分なし |
| 会期内の議案番号 | PASS | `(council_session_id, bill_number)` の部分ユニークインデックスあり |
| 会期未割り当ての議案番号 | PASS | `bill_number` の部分ユニークインデックスあり |
| `bill_number_order` | PASS | `integer` の保存生成列とインデックスあり |
| 出典URL列 | PASS | 4列とも `text` として存在 |
| 既存データの重複 | PASS | 会期内の議案番号重複は0件 |

`(council_session_id, bill_number)` の一意性は `pg_constraint` のテーブル制約ではなく、
空文字を除外する部分ユニークインデックスで実装されている。

## migration履歴

リポジトリ側は `supabase/migrations/*.sql` のファイル名からバージョンを取り出し、
本番側は次のクエリで取得した。

```sql
select version
from supabase_migrations.schema_migrations
order by version;
```

結果:

```text
local_count=105
remote_count=105
diff -u: 差分なし
```

## インデックス

実行クエリ:

```sql
select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'bills'
  and indexname in (
    'bills_session_bill_number_unique',
    'bills_unassigned_bill_number_unique',
    'idx_bills_bill_number_order'
  )
order by indexname;
```

結果:

```text
bills_session_bill_number_unique
CREATE UNIQUE INDEX bills_session_bill_number_unique ON public.bills USING btree (council_session_id, bill_number) WHERE ((council_session_id IS NOT NULL) AND (bill_number <> ''::text))

bills_unassigned_bill_number_unique
CREATE UNIQUE INDEX bills_unassigned_bill_number_unique ON public.bills USING btree (bill_number) WHERE ((council_session_id IS NULL) AND (bill_number <> ''::text))

idx_bills_bill_number_order
CREATE INDEX idx_bills_bill_number_order ON public.bills USING btree (bill_number_order)
```

## 必須列

実行クエリ:

```sql
select
  column_name,
  data_type,
  is_nullable,
  is_generated,
  generation_expression
from information_schema.columns
where table_schema = 'public'
  and table_name = 'bills'
  and column_name in (
    'bill_number_order',
    'pdf_url',
    'overview_pdf_url',
    'source_page_url',
    'decision_source_url'
  )
order by column_name;
```

結果:

| column_name | data_type | nullable | generated |
| --- | --- | --- | --- |
| `bill_number_order` | `integer` | YES | ALWAYS |
| `decision_source_url` | `text` | YES | NEVER |
| `overview_pdf_url` | `text` | YES | NEVER |
| `pdf_url` | `text` | YES | NEVER |
| `source_page_url` | `text` | YES | NEVER |

`bill_number_order` の生成式も本番DBから取得した。全角数字を半角へ変換して先頭の
数値を取り出し、議員提出議案には `1000000` を加える現行migrationの式と一致した。
数字がない場合は `2147483647`、7桁以上の場合は `2147483646` となる。

## 重複確認

実行クエリ:

```sql
select council_session_id, bill_number, count(*)
from public.bills
where council_session_id is not null
  and bill_number != ''
group by council_session_id, bill_number
having count(*) > 1;
```

結果は0行だった。

## 検証時の補足

GitHub Actions から警告が2件出たが、DB検証結果には影響しない。

- `pnpm/action-setup` と `supabase/setup-cli` が Node.js 20 を対象としており、
  runner が Node.js 24 で強制実行した
- `ubuntu-latest` が2026年10月19日から Ubuntu 26へ移行予定と通知された

