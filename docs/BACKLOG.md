# Backlog

現在対応中、または対応予定のバックログ一覧です。
完了済みのタスク（受入基準・進捗履歴）は [BACKLOG_ARCHIVE.md](./BACKLOG_ARCHIVE.md) に退避・記録されています。

---

## 完了済みタスク（アーカイブ参照）

完了したタスクの詳細は [BACKLOG_ARCHIVE.md](./BACKLOG_ARCHIVE.md) を参照してください。

| 分類 | 完了済みタスク ID |
| :--- | :--- |
| **初期基盤・会期** | P0-1, P0-2, P0-3, P0-4, P1-1, P1-2 |
| **本番稼働検証** | S5-2（本番DB確認）, S5-5（本番キャッシュ即時無効化） |
| **難易度・多言語** | P2-1, P2-2, P2-4（ヘッダー操作ボタンのコントラスト）, P2-5（Button ホバー）, P2-6（Button フォーカスリング）, P2-7（Organic 取り残し）, P3-2, P3-3, P3-5（英語のみ翻訳・5言語案内ページ） |
| **AIチャット** | P4-1（出典表示・事前フィルタ・多言語追従）, P4-2（コスト上限・Gemini 3.8 Flash 直結） |
| **自動化・制約** | P5-0（会期スコープユニーク制約）, P5-1（更新検知・ドラフト生成）, P5-2（R8-3解説・台帳・本番公開） |
| **議員機能** | P7-1（世田谷モデル議員ページ）, P7-3（公式Xアカウント表示・全38名調査） |
| **UI/UX・改善** | P8-1, P8-2, P8-3, P8-4, P8-5, P8-6, P8-7, P8-8, P8-9, P8-10, P8-11, P8-12, P8-13, P8-14, P8-15, P8-16, P8-17, P8-18, P8-19, P8-20, P8-21, P8-22 |

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
  - 本番環境での AI チャット稼働を確認（2026-10-03）: Google Gemini 3.8 Flash 直結による高速ストリーミング応答、出典チップ表示、日英追従、事前フィルタ、クォーテーション自動サニタイズ（PR #110, #111, #112）が正常稼働することを確認済み

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

Progress（2026-09-27）:
- ローカルシードと本番インポーターを複数会期対応にし、R8-3 の22件を `submitted`・`coming_soon`・未レビューとして正しい会期へ紐づける実装を追加した（PR #100 マージ済み）。
- 議決結果だけを後日更新した場合も、既存の `bill_contents` を削除・上書きしないことをローカル Supabase の統合テストで確認した。
- 本番DBへの適用を実施した（GitHub Actions `import_production.yml` run 36296467965 / 36296518540）。一次資料層のバックアップ artifact 取得、dry-run 差分確認、本番 apply、キャッシュ無効化（`bills`, `council-sessions`, `councilors`）、Vercel 再デプロイまで正常完了。
- R8-3 の解説作成・公開までは、トップページの表示チグハグ（ヘッダーは第3回だが公開議案が無く第2回の内容が表示される問題）を防ぐため、アクティブ会期（`is_active: true`）を解説が揃っている R8-2 に維持し、R8-3 は `is_active: false` とする修正（PR #101）を適用・本番同期完了（run 36297211700）。R8-3 はアーカイブ一覧から閲覧可能。
- 残り: R8-3 議案の解説（やさしい／ふつう／くわしく）と claim ledger の整備（P5-3 半自動化と連携して実施予定）。

Progress（2026-09-30）:
- R8-3 の22件すべてに、やさしい／ふつう／くわしくの解説（66変種）を作成した（`packages/seed/main/bill-contents-r8-3-data.ts`）。記録は `docs/20260930_0910_令和8年第3回定例会_22件_解説作成記録.md`。
- 主張台帳 `docs/verification/20260930_0910_claim-ledger-r8-3.csv`（1,183行: supported 1,050、needs_source 133、contradicted・unsupported 0）で一次資料と突合し、66変種の内容ハッシュを `bill-contents-revision.test.ts` で固定した（全147変種）。台帳の引用・数値・日付は機械照合し、生成ツールを `docs/verification/tools/r8_3/` に置いた。
- 独立検証（Codex）を経て全22件の公開レビューを完了とし（`reviewCompleted: true`）、R8-3 をアクティブ会期（`is_active: true`、R8-2 は `false`）へ切り替えた（PR #103 マージ済み）。
- 本番DBへの適用を実施した（GitHub Actions `import_production.yml` run 36654101586）。一次資料バックアップ、22件の `published` / `is_review_completed: true`、66件の `bill_contents` 追加、会期切り替え、キャッシュ無効化、Vercel 再デプロイまで正常完了。
- 残り: 閉会（10月15日）後の議決結果の転記、および66変種の審議状況の節（「まだ 決まって いません」「審議中です」「までです」）の更新と台帳再突合。

### P5-4 令和8年第3回定例会 議員提出議案（第11号・第12号）の追跡と投入（Councilor Bills 11-12 for R8-3）
新宿区議会公式の会期ページ（`gikai01_00123620210909_00008.html`）にて、令和8年第3回定例会の議員提出議案として条例案2件の提出が確認された。
- 議員提出議案第11号　新宿区シルバーパス購入費助成金交付条例
- 議員提出議案第12号　新宿区安心居住支援家賃の助成に関する条例

区長提出議案一覧ページ（`kuseijoho01_001109_03.html`）には載らないため、第2回定例会の議員提出議案（第7〜10号）と同様に議会公式記録から追跡・投入を行う。外部の政治家ブログ等の非公式・政党発信情報は中立性・検証性の観点から解説の根拠には含めず、議会公式の一次資料（会議録・審議結果PDF）のみを出典とする。

Acceptance:
- **先行対応（タイトル登録）**:
  - `packages/seed/main/shinjuku-r8-3-inventory.ts` に `itemType: "giin"` を追加し、第11号・第12号を公式件名・`publish_status: "coming_soon"`（解説未作成）として登録
  - 出典URLは議会会期ページ（`https://www.city.shinjuku.lg.jp/kusei/gikai01_00123620210909_00008.html`）を指定
  - 会期議案一覧画面（`/sessions/r8-3/bills`）の「これから掲載される議案」セクションに件名・議案番号が表示されることを確認
  - `shinjuku-r8-3-inventory.test.ts` および関連シードテストを更新（全22件→24件）
- **本番解説作成（審議・閉会後）**:
  - 常任委員会（10月7〜8日）および閉会本会議（10月15日）の会議録、または閉会後に発行される「議案の概要と審議結果」PDFから提案内容・各会派の賛否結果を取得
  - 意見書等の追加提出があれば合わせて確認・インベントリ反映
  - やさしい／ふつう／くわしく解説と主張台帳（claim ledger）を作成し、一次資料突合・公開レビュー完了後に本番DBへ反映

Progress（2026-10-01）:
- 先行対応（タイトル登録）を実装した。会期ページ（2026-10-01 取得）の記載どおりの識別名・件名で、`itemType: "giin"` の2件を `fullTextPdfUrl: null`・`overviewPdfUrl: null`・`decision: null`・`coming_soon`・`is_review_completed: false`・出典 `R8_3_COUNCIL_SESSION_URL` としてインベントリに追加した（slug: `shinjuku-2026-r3-giin-11` / `-12`）。
- P5-1 監視（`packages/seed/monitor/targets.ts`）の R8-3 比較からは、R8-2 と同様に議員提出議案を外した（区長提出議案ページに載らないため）。
- シードテストを24件（区長提出22件 + 議員提出2件）前提に更新した。解説・主張台帳・やさしい日本語の検証は解説のある22件のまま。
- 2026-10-02: 先行対応（第11号・第12号のタイトル登録）を PR #107 でマージし、GitHub Actions（`import_production.yml` run 36839819837）により本番DBへ反映完了。本番の会期議案一覧（`/sessions/r8-3/bills`）の「これから掲載される議案」セクションに正常表示されていることを確認済み。
- 残り: 閉会（10月15日）後の議決結果・討論・会議録の反映および3難易度の解説・主張台帳の作成（P5-4 本番解説作成）。


### P5-5 令和8年第1回定例会（R8-1）の議案データ整備と投入（R8-1 Session Bills Ingestion）
サイトのヘッダーや定例会一覧（`/sessions/r8-1/bills`）に「令和8年 第1回定例会」が会期として掲載されているが、現在紐づく議案データが登録されていないため、ページを開いても0件（空状態）となっている。
新宿区議会公式の提出議案ページ（`https://www.city.shinjuku.lg.jp/kusei/kuseijoho01_001109_01.html`）および審議結果に基づき、第1回定例会の議案データを整備・投入する。

Acceptance:
- **Phase 1: インベントリ作成・先行タイトル登録（空状態の解消）**:
  - 区長提出議案42件（第1〜9号・第37〜40号の当初・補正予算案13件、第10〜36号・第41号の条例等28件、承認第1号1件）の公式件名、識別名（slug）、全文PDF URL、概要PDF URL、議決結果（可決等）を整理し、`packages/seed/main/shinjuku-r8-1-inventory.ts` を作成する
  - 議員提出議案（意見書等）の有無を公式記録から確認し、存在する場合は合わせて追加する
  - `council_sessions`（`slug: "r8-1"`）に紐づく議案として登録し、`/sessions/r8-1/bills` で一覧表示されることを確認する
  - シードテスト・関連付けテストを整備し、GitHub Actions（`import_production.yml`）で本番DBへ反映する
- **Phase 2: 解説作成・公開レビュー（段階的展開）**:
  - 令和8年度当初予算（第1号議案）をはじめとする主要議案を中心に、やさしい／ふつう／くわしくの3難易度解説と主張台帳（claim ledger）を作成する
  - 一次資料突合および公開レビュー（Codex）を経て順次 `published` / `is_review_completed: true` に更新する

Progress（2026-10-03）:
- Phase 1（区長提出議案42件のインベントリ作成・先行タイトル登録）を PR #115 で実装・マージした。
- 新宿区公式の提出議案一覧ページ（`kuseijoho01_001109_01.html`）および議決結果ページ（`soumu01_002090_00015.html`）の実物と突合し、区長提出議案全42件（予算案13件、条例等28件、承認第1号1件）を `packages/seed/main/shinjuku-r8-1-inventory.ts` として新規追加した。
- 議決結果は全件確定済み（原案可決41件、承認1件）であり、DB enum に適合する `status: "approved"` / `status_note: "本会議で原案可決"`（承認は「本会議で承認」）として登録。
- 続いて議員提出議案6件（条例案5件、意見書1件）の追加登録を PR #117 で実装・マージした。議会公式の会期ページ（`file08_05_0003820210204_00013.html`）、「議案の概要と審議結果」PDF（`000452334.pdf`）、「可決した意見書」ページ（`file08_05_0004020210118_00006.html`）と突合。第1〜5号は否決（`fullTextPdfUrl: null`, `decision: "否決"`）、第6号は可決（`fullTextPdfUrl: 000452351.pdf`, `decision: "原案可決"`）として登録した。
- 解説未作成のため全48件を `publish_status: "coming_soon"` / `is_review_completed: false` / `published_at: null` とし、`packages/seed/main/data.ts` の `bills`（51件→99件）および `billSessionSlugByBillSlug` に接続。
- `packages/seed/monitor/targets.ts` の `KNOWN_SESSIONS` に `r8-1` を追加（議員提出議案は区長一覧と比較しないよう除外）、監視パーサに公式表記「承認第1号_専決処分の承認について」の `_` 区切り対応を追加して誤検知を防止。
- シード・インベントリ・監視照合のテスト（全1,368件）が全ワークスペースで通過することを確認。
- 本番DB反映: GitHub Actions（`import_production.yml` run 37095112923）により本番DBへ非破壊反映（新規6件・既存93件変更なし）を完了。本番の `/sessions/r8-1/bills` にて48件すべての正常表示を確認済み。これにより Phase 1（空状態の解消）が完了。
- Phase 2 パイロット（主要5議案の3難易度解説作成・主張台帳突合・公開レビュー）を PR #119 で実装・マージした。
  - 対象5議案: 第1号議案（令和8年度一般会計予算）、第5号議案（令和7年度一般会計補正予算第12号）、第20号議案（特定乳児等通園支援事業基準条例）、第31号議案（大規模マンション等市街地環境整備条例）、議員提出議案第6号（民泊制度見直し意見書）。
  - 各議案についてやさしい／ふつう／くわしくの3難易度解説（計15変種）を `packages/seed/main/bill-contents-r8-1-data.ts` に作成し、一次資料（各全文PDF・概要PDF）の全事実主張を網羅する主張台帳（`docs/verification/20261003_1330_claim-ledger-r8-1-pilot.csv`、計482行）を整備。
  - `easy-japanese-validation.test.ts`（1文40字以内、アンカー保持プロトコル）、`bill-contents-revision.test.ts`（本文sha256と台帳ハッシュの一致）、`seed-associations.test.ts` などの全テストを通過。
  - 対象5議案の `publish_status: "published"` / `is_review_completed: true` への更新を反映し、GitHub Actions（`import_production.yml` run 37099619443）により本番DBへ非破壊反映完了。本番の議案詳細ページ（`/bills/[id]`）にて5件すべての正常表示・解説閲覧を確認済み。
- 続いて議員提出議案第1号〜第5号（否決された条例案5件）の3難易度解説作成・本会議少数意見報告（実際の発言・spoken parts）組み込み・主張台帳突合・公開レビューを PR #121 で実装・マージした。
  - 対象5議案: 議員提出議案第1号（介護・福祉人材奨励金条例）、第2号（保健事業使用料等廃止条例）、第3号（安心居住支援家賃助成条例）、第4号（学用品給付条例）、第5号（修学旅行費無償化条例）。
  - R8-2 の議員提出議案モデルを踏襲し、本会議（2026年3月24日、会議録ID: 3163 schedule: 5）での杉山直子議員（共産, minute 12, 100）、高月まな議員（共産, minute 106）、さわいめぐみ議員（れいわ, minute 108）、近藤なつ子議員（共産, minute 115）の少数意見報告（発言内容・要点）および委員会審査決定・起立採決（否決・会派別態度）を3難易度解説（15変種）に組み込んだ（`packages/seed/main/bill-contents-r8-1-giin-data.ts`、作業記録: `docs/20261003_1600_令和8年第1回定例会_議員提出議案5件_解説作成記録.md`）。
  - 主張台帳 `docs/verification/20261003_1600_claim-ledger-r8-1-giin.csv`（UTF-8 BOM付き、417行すべて supported）を整備し、全15変種のハッシュ突合・機械検証を実施。
  - 対象5議案の `publish_status: "published"` / `is_review_completed: true` への更新を反映し、GitHub Actions（`import_production.yml` run 37111865171）により本番DBへ非破壊反映完了。本番の議案詳細ページ（`/bills/[id]`）にて5件すべての正常表示・解説および本会議発言の閲覧を確認済み。
- 続いて予算関連議案11件（第2・3・4・6・7・8・9・37・38・39・40号議案）の3難易度解説（33変種）を作成した（作業記録: `docs/20261003_2100_令和8年第1回定例会_予算議案11件_解説作成記録.md`）。
  - 全文PDF11件・補正予算概要PDF3件・「議案の概要と審議結果」・議決結果ページ・本会議会議録（2026年3月24日）と突合し、主張台帳 `docs/verification/20261003_2100_claim-ledger-r8-1-budgets.csv`（UTF-8 BOM付き、627行すべて supported）を整備。実装計画の予算規模（第2〜4号）・補正理由（第6〜9号・第37〜40号）・概要PDFのIDは一次資料と一致しなかったため、一次資料を採用した。
  - 11件を `publish_status: "published"` / `is_review_completed: true` に更新（インベントリ）。PR #123 でマージし、GitHub Actions（`import_production.yml` run 37121397154、事前の dry-run 37121325404 で議案更新11件・解説新規33件のみを確認）により本番DBへ非破壊反映した。本番の `/sessions/r8-1/bills` に公開議案21件のリンクが並び、第6・37・38号議案のページでやさしい版の題名・要約・議決表示を確認した。
- 続いて条例案 Group A 10件（第10〜19号議案）の3難易度解説（30変種）を作成し、PR #128 でマージ、本番DBへ反映した（作業記録: `docs/20261004_0630_令和8年第1回定例会_条例案GroupA10件_解説作成記録.md`）。
  - 全文PDF10件・条例案等提出案件概要・「議案の概要と審議結果」・議決結果ページ・本会議会議録（2026年3月24日）と突合し、主張台帳 `docs/verification/20261004_0630_claim-ledger-r8-1-ordinances-group-a.csv`（UTF-8 BOM付き、821行すべて supported）を整備。実装計画の「主な内容」欄は一次資料と一致しない箇所が多く（第10・15・16・17・18・19号など）、一次資料を採用した。第17号議案は共産が反対（起立採決、少数意見の報告あり）。見出しは AGENTS.md の全会期共通標準で固定し、30変種すべてをテストで検証している。
  - 本番反映は `import_production.yml`（dry-run で10議案の更新と30変種の追加だけを確認し、`dry_run: false, confirm: apply` で反映）。公開サイトの会期一覧と詳細ページで10件の公開を確認した。
- 残り: Phase 2 残余議案（区長提出の17件、条例等）の段階的解説作成。

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
