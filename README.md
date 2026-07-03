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
  - 短縮時間の計算根拠、連続成果記録、次の1時間短縮までの目安
  - FIREまであと何年
  - 市場・副業・配当・支出の内訳
  - ホームから副業・節約の成果をワンタップ記録
  - ワンタップ成果ボタンの金額・表示名をユーザー設定で変更
  - ワンタップ記録直後に編集・取消できるスナックバー
  - 市場変動に左右されない確定短縮時間
- 記録
  - 副業・配当・支出・節約の成果記録を最上部に配置
  - 月次資産更新
  - 投資銘柄を選択し、現在評価額だけで投資資産と市場変動を自動反映
  - 暗号資産はBTC / ETH / XRP / SOLを選択し、保有数量から円評価額を自動取得
  - ETF / 投資信託 / 個別株を切り替えて、銘柄名やティッカーで検索候補を表示
  - 検索候補をタップして銘柄追加、候補がない場合は検索結果無しを表示
  - 右上の全体更新ボタンで投資資産・市場変動・年間配当を再計算
  - 保有銘柄一覧は折りたたみ式で、追加操作を邪魔しない
  - 投資信託は楽天証券 / SBI証券の積立ランキング上位を意識した順番で表示
  - 共有しやすいよう初期ポートフォリオは空の状態から開始
  - 年間配当金は保有銘柄の評価額と配当・分配利回りから税引前概算で自動計算
  - 配当予定月には概算配当を成果記録へ自動追加
- 振り返り
  - FIRE短縮と前年比の比較
- 設定
  - 生年月日から実年齢とFIRE予想年齢を自動計算
  - 毎月積立額をFIRE到達年数に反映
  - 配当で叶えたい目標を自由に設定
  - Google / メールログインとクラウド同期
  - バックアップ書き出し / 読み込み

## 運用方針

- 新規ユーザーの初期状態は現在資産・保有銘柄・資産履歴を空にしています
- FIRE計画は仮に毎月積立額50,000円から始まり、設定で自分の前提に変更できます
- FIRE年数は投資資産、毎月積立額、年利、その他年間増加、配当、副業利益を月次複利でシミュレーションします
- 月間支出を入力した場合、FIRE目標額は4%ルールに基づき年間支出の25倍で自動計算します
- FIRE年数の利回りは「自分で決めた想定利回り」または「保有銘柄の想定リターンを評価額で加重平均」から選択できます
- 保有銘柄ベースの想定リターンは、配当利回りとは別のFIRE計算用数値を使った概算で、証券会社の実績利回りや将来リターンを保証するものではありません
- 毎日または評価額を見た日: `記録` で銘柄ごとの現在評価額を更新
- 暗号資産は数量を入力し、右上の全体更新で円評価額を取得
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
