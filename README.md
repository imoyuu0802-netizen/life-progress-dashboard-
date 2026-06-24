# Life Progress Dashboard

FIRE / Coast FIREに向けた「人生の進捗が見える」モチベーションダッシュボードです。

このアプリは家計簿ではありません。毎日開いたときに、今日も人生が前進していると感じることを目的にしています。

## 公開URL

本番（Netlify）:
https://profound-syrniki-51a45e.netlify.app/

確認用（Vercel）:
https://life-progress-dashboard.vercel.app/

## 主な機能

- ホーム
  - 総資産
  - FIRE達成率
  - 到達予想年齢
  - 資産推移
- 記録
  - 副業利益・節約の成果記録
  - 月次資産更新
  - 過去日付を含む前進記録
- 振り返り
  - 自由設定できる今月の勝利条件
  - FIRE短縮と過去の自分との比較
- 設定
  - 生年月日から実年齢とFIRE予想年齢を自動計算
  - ワンタップ前進を自由に追加・編集・削除
  - 配当で叶えたい目標を自由に設定
  - Google / メールログインとクラウド同期
  - バックアップ書き出し / 読み込み

## 運用方針

- 毎日: `入力` で前進を1タップ
- 月1: スプレッドシートで資産を集計
- 月1: 集計値を `月次` に転記
- 月1または大きく更新した日: `書き出し` でバックアップ

資産明細はスプレッドシートを正とし、このアプリは進捗とモチベーション確認に集中します。

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
