# Life Progress Dashboard

FIRE / Coast FIREに向けた「自由までの距離が見える」モチベーションダッシュボードです。

このアプリは家計簿ではありません。毎日開いたときに、FIREまでの残り時間と今日短縮した自由時間を確認することを目的にしています。

## 公開URL

本番（Netlify）:
https://profound-syrniki-51a45e.netlify.app/

確認用（Vercel）:
https://life-progress-dashboard.vercel.app/

## 主な機能

- ホーム
  - FIREまでのリアルタイムカウントダウン
  - 総資産
  - 今日の資産増減
  - 今日短縮した自由時間
  - 市場・副業・配当・支出の内訳
- 記録
  - 投資銘柄を選択し、現在評価額だけで投資資産と市場変動を自動反映
  - GoogleFinance候補、投信取得候補、手入力の投資先を選択可能
  - 初期ポートフォリオには楽天証券 / iGrowのスクリーンショット銘柄を登録済み
  - 副業・配当・支出・節約の成果記録
  - 月次資産更新
- 振り返り
  - FIRE短縮と前年比の比較
- 設定
  - 生年月日から実年齢とFIRE予想年齢を自動計算
  - 配当で叶えたい目標を自由に設定
  - Google / メールログインとクラウド同期
  - バックアップ書き出し / 読み込み

## 運用方針

- 毎日または評価額を見た日: `記録` で銘柄ごとの現在評価額を更新
- 月1: スプレッドシートで資産を集計
- 月1: 集計値を `月次` に転記
- 月1または大きく更新した日: `書き出し` でバックアップ

資産明細はスプレッドシートや証券口座を正とし、このアプリはFIREまでの距離とモチベーション確認に集中します。

## ローカル起動

このプロジェクトは静的HTML/CSS/JavaScriptだけで動きます。

```bash
python3 -m http.server 4173 --bind 0.0.0.0
```

PCで見る場合:

```txt
http://127.0.0.1:4173/
```

同じWi-Fiのスマホで見る場合:

```txt
http://<MacのIPアドレス>:4173/
```

MacのIPアドレス確認例:

```bash
ifconfig en0
```

## Vercel確認用デプロイ

このリポジトリは静的HTML/CSS/JavaScriptなので、ビルド設定なしでVercelへ公開できます。

### 1. GitHubへPush

このプロジェクトのGitHubリポジトリ:

https://github.com/imoyuu0802-netizen/life-progress-dashboard-

通常はCodexが変更をコミットして、次のコマンド相当でPushします。

```bash
git push -u origin main
```

### 2. Vercelと連携

1. https://vercel.com/new を開く
2. `Continue with GitHub` でGitHubログイン
3. `life-progress-dashboard-` の右にある `Import` を押す
4. Framework Presetは `Other` のまま
5. Build Command、Output Directory、Install Commandは空欄のまま
6. `Deploy` を押す
7. `https://life-progress-dashboard.vercel.app/` を確認用URLとして使う

GitHub連携後は、PushするたびにVercelが自動更新します。Netlifyへのコミット時自動公開は停止しているため、確認だけでNetlifyクレジットは消費しません。

GoogleログインもVercelで使う場合は、Firebase Consoleの `Authentication > Settings > Authorized domains` に `life-progress-dashboard.vercel.app` を追加してください。

### 3. スマホで確認

1. Vercelの `Visit` を押してURLを開く
2. URLをLINEやメモなどでスマホへ送る
3. iPhone/AndroidのChromeまたはSafariで開く
4. ホーム画面へ追加すると、次回からアプリのように開ける

## Netlify本番デプロイ

Netlifyは本番用として残します。クレジット節約のため、自動公開は停止済みです。

本番へ反映するときだけ、プロジェクトルートで次を実行します。

```bash
./scripts/publish-netlify.sh
```

## データ保存と同期

ログイン前はブラウザ内の `localStorage` に保存されます。Firebaseを設定してログインすると、Cloud Firestoreの `users/{uid}` に保存され、別端末へ同期されます。

Firebaseの初期設定は [FIREBASE_SETUP.md](FIREBASE_SETUP.md) を参照してください。

データ保護のため、月次更新後に `月次 > 書き出し` でバックアップを保存してください。

## 今後の拡張候補

- Google Sheetsから月次集計値の自動取得
- 友達向けテンプレート化
