# Roadmap

## Phase 0: Forkを新宿区化する

目標: データはまだ川崎fixtureでもよいので、新宿区ブランドでローカル起動する。

- [x] 自分のpublic repository作成
- [x] Kawasaki forkから開始
- [x] upstream remote追加
- [x] `site.config.ts`変更
- [x] admin config変更
- [x] `manifest.json`変更
- [x] 川崎文字列をgrep
- [x] Team Mirai promotional UIを非表示/除去
- [x] branding差し替え
- [x] license/disclaimer
- [x] CI branch filter更新

Exit:
`pnpm dev`で新宿区名のweb/adminが動く。

2026-09-16: worktreeでweb/adminの起動・表示を確認済み。検証記録は[Phase 0検証](20260916_1310_phase0-verification.md)を参照。本番デプロイは未検証。

## Phase 1: 1会期を正しく入れる

対象: 2026年第2回定例会（令和8年第2回定例会）

- [x] session作成（会期 2026-06-10〜2026-06-19、公式ページと一致）
- [x] bill metadata（承認2件 + 第42〜62号議案の全23件）
- [x] official PDF URL（全23件。実ファイルを取得し本文で内容確認済み）
- [x] official overview URL（4種の概要PDFを本文から収録範囲を確認して対応付け）
- [x] result status（原案可決21件 / 承認2件。承認案件の用語を区別）
- [x] source attribution（全件に全文PDF・概要PDF・一覧ページ・議決結果ページのURL）
- [x] 3件程度だけ先行してend-to-end
- [x] 全議案へ拡張

Exit:
公式ページと照合して欠落・重複がない。
→ **達成**。突合記録は `docs/20260916_1400_令和8年第2回定例会_公式突合記録.md`。

追加完了（Phase 1 の Exit 条件外）:
- [x] 23件すべての easy / normal / hard 日本語解説について公開レビューを完了し、
  シードを `published` へ移行（本番DBへの反映は Step 5 の残作業）。
- 委員会付託先・会派賛否・議案ごとの議決日は一次情報に記載がなく未取得。
- [x] `bill_number` の一意性を会期スコープへ変更（2026-09-18）。異なる会期の
  同一番号を許可し、同一会期内と会期未割り当てでは重複を拒否する。

## 本番デプロイ・稼働検証（Step 5）

Phase の進行とは別軸の、本番環境そのものに対する作業。Phase 1 の Exit 条件には
含まれない。「Step 5」は実装計画側の呼称をそのまま引き継いでいる。

- [x] 本番DBへ23案件・69変種を投入
- [x] Vercel再デプロイとHTTP 200を確認
- [x] セッション一覧で23案件を準備中として確認
- [ ] Adminの本番配備経路・URL・配備SHA・認可を確認
- [ ] 本番migration履歴、制約、出典列を直接確認
- [x] `clearAllData()` を使わない本番専用インポーターを整備し、本番で実行
- [ ] 復旧手順をローカルまたは検証環境でリハーサル
- [x] 公開レビューを完了し、23案件の詳細ページを公開
      （2026-09-19の破壊的シードで公開状態になった。2026-09-23に本番DBと
      公開画面で確認）
- [x] 破壊的シードが本番に投入したデモのインタビュー・レポートを削除（2026-09-23）
- [x] 本番environmentに `main` 限定のブランチ制限を設定（2026-09-23）
- [ ] 難易度別本文・出典導線・AIチャットを本番画面で確認
- [ ] 全23案件の一次資料リンクとモバイル表示を確認し、証跡を保存
- [ ] 注目議案から準備中案件を除外し、404リンクの再出現を解消
- [ ] 公開前のAIチャットをサーバー側で停止し、コスト制御をfail-closedにする
- [ ] 再シード完了時に関連キャッシュを即時無効化する

2026-09-18: 23案件・69変種の投入と再デプロイは完了した。ただし、
`clearAllData()` でチャット、インタビュー、レポートを含む既存データを削除する
手順だったため、安全な本番投入としては未達。全案件も `coming_soon` のため
公開稼働していない。再デプロイ後に注目議案の3リンクが404となり、いったん
消えた後も1時間超で新UUIDの準備中3案件として再出現した。AIチャットAPIにも
サーバー側の停止ゲートがない。
検証記録は
[Step 5 本番環境検証](verification/20260918_1830_step5_production_verification.md)
を参照。

2026-09-19: シードの全23案件を `published` / `is_review_completed: true` に切り替えた
（#25）。ただし本番DBへ反映する手段が `seed_production.yml` →
`clearAllData()` しかなく、チャット・インタビュー・レポートを消してしまうため、
まだ実行していない。本番は `coming_soon` のままである。
**訂正（2026-09-23）:** この記述は誤り。#25のマージ直後（2026-09-19 06:11 JST）に
`Seed Production DB (DESTRUCTIVE / 破壊的)` が実行され
（[run 35395454270](https://github.com/OchiK/miraigikai-Shinjuku/actions/runs/35395454270)）、
既存データを削除したうえで23案件を公開状態にし、デモのインタビュー100件・
メッセージ440件・レポート60件を本番へ投入していた。
安全な投入手順は
[本番シード安全化計画](20260919_0700_本番シード安全化計画.md)
に設計した。あわせて、公開後の一覧が議案番号順にならない
（同一会期は `published_at` が全件同一で並びが不定になる）問題を
`bills.bill_number_order` の追加で解消した。

2026-09-23: 非破壊の本番専用インポートを実行し、対象5テーブルのバックアップ、
差分確認、トランザクション内インポート、Vercel再ビルドを完了した。本番DBは
インベントリと一致しており、追加・更新・削除対象は0件だった（公開状態は
上記の2026-09-19の破壊的シードによるもので、このインポートで変わったものはない）。公開画面では
令和8年第2回定例会の23案件、承認第2・3号から第42〜62号議案までの順序、
代表4案件の3難易度表示と一次資料リンクを確認した。キャッシュ無効化は
`WEB_PUBLIC_URL` / `REVALIDATE_SECRET` が未設定のためスキップされ、上の該当項目は
未完了のままとする。破壊的シードが入れたデモのレポートは「実際のインタビュー」
として公開画面に表示されている。Applyは未マージのブランチから本番environmentで
実行できてしまった。詳細は
[本番公開確認記録](verification/20260923_本番公開確認記録.md)を参照。

## Phase 2: やさしい日本語

- [x] `easy` difficultyを新規migrationで復活
- [x] shared type/UI selector更新
- [x] Admin編集対応
- [x] prompt作成
- [x] 3議案で品質確認
- [x] 全23案件の easy 本文整備
- [x] easy/normal/hard切替（本番の代表4案件で切替表示を確認、2026-09-23）
- [ ] インクルーシブデザイン・アクセシビリティ検証（AccessLint / WCAG 2.2 AA）

Exit:
easyが単なる短縮ではなく、行政日本語の平易化になっている。
→ **達成**。全23案件で本文整備と公開レビューが完了し、
easy / normal / hard の3難易度をシード側で公開対象としている
（本番の代表4案件でも表示を確認済み）。

2026-09-18: 第42・43・44号議案の3件にやさしい日本語版を整備した。
1文40字以内・行政用語の言い換え・数値の非改変は
`packages/seed/main/easy-japanese-validation.test.ts` で機械的に検証する。
出典は normal 版と同じ一次資料の同じ箇所を引き継ぎ、
`docs/verification/20260918_0930_claim-ledger-phase2-easy.csv` に台帳化した。
2026-09-18: 残る20件（承認第2・3号、第45〜62号議案）も同じ基準で整備し、
令和8年第2回定例会の全23案件に easy 版がそろった。
アンカー保持プロトコル（初出は【正式名称】［ふりがな］（＝言いかえ）、
2回目以降は【正式名称】のみ）は、初出位置そのものを検証するテストで固定した。
内容ハッシュは 69変種（23案件 × 3難易度）を
`packages/seed/main/bill-contents-revision.test.ts` で固定している。

## Phase 3: 多言語基盤

- [x] i18nライブラリ選定（当面は入れない。決定記録 §3）
- [x] locale config
- [ ] UI translation（翻訳まわりの案内3種のみ済み。UI全体は未着手）
- [x] translation table
- [x] source hash / stale tracking（読み出し時照合。stale への自動更新は未着手）
- [x] language switcher
- [x] fallback

順序:
1. en
2. zh-Hans / ko
3. ne / my / vi

Exit:
同一議案を7localeで表示できる。

2026-09-23: 基盤を実装した。ロケールは Cookie（`?lang=` 併用）で持ち、URL は変えない。
翻訳は `bill_content_translations` に置き、`reviewed` かつ日本語のハッシュが一致するものだけを公開する。
方式と手順は `docs/20260923_1500_多言語基盤_ロケール方式の決定記録.md`。
公開済みの翻訳はまだ0件（シードの英訳1件は `generated`）で、Exit は未達。

## Phase 4: AI chat

- [ ] bill-context chat
- [ ] source citation
- [ ] language mirroring
- [ ] off-topic guard
- [ ] per-user daily cost
- [ ] system daily cost
- [ ] system monthly cost
- [ ] AI disclaimer
- [ ] usage logging

Exit:
設定上限を超えるAI費用が発生しない。

## Phase 5: 第3回定例会 live

- [ ] 2026年第3回定例会を投入
- [ ] new/updated bill検出
- [ ] result未確定状態
- [ ] 後日result update

Exit:
実際の会期更新を1人で運用できる。

## Phase 6: 半自動化

- [ ] session page parser
- [ ] PDF discovery
- [ ] PDF text extraction
- [ ] hash change detection
- [ ] draft generation
- [ ] admin review queue
- [ ] scheduled run

Exit:
「更新を見つける」「下書きを作る」まで自動。

## Phase 7: Optional

- [ ] minutes
- [ ] speeches
- [ ] committees
- [ ] budget explorer
- [ ] zh-Hant
- [ ] AI interview
- [ ] notifications
