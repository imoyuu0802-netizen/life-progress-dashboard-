# 公開と確認

## 確認用: Vercel

確認URL:

https://life-progress-dashboard.vercel.app/

GitHubの `main` ブランチへPushすると自動で更新されます。

```bash
git push origin main
```

GitHubリポジトリ:

https://github.com/imoyuu0802-netizen/life-progress-dashboard-

## 本番用: Netlify

Netlifyはクレジット節約のため自動公開を停止しています。本番へ反映するときだけ実行します。

```bash
./scripts/publish-netlify.sh
```

対象ファイル:

- `index.html`
- `styles.css`
- `app.js`
- `sw.js`
- `manifest.webmanifest`
- `icon.svg`
- `netlify.toml`

## 運用メモ

- 現在のデータはブラウザ内に保存される
- Firebase設定とログインを行うまでは、スマホとPCのデータは同期しない
- 資産明細はスプレッドシートを正にして、アプリには月1で集計値を転記する
