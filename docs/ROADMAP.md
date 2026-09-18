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

未達（Phase 1 の Exit 条件外）:
- 23件中18件は日本語解説が未整備のため `coming_soon` であり、公開表示はできない。
- 委員会付託先・会派賛否・議案ごとの議決日は一次情報に記載がなく未取得。
- [x] `bill_number` の一意性を会期スコープへ変更（2026-09-18）。異なる会期の
  同一番号を許可し、同一会期内と会期未割り当てでは重複を拒否する。

## Phase 2: やさしい日本語

- [ ] `easy` difficultyを新規migrationで復活
- [ ] shared type/UI selector更新
- [ ] Admin編集対応
- [ ] prompt作成
- [x] 3議案で品質確認
- [x] 全23案件の easy 本文整備
- [ ] easy/normal/hard切替

Exit:
easyが単なる短縮ではなく、行政日本語の平易化になっている。

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

- [ ] i18nライブラリ選定
- [ ] locale config
- [ ] UI translation
- [ ] translation table
- [ ] source hash / stale tracking
- [ ] language switcher
- [ ] fallback

順序:
1. en
2. zh-Hans / ko
3. ne / my / vi

Exit:
同一議案を7localeで表示できる。

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
