# Roadmap

## Phase 0: Forkを新宿区化する

目標: データはまだ川崎fixtureでもよいので、新宿区ブランドでローカル起動する。

- [ ] 自分のpublic repository作成
- [ ] Kawasaki forkから開始
- [ ] upstream remote追加
- [ ] `site.config.ts`変更
- [ ] admin config変更
- [ ] `manifest.json`変更
- [ ] 川崎文字列をgrep
- [ ] Team Mirai promotional UIを非表示/除去
- [ ] branding差し替え
- [ ] license/disclaimer
- [ ] CI branch filter更新

Exit:
`pnpm dev`で新宿区名のweb/adminが動く。

## Phase 1: 1会期を正しく入れる

対象: 2026年第2回定例会

- [ ] session作成
- [ ] bill metadata
- [ ] official PDF URL
- [ ] official overview URL
- [ ] result status
- [ ] source attribution
- [ ] 3件程度だけ先行してend-to-end
- [ ] 全議案へ拡張

Exit:
公式ページと照合して欠落・重複がない。

## Phase 2: やさしい日本語

- [ ] `easy` difficultyを新規migrationで復活
- [ ] shared type/UI selector更新
- [ ] Admin編集対応
- [ ] prompt作成
- [ ] 3議案で品質確認
- [ ] easy/normal/hard切替

Exit:
easyが単なる短縮ではなく、行政日本語の平易化になっている。

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
