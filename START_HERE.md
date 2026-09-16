# みらい議会＠新宿区 スタートパック

このフォルダは、個人・趣味で運営する「みらい議会＠新宿区」をIDE上で立ち上げるための設計土台です。

## まずやること

推奨ベースは川崎版です。地方議会向けの設定集約、AIチャット、AIコストガードがすでに入っているため、本家から直接始めるより変更量を抑えられます。

```bash
git clone -b kawasaki/develop https://github.com/kozosophia-lgtm/mirai-gikai-kawasaki.git mirai-gikai-shinjuku
cd mirai-gikai-shinjuku

git remote rename origin kawasaki
git remote add upstream https://github.com/team-mirai/mirai-gikai.git

# 自分の公開GitHubリポジトリを作ったあと
git remote add origin git@github.com:<YOUR_GITHUB_USER>/mirai-gikai-shinjuku.git

# 趣味運営なら main 1本でもよい
git switch -c main
git push -u origin main
```

次に、川崎版READMEに従ってローカル起動します。

```bash
npx supabase start
cp .env.example .env
pnpm install
pnpm db:reset
pnpm dev
```

起動できたら、以下の順で変更します。

1. `web/src/config/site.config.ts` と `admin/src/config/site.config.ts` を新宿区向けに変更
2. ロゴ、色、ヒーロー、OGP、PWAアイコンを独自化
3. フッターに独立運営の明示、GitHub公開リポジトリへのリンクを追加
4. 川崎固有文字列をgrepして除去
5. 2026年第2回定例会をテストデータとして1件ずつ入れる
6. 「やさしい日本語」を復活させる
7. 多言語データモデルを追加
8. 議案ページ限定AIチャットを動かす
9. 第3回定例会を最初のライブ更新対象にする
10. その後に自動取得を作る

## 最初の完成条件

MVPでは「何でもできる議会サイト」を目指しません。次が揃えば公開可能な第一版です。

- 新宿区の議案が一覧・詳細表示できる
- 公式資料へのリンクが必ずある
- 日本語の「やさしい / ふつう / くわしく」が選べる
- UIと議案説明を `ja / en / zh-Hans / ko / ne / my / vi` に拡張できる構造
- 議案ページから、その議案についてAIに質問できる
- AIがユーザーの言語で回答できる
- AIのユーザー別・全体日次・全体月次コスト上限がある
- AI生成・AI翻訳であることが明示される
- 本サービスが新宿区・新宿区議会・政党チームみらいの公式サービスではないことが明示される
- 改変版ソースコードが公開され、サイトからリンクされる

## IDEのAIエージェントに最初に読ませるもの

`AGENT_BRIEF.md` を最初に読ませ、その後 `docs/ROADMAP.md` の Phase 0 から進めてください。
