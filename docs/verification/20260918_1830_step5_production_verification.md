# Step 5 本番環境デプロイ・稼働検証記録

## 実施情報

- 実施日: 2026年9月18日
- 対象コミット: `2901ba49cc9f6b29f8d36d827ea463c867ccb11d`
- 本番Web: <https://miraigikai-shinjuku-web.vercel.app>
- 本番Supabase: `miraigikai-shinjuku`
  - Project Ref: `bdfkjdanycpxtoljxeho`
  - 認証情報やキーは記録していない。
- GitHub Actions:
  [Seed Production DB #35329624224](https://github.com/OchiK/miraigikai-Shinjuku/actions/runs/35329624224)
- Vercelデプロイ完了: 2026年9月18日 18:30 JST
- Vercel deployment job: `2SGyw2rFeChZ3i3AVUpv`
- GitHub Deployment: `6521445804`
  - `ref: main`
  - `sha: 2901ba49cc9f6b29f8d36d827ea463c867ccb11d`

## 判定

**69変種の投入とVercel再デプロイは技術的には成功した。安全な本番投入と
公開稼働の検証は未達。**

シード元では23案件すべてが `publish_status = coming_soon`、
`is_review_completed = false` である。公開レビューを終えていないため、
本番の議案詳細ページ、難易度別本文、出典リンク、AIチャットは確認できなかった。
さらに、再デプロイ直後はトップページにシード前の3案件がキャッシュから残り、
リンク先が404になった。いったん消えた後、1時間超の再確認では新しいUUIDの
準備中3案件が再び注目議案に現れ、リンク先はすべて404となった。現状を公開完了
とは判定しない。

## 1. 本番DBシード

| 項目 | 結果 | 証跡 |
|---|---|---|
| Workflow終了 | PASS | Run `35329624224`、exit status 0 |
| 対象SHA | PASS | `2901ba49cc9f6b29f8d36d827ea463c867ccb11d` |
| Council Sessions | PASS | 2 |
| Bills | PASS | 23 |
| Bill Contents | PASS | 69 |
| Faction Stances | PASS | 0 |
| Vercel hook | PASS | `PENDING` で受理後、GitHub Deploymentが `success` |
| デプロイSHA | PASS | Deployment `6521445804` の `ref` は `main`、`sha` は対象SHAと一致 |

ワークフローは既存データを削除してから投入した。ログでは
`Cleared existing data` の後に23案件、69本文を挿入している。

この処理は `packages/seed/main/run.ts` から `clearAllData()` を呼び、議案だけでなく
チャット、インタビュー、レポート、会期などの既存レコードも削除する。その後、
デモ用の一括生成分と固定デモを合わせ、インタビュー104件、メッセージ460件、
レポート64件も本番DBへ投入した。
今回の実行はユーザーの明示指示に基づくが、このワークフローを安全な本番更新手順
とは判定しない。次回の投入前に、既存データを保持する本番専用インポーターと
リハーサル済みの復旧手順が必要である。

## 2. VercelデプロイとHTTP

| 項目 | 結果 | 確認内容 |
|---|---|---|
| Web production deployment | PASS | 18:30 JSTに `Deployment has completed` |
| デプロイ対象 | PASS | GitHub Deployment APIで対象SHAとの一致を確認 |
| トップページ | PASS | HTTP 200 |
| セッション一覧 | PASS | `/sessions/r8-2/bills` がHTTP 200 |
| 応答ヘッダー | PASS | `server: Vercel`、`x-powered-by: Next.js`、`x-vercel-cache: MISS` |
| 本番migration履歴・スキーマ | NOT VERIFIED | seed成功だけでは適用済みmigrationと制約・出典列を証明できない |
| Admin deployment / 認可 | NOT VERIFIED | Web用hookのみが実行され、Adminの本番URLと配備経路を特定できなかった |

このセクションのPASSは公開Webに限定する。リポジトリのワークフローは
`deploy_web.yml` とWeb用Vercel hookのみを定義しており、Adminの本番ホスティング、
配備SHA、ログイン認可は今回の証跡から確認できなかった。

## 3. 本番コンテンツ

### 3.1 会期と23案件

`/sessions/r8-2/bills` で「令和8年 第2回定例会」を確認した。
「これから掲載される議案」には、承認第2号・第3号と第42〜62号議案の
計23件が表示された。川崎の文字列は画面本文に存在しなかった。

一方、公開済み件数は「0件」である。23件はすべて準備中カードで、
詳細ページへのリンクを持たない。

### 3.2 トップページのキャッシュ・公開条件不整合

通常難易度のトップページには、シード前に公開されていた次の3案件が
「注目の議案」として残っていた。

- 第42号議案
- 第49号議案
- 第53号議案

各リンクにはシード前のUUIDが埋め込まれている。第42号議案のリンク
`/bills/81849ccc-4dd1-451e-90c9-7856a78a8bac` はHTTP 404となり、
「議案が見つかりません」と表示された。「やさしい」に切り替えると
注目議案は0件になったため、難易度別キャッシュ間でも表示が一致していない。

18:45 JSTにCookieなしでトップページを再取得すると、旧UUIDと注目議案カードは
レスポンスからいったん消えていた。しかし、2026年9月19日 01:11 JSTの再確認では
新しいUUIDの第42号、第49号、第53号が注目議案として再び表示され、3リンクは
すべてHTTP 404だった。

`getActiveCouncilSession()` のキャッシュは1時間、注目議案は10分である。加えて、
`findFeaturedBillsWithContents()` は `is_featured = true` を条件にする一方、
`publish_status = published` を条件にしていない。関連キャッシュの明示的な無効化と、
準備中議案を注目一覧から除外するクエリ修正の両方が必要である。

### 3.3 サンプル詳細ページ

| 対象 | 結果 | 理由 |
|---|---|---|
| 第42・43・44号 | FAIL | `coming_soon` のため公開詳細ページなし |
| 第45・51・52号 | FAIL | `coming_soon` のため公開詳細ページなし |
| 承認第2号 | FAIL | `coming_soon` のため公開詳細ページなし |
| 第55・62号 | FAIL | `coming_soon` のため公開詳細ページなし |

計画には「第55号（契約）」とあるが、第55号は
「新宿区幼稚園教育職員の勤務時間、休日、休暇等に関する条例の一部を
改正する条例」である。契約案件は第57号、第58号、第61号、第62号である。
また、公開ルートは `/bill/[slug]` ではなく `/bills/[id]` である。

### 3.4 難易度切り替え

| 項目 | 結果 | 確認内容 |
|---|---|---|
| セレクター操作 | PASS | 「やさしい」を選ぶと `bill_difficulty_level=easy` が保存された |
| 23案件のeasy本文 | NOT VERIFIED | 全案件が `coming_soon` で本文を公開表示できない |
| アンカー、西暦・曜日、1文40字 | NOT VERIFIED | 公開詳細画面で確認できない |
| フォールバック不使用 | NOT VERIFIED | 公開詳細画面で確認できない |

ワークフローログにより69変種のDB投入は確認したが、件数確認を画面表示の
確認として扱わない。

### 3.5 一次資料リンク

公開詳細画面からは確認できなかった。代わりに、サンプル9案件の全文PDF、
4種類の概要PDF、提出議案一覧、議決結果ページへ直接アクセスし、全15 URLで
HTTP 200を確認した。PDFはすべて `application/pdf`、公式ページ2件は
`text/html` を返した。

これはサンプル9案件に限った部分確認であり、残る14案件の個別全文PDFと、
本番詳細画面に保存されたリンク値は **NOT VERIFIED**。

### 3.6 AIチャット

**サーバー側の無効化はFAIL**。匿名ログイン済みの本番ブラウザーから
`POST /api/chat` に空の `messages` を送る非課金リクエストを実行すると、HTTP 403
などの機能停止応答ではなく、認証通過後の業務エラーであるHTTP 400
「議案が指定されていません」を返した。公開詳細画面を隠してもAPI自体は停止して
いない。実装上も、APIルートには機能停止ゲートがなく、コスト上限チェック中の
予期しない例外はログ記録後に処理を継続する。

全案件が `coming_soon` のため、実際のモデル回答と出典表示は **NOT VERIFIED**。
本番で課金リクエストを発生させる検証は行っていない。

### 3.7 モバイル表示とスクリーンショット

**NOT VERIFIED**。今回の確認はデスクトップブラウザーとHTTP応答を対象とし、
モバイルviewportでの表示確認と証跡スクリーンショットの保存は行っていない。

## 4. 総合結果

| 検証対象 | 判定 |
|---|---|
| シードワークフロー実行 | PASS |
| 本番投入の非破壊性 | FAIL |
| WebのVercel再デプロイ | PASS |
| Adminの本番配備・認可 | NOT VERIFIED |
| 本番migration履歴・スキーマ | NOT VERIFIED |
| HTTP疎通 | PASS |
| 23案件の一覧存在 | PASS（準備中として表示） |
| 23案件の公開表示 | FAIL |
| 詳細ページ | FAIL |
| 難易度別本文 | NOT VERIFIED |
| 一次資料リンクの到達性 | PARTIAL（9案件と共通6 URLを直接確認） |
| 詳細画面からの出典導線 | NOT VERIFIED |
| AIチャットのサーバー側停止 | FAIL |
| AI回答と出典表示 | NOT VERIFIED |
| キャッシュ・公開条件の整合性 | FAIL（1時間超の再確認で準備中3案件と404リンクが再出現） |
| モバイル表示・スクリーンショット | NOT VERIFIED |

公開稼働へ進むには、公開レビュー担当者の承認後に
`hasPublishableContent` と `is_review_completed` を更新する必要がある。
再シード時にはUUIDが変わるため、デプロイだけに頼らず、トップページを含む
Vercel Data Cacheを確実に無効化する手順も必要になる。
また、公開前にAIチャットをサーバー側で確実に拒否する停止ゲートを追加し、
コスト上限チェックの予期しない失敗をfail-closedにする必要がある。
次回の本番データ更新では `clearAllData()` を使わず、stable slugをキーにした
upsertで既存の利用者データと運用データを保持する。
