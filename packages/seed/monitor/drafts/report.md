## 新宿区議会の更新を検知した（自動生成）

`pnpm monitor:shinjuku` が公式サイトとインベントリを比べた結果。
このPRはインベントリ・解説・DBを一切変更しない。変更するのは下書き（`packages/seed/monitor/drafts/`）と監視状態（`packages/seed/monitor/state.json`）だけ。

### 新しい会期

- **令和8年第4回定例会提出議案**（`r8-4`）: 19件
  - 提出議案: https://www.city.shinjuku.lg.jp/kusei/kuseijoho01_001109.html
  - 議決結果: 未掲載

### 未登録の案件（下書き）

すべて `reviewCompleted: false` / `hasPublishableContent: false`。

| 会期 | 識別名 | 件名 | 議決結果 | 全文PDF |
| --- | --- | --- | --- | --- |
| r8-4 | 第81号議案 | 令和8年度新宿区一般会計補正予算（第6号） | 未掲載 | https://www.city.shinjuku.lg.jp/content/000471815.pdf |
| r8-4 | 第82号議案 | 令和8年度新宿区国民健康保険特別会計補正予算（第2号） | 未掲載 | https://www.city.shinjuku.lg.jp/content/000471816.pdf |
| r8-4 | 第83号議案 | 新宿区次世代育成協議会条例の一部を改正する等の条例 | 未掲載 | https://www.city.shinjuku.lg.jp/content/000471817.pdf |
| r8-4 | 第84号議案 | 新宿区リサイクル及び一般廃棄物の処理に関する条例の一部を改正する条例 | 未掲載 | https://www.city.shinjuku.lg.jp/content/000471818.pdf |
| r8-4 | 第85号議案 | 新宿区立四谷小学校及び四谷子ども園機械設備改修その他工事請負契約 | 未掲載 | https://www.city.shinjuku.lg.jp/content/000471819.pdf |
| r8-4 | 第86号議案 | 公の施設の指定管理者の指定について | 未掲載 | https://www.city.shinjuku.lg.jp/content/000471834.pdf |
| r8-4 | 第87号議案 | 公の施設の指定管理者の指定について | 未掲載 | https://www.city.shinjuku.lg.jp/content/000471835.pdf |
| r8-4 | 第88号議案 | 公の施設の指定管理者の指定について | 未掲載 | https://www.city.shinjuku.lg.jp/content/000471836.pdf |
| r8-4 | 第89号議案 | 公の施設の指定管理者の指定について | 未掲載 | https://www.city.shinjuku.lg.jp/content/000471843.pdf |
| r8-4 | 第90号議案 | 公の施設の指定管理者の指定について | 未掲載 | https://www.city.shinjuku.lg.jp/content/000471844.pdf |
| r8-4 | 第91号議案 | 公の施設の指定管理者の指定について | 未掲載 | https://www.city.shinjuku.lg.jp/content/000471845.pdf |
| r8-4 | 第92号議案 | 公の施設の指定管理者の指定について | 未掲載 | https://www.city.shinjuku.lg.jp/content/000471846.pdf |
| r8-4 | 第93号議案 | 公の施設の指定管理者の指定について | 未掲載 | https://www.city.shinjuku.lg.jp/content/000471847.pdf |
| r8-4 | 第94号議案 | 公の施設の指定管理者の指定について | 未掲載 | https://www.city.shinjuku.lg.jp/content/000471848.pdf |
| r8-4 | 第95号議案 | 公の施設の指定管理者の指定について | 未掲載 | https://www.city.shinjuku.lg.jp/content/000471849.pdf |
| r8-4 | 第96号議案 | 公の施設の指定管理者の指定について | 未掲載 | https://www.city.shinjuku.lg.jp/content/000471850.pdf |
| r8-4 | 第97号議案 | 公の施設の指定管理者の指定について | 未掲載 | https://www.city.shinjuku.lg.jp/content/000471851.pdf |
| r8-4 | 第98号議案 | 公の施設の指定管理者の指定について | 未掲載 | https://www.city.shinjuku.lg.jp/content/000471852.pdf |
| r8-4 | 第99号議案 | 公の施設の指定管理者の指定について | 未掲載 | https://www.city.shinjuku.lg.jp/content/000471853.pdf |

### 次にやること

1. 公式ページ・PDFを開き、上の内容が正しいか確かめる。
2. 新しい会期ならインベントリ（`packages/seed/main/shinjuku-*-inventory.ts`）を別PRで作り、`packages/seed/monitor/targets.ts` の `KNOWN_SESSIONS` に足す。
3. 解説を書いて公開レビューを終えるまで `reviewCompleted` は `false` のままにする。
4. 名簿・会派・委員会の更新があればページを開き、`packages/seed/main/data.ts` の更新を別PRにするか判断する。
5. このPRは、監視状態を進めるためにマージするか、不要ならクローズする。
