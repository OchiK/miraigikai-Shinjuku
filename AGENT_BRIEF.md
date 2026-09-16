# IDE Agent Brief: みらい議会＠新宿区

あなたは既存の `mirai-gikai-kawasaki` を新宿区向けに改変する実装エージェントです。

## プロジェクトの目的

新宿区議会の議案を、住民が理解しやすい形で閲覧・質問できる非公式の市民向け情報サイトを作る。

特に次を重視する。

- 公式日本語資料を唯一の一次情報として保持する
- 「やさしい日本語」を独立した表示レベルとして提供する
- 新宿区の外国人住民構成を踏まえて多言語対応する
- AI要約・翻訳・チャットを使うが、公式資料とAI生成内容を明確に区別する
- 個人・趣味運営なので、維持費と保守負担を小さくする
- 政党・候補者・議員への支持誘導はしない
- 政治的な評価やランキングをAIにさせない

## ベース

推奨ベース:
`kozosophia-lgtm/mirai-gikai-kawasaki`, branch `kawasaki/develop`

上流:
`team-mirai/mirai-gikai`

川崎版には以下がすでにある。

- Next.js / TypeScript
- Supabase / Postgres
- Admin
- AIチャット
- ユーザー単位の日次AIコスト制御
- システム全体の日次・月次AIコスト制御
- 地方議会向け `site.config.ts`
- AIインタビュー機能のfeature flag

## 重要な設計判断

1. サービス名は `みらい議会＠新宿区`。
2. 独立運営であり、新宿区、新宿区議会、政党チームみらいの公式サービスではない。
3. `features.aiChat = true`
4. `features.aiInterview = false` から開始。
5. `features.showTeamMiraiSection = false`
6. 党への寄付・宣伝CTAは独立サイトのUIから外す。
7. 日本語一次資料をcanonical sourceとする。
8. 翻訳文を一次資料扱いしない。
9. 多言語ターゲットは `ja`, `en`, `zh-Hans`, `ko`, `ne`, `my`, `vi`。
10. `やさしい日本語` はlocaleではなく日本語コンテンツのdifficultyとして扱う。
11. 日本語difficultyは `easy`, `normal`, `hard` の3段階。
12. 現行upstreamでは `easy` が後のmigrationで削除されているため、新しいmigrationとして復活させる。
13. 翻訳は日本語canonical contentから生成し、言語ごとに独立解釈させない。
14. AIチャットは原則として議案ページのコンテキストに限定する。
15. AIは質問言語で回答するが、根拠は日本語公式資料。
16. 根拠不足なら推測しない。
17. 政治家の動機推測、支持・不支持の推薦、選挙予測をしない。
18. MVPでは議事録全文検索・発言者解析は後回し。
19. MVPのデータ投入は最初は手動/半自動CSVでもよい。
20. 自動化より先に「正しい1会期」を完成させる。

## 開発順序

`docs/ROADMAP.md` に従う。

最初のデータfixtureは2026年第2回定例会。提出議案と議決結果が両方公開済みで、end-to-endテストに向いている。

最初のlive targetは2026年第3回定例会。

## 変更前の原則

- 既存の仕組みを再利用できる場合、新規実装しない。
- DB migrationを既存migrationの編集で済ませず、原則として新規migrationを追加する。
- UI文字列を新宿区名でハードコードせず、可能な限りconfig/i18nへ寄せる。
- localeとdifficultyを混同しない。
- AI出力をDBへ保存する場合、生成時刻・モデル・元ソース更新時刻またはhashを残す。
- source URLを失わない。
- すべての外部入力をtrusted HTMLとして直接描画しない。

## 最初に実行する確認

```bash
pnpm install
npx supabase start
pnpm db:reset
pnpm dev
```

次に:

```bash
grep -R "川崎" web/src admin/src packages --include="*.ts" --include="*.tsx" --include="*.md"
grep -R "チームみらい" web/src admin/src --include="*.ts" --include="*.tsx"
grep -R "donation" web/src admin/src --include="*.ts" --include="*.tsx"
```

変更は小さなコミットに分ける。
