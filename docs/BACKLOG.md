# Backlog

現在対応中、または対応予定のバックログ一覧です。
完了済みのタスク（受入基準・進捗履歴）は [BACKLOG_ARCHIVE.md](./BACKLOG_ARCHIVE.md) に退避・記録されています。

---

## 完了済みタスク（アーカイブ参照）

完了したタスクの詳細は [BACKLOG_ARCHIVE.md](./BACKLOG_ARCHIVE.md) を参照してください。

| 分類 | 完了済みタスク ID |
| :--- | :--- |
| **初期基盤・会期** | P0-1, P0-2, P0-3, P0-4, P1-1, P1-2 |
| **本番稼働検証** | S5-5（本番キャッシュ即時無効化） |
| **難易度・多言語** | P2-1, P2-2, P3-2, P3-3, P3-5（英語のみ翻訳・5言語案内ページ） |
| **自動化・制約** | P5-0（会期スコープユニーク制約）, P5-1（更新検知・ドラフト生成） |
| **議員機能** | P7-1（世田谷モデル議員ページ）, P7-3（公式Xアカウント表示・全38名調査） |
| **UI/UX・改善** | P8-1, P8-2, P8-3, P8-4, P8-5, P8-6, P8-7, P8-8, P8-9, P8-10, P8-11, P8-12, P8-13, P8-14, P8-15, P8-16, P8-17, P8-18, P8-19, P8-20 |

---

## S5 本番稼働検証（ROADMAP「Step 5」の残作業）

ROADMAP の Step 5 で未完了の項目。Phase の Exit 条件とは別に、本番環境そのものを確かめる作業。
経緯は `docs/verification/20260918_1830_step5_production_verification.md`、`docs/verification/20260923_本番公開確認記録.md`、`docs/verification/20260924_本番公開確認記録.md`。

### S5-1 Admin の本番配備経路と認可
いまの本番 Admin は、ローカルで `pnpm dev:admin:prod-db` を立てて本番DBにつなぐ形でしか使っていない（2026-09-24 の確認記録）。

Acceptance:
- Admin を本番にデプロイするか、ローカル起動のみで運用するかを決めて記録する
- デプロイする場合は URL・配備 SHA・Vercel 環境変数を記録し、未ログインと `admin` ロールなしのユーザーが弾かれることを確かめる
- 本番の Admin アカウントの作り方（Supabase Authentication でユーザーを作り、`raw_app_meta_data` に `{"roles": ["admin"]}` を付ける）を手順書に書く

### S5-2 本番DBのmigration履歴・制約・出典列の確認
Acceptance:
- 本番の migration 履歴が `supabase/migrations/` と一致する
- `(council_session_id, bill_number)` の複合ユニーク、`bill_number_order`、出典URL列が本番にある
- 確認に使ったクエリと結果を `docs/verification/` に残す

### S5-3 復旧手順のリハーサル
本番専用インポーターは対象テーブルのバックアップを取るが、そこから戻す手順は試していない。

Acceptance:
- ローカルまたは検証用の Supabase で、バックアップからの復元を最後まで通す
- 手順と所要時間を文書にする

### S5-4 公開画面の総点検（全議案・モバイル・AIチャット）
Acceptance:
- 公開中の全議案（区長提出23件と議員提出議案4件）で、3難易度の本文・一次資料リンク・出典導線を確認する
- スマホ幅での表示を確認し、スクリーンショットを証跡として保存する
- 公開済みの議案で AI チャットが答え、未公開の議案では 403 になることを本番で確認する
- 次の2点はコード上は対応済みなので、本番で確かめてから ROADMAP のチェックを付ける
  - 注目議案は `publish_status = "published"` だけを出す（`findFeaturedBillsWithContents`）。準備中案件の404リンクが出ないこと
  - チャットAPIは `siteConfig.features.aiChat` のサーバー側ゲート、未公開議案の拒否、上限確認失敗時の fail-closed を持つ（`handle-chat-request.ts`）

---

## P2 インクルーシブデザイン・アクセシビリティ

### P2-3 インクルーシブデザイン・アクセシビリティ検証（AccessLint / WCAG 2.2 AA）
AccessLint（@accesslint/cli, @accesslint/mcp, skills）を用いたアクセシビリティおよびインクルーシブデザインの自動スキャン・手動検証・是正。

Acceptance:
- accessibility-scan / accessibility-audit による主要画面（トップ、議案一覧、議案詳細、難易度切替）の WCAG 2.2 AA 検査
- accessibility-inspect によるキーボード操作、フォーカス順序、スクリーンリーダー対応、ズーム・リフロー、タップターゲットサイズの検証
- accessibility-fix による検出された違反箇所の修正・是正
- accessibility-diff による回帰検知（PR差分のアクセシビリティ評価）

Progress (2026-09-25):
`@accesslint/cli scan` の自動検査で出た3件（トップの多言語案内 nav のラベル重複、`/guide/*` の article 内 aside、`/faq` の main ランドマーク欠落）を直した。
トップ（日・英）、`/guide/*`（5言語）、`/faq`、`/terms`、`/privacy`、`/councilors`、`/sessions/r8-2/bills`、議案詳細で違反0件。
ヘッダーのふりがな・言語切替の `aria-pressed` と44pxのタップ領域はコードで確認した。
キーボード操作・フォーカス順序・スクリーンリーダー・リフローの手動検証（accessibility-inspect）と accessibility-diff の回帰検知は未実施で、残作業。

---

## P3 多言語対応・ルビ確認

### P3-1 i18n UI
Acceptance:
language switch works without losing current bill.

Progress (2026-09-25):
ROADMAP の「UI translation」の残りは P8-12 の残作業（定例会の議案一覧・議員一覧・FAQ/規約などの下層ページ、議案詳細の見出し、英語文言のネイティブ確認、`<html lang>`）で扱う。2026-09-26 に FAQ/規約とネイティブ確認以外を済ませた。`<html lang>` は `ja` のままにすると決めた（P8-12 参照）。

### P3-4 翻訳・ルビ手動確認・編集機能（Translation & Ruby Review Tooling）
AI生成翻訳（generated）の対照確認・手動編集・公開承認（reviewed）および、
ルビ（ふりがな）の誤読確認・手動補正を行える管理画面・レビュー手段を整備する。
詳細は `docs/20260923_1650_翻訳およびルビ手動確認編集機能_要件定義.md` を参照。

Acceptance:
- 原文（日本語）と各言語の翻訳文を横並び（side-by-side）で対照確認・手動編集できるAdmin UI
- `source_hash` 照合による stale（原文変更あり）検知と変更差分（diff）の可視化
- 承認操作（`generated` → `reviewed`）および保存時の公開キャッシュ即時無効化（`CACHE_TAGS.BILLS` revalidate）
- ルビ（ふりがな）のリアルタイムプレビューおよび誤読補正・カスタムルビ辞書の管理機能

Progress (2026-09-23):
- Phase A（対照確認・手動編集・公開承認・キャッシュ無効化）は `admin/src/features/bill-translations/`（`/bills/[id]/translations`）で実装済み。
  承認時はレビュアーが見ていた日本語の `source_hash` を送り、保存時の日本語と違えば受け付けない。stale の翻訳の承認には明示の確認が要る。
- 2026-09-24: 原文の変更差分（diff）表示（TR-4）と一括確認の一覧画面（TR-7、`/bills/translations`）を実装した（#41）。
- 未着手: ルビ関連（RB-1〜5）。
- ルビのプレビューは保留。公開画面の議案本文は raw HTML を通さず（`<ruby>` は落ちる）、`【正式名称】［ふりがな］（＝言いかえ）` もそのまま文字として出る。
  利用者に見えるふりがなは外部スクリプト Rubyful V2 が付けるものだけなので、管理画面で独自にルビを描くと公開画面と食い違う。
  先に公開側の描画方針を決めること。

---

## P4 AIチャット・ガードレール

### P4-1 Chat guardrails
Acceptance:
- bill context only
- off-topic blocked before paid call where possible
- answer language follows user
- source shown

### P4-2 Cost ceiling
Acceptance:
- per-user daily cap
- total daily cap
- total monthly cap
- clear UI when cap reached

Progress (2026-09-25):
コードで確認した現状（`web/src/features/chat/server/services/handle-chat-request.ts` ほか）。
- 済み: 議案に紐づけ（クライアントの議案IDだけを信じ、本文はDBの公開データで置き換える。未公開は 403）
- 済み: ユーザー日次・システム日次・システム月次の上限（`env.chat.*CostLimitUsd`）と、上限を確認できないときの fail-closed
- 済み: 利用記録（`chat_usage_events` への記録）と、入力欄の「AIの回答は間違えることがあります」の注意書き
- 済み（プロンプトのみ）: 関係のない話題を断るルール（`COMMON_RULES_GENERIC`）
- 残り: 出典表示。回答に一次資料のどこを根拠にしたかを示す仕組みがない。デザインシステムの「出典が出せない答えは返さない」「AI生成文は一次資料と同じ見た目にしない」を満たすこと
- 残り: 回答言語を質問の言語に合わせる指示がプロンプトにない。英語表示でのチャットUI文言もまだ日本語
- 残り: 関係のない質問を有料APIの前に止める仕組みはない（`packages/shared/src/moderation/` は使っていない）
- 残り: 上限到達時の 429 文言が画面にどう出るか（`PromptInputError`）を確認する。英語表示での文言も要る

---

## P5 自動化・会期更新

### P5-2 令和8年第3回定例会の投入（ROADMAP Phase 5）
更新検知の下書きPR（#80、ブランチ `automation/shinjuku-council-update`）に第63〜80号議案・認定第1〜4号の22件が出ている。

Acceptance:
- 下書きを確認してインベントリ（`shinjuku-r8-3-inventory.ts` 相当）を作り、`monitor/targets.ts` の `KNOWN_SESSIONS` に `r8-3` を足す
- 議決前の案件は結果なし（未確定）として表示し、可決・否決と取り違えない
- 議決結果が公式に出たら、レビュー済みの本文を上書きせずに結果だけを更新する
- 解説（やさしい／ふつう／くわしく）は第2回定例会と同じ基準（claim ledger・公開レビュー）で整備する
- Exit: 会期の更新を1人で運用できる

Progress（2026-09-26）:
- インベントリ `packages/seed/main/shinjuku-r8-3-inventory.ts` を作り、`KNOWN_SESSIONS` に `r8-3` を足した。22件の識別名・件名・全文PDF・概要PDFは公式ページと実物のPDFで確認済み（全件 `decision: null`・非公開・未レビュー）。更新検知の実行結果は「未反映の変更なし」。
- 第76号議案の件名は一覧ページの表記「第2)期」をそのまま採用した（PDF本文は「第Ⅱ期」）。表示用に直すときは出典を併記する。
- 更新検知は、議決結果が未掲載のまま登録した会期（`decisionsUrl: null`）について、議決結果の一覧からその会期のページを毎回探す。掲載されると、各案件の議決結果が「未議決との食い違い」としてレポートに出る。そのとき結果だけをインベントリへ転記する。
- 残り: DB（ローカルシード・本番インポーター）への投入。本番インポーター（`import_production_inventory`）は全議案を1つの会期に紐づける作りなので、会期ごとに紐づけられるよう migration が要る。公開サイトの「現在の会期」（`is_active`）を r8-2 から r8-3 へ切り替える時期も決める（`findActiveCouncilSession` は `is_active = true` が2件あると取得に失敗する）。あわせて、未議決の議案の status（`bill_status_enum`）への対応付けを決める。解説の整備も未着手。

Progress（2026-09-27）:
- ローカルシードと本番インポーターを複数会期対応にし、R8-3 の22件を `submitted`・`coming_soon`・未レビューとして正しい会期へ紐づける実装を追加した。R8-3 を現在の会期、R8-2 を過去の会期として同期する。
- 議決結果だけを後日更新した場合も、既存の `bill_contents` を削除・上書きしないことをローカル Supabase の統合テストで確認した。
- 本番DBへの適用はPRのマージ後に dry-run、バックアップ、apply の順で行うため、現時点では未実施。解説（やさしい／ふつう／くわしく）と claim ledger の整備も引き続き未着手。

### P5-3 半自動化の残り（ROADMAP Phase 6）
会期ページの解析・変化の検知・定期実行・下書きPRは P5-1 で実装済み。

Acceptance:
- 全文PDFからのテキスト抽出
- 抽出したテキストから解説の下書き（`generated`）を作る
- Admin に、下書きを確認して公開に回すレビュー待ち一覧を置く
- Exit: 「更新を見つける」「下書きを作る」まで自動

---

## P7 議員・議会機能の拡張候補

### P7-2 任意機能の候補（ROADMAP Phase 7 の未着手分）
着手するときに要件を書き起こす。いまは候補の記録だけ。

- 会議録（minutes）と発言（speeches）の取り込み。7-B の会議録検索API（tenant 211）が使える。質問と議案の紐づけ（`council_member_questions.bill_id`）もここで入れる
- 委員会（committees）のページ
- 予算エクスプローラー（budget explorer）
- AI インタビュー。いまは設定で無効
- 更新通知（notifications）
- zh-Hant は 2026-09-24 の方針（議案の翻訳は英語のみ）で見送り。やるなら案内ページの追加として扱う
