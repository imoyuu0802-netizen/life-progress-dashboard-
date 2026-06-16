# 固定URL化

## 最短: Netlify

1. https://app.netlify.com/drop を開く
2. このフォルダ内のファイル一式をアップロード
3. 発行されたURLをスマホで開く

対象ファイル:

- `index.html`
- `styles.css`
- `app.js`
- `sw.js`
- `manifest.webmanifest`
- `icon.svg`
- `netlify.toml`

## GitHub Pages

1. GitHubで新しいリポジトリを作る
2. 上記ファイルをアップロード
3. Settings > Pages で `main` branch / root を公開
4. 表示された Pages URL を開く

## 運用メモ

- 現在のデータはブラウザ内に保存される
- スマホとPCでデータ同期はまだしない
- 資産明細はスプレッドシートを正にして、アプリには月1で集計値を転記する
