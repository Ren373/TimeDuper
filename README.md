# TimeDuper Phase 1.5 — Brand UI

TimeDuper Phase 1.5は、iPhone Safari + Userscripts向けの最小プロトタイプです。Phase 1で実機PASSしたReels / Exploreブロックと端末内設定を変えず、TimeDuper独自の黒・白・ネオングリーンのブランドUIを追加しています。対象は `https://www.instagram.com/*` だけです。

## できること

- Instagram Webを開くと自動実行します。
- 初回は `Block Reels = ON`、`Block Explore = ON` で、Phase 0.1と同じブロック状態になります。
- 画面右下付近のTDロゴボタンから、TimeDuper独立の設定パネルを開けます。
- `Block Reels` がONのとき、Reels入口を可能な範囲で非表示にし、`/reel/` と `/reels/` への遷移をHomeへ戻してブロックします。
- `Block Reels` をOFFにすると、TimeDuperのReels非表示とURLブロックを解除します。
- `Block Explore` がONのとき、`/explore/` を指す主要ナビゲーション入口を可能な範囲で非表示にします。
- `Block Explore` をOFFにすると、TimeDuperのExplore非表示を解除します。
- 設定のON/OFFは再読み込みなしで反映し、Safariを閉じたりiPhoneを再起動したりしても端末内へ保持します。

Exploreは入口だけを非表示にします。`/explore/` の直接URLはブロックしません。ReelsだけがURL強制ブロックの対象です。

## 設定UIの構造

設定UIはInstagramの主要ナビゲーションやReact内部状態を改造せず、`document.body` の直下へTimeDuper独立DOMとして追加します。id/classはすべて `timeduper-` で名前空間化しています。

- 入口は46×46pxのタップ領域を持つTDロゴボタンです。ロゴ表示はタップ領域より小さく分離しています。
- iPhoneのsafe-areaをCSSの `env(safe-area-inset-*)` で考慮します。
- パネルはnear-black背景、白文字、ネオングリーンのアクセントで構成します。
- `QUICK SETTINGS` に `Block Reels` と `Block Explore` の2スイッチを表示します。
- 同じパネル内の説明ビューとして `About TimeDuper`、`How it works`、`Privacy` を表示します。外部ページは開きません。
- 背景タップ、`Close`、Escapeキーでパネルを閉じられます。
- 小画面で内容が長い場合は、Instagramページではなくパネル内部だけをスクロールします。
- ボタン、ダイアログ、スイッチにはaria属性を設定し、Escキーでも閉じられます。
- TimeDuper UIにはInstagramへのリンクを置かず、Reels / Explore判定対象にも含めません。

## ブランドアセット

正式な原本は [timeduper-td-logo.png](./assets/timeduper-td-logo.png) と [timeduper-full-logo.png](./assets/timeduper-full-logo.png) に保持し、編集・再圧縮していません。

単一の `timeduper.user.js` だけでiPhoneへ配布できるよう、原本から余白をクロップして縮小したindexed PNGを `assets/generated/` に分離し、同じバイト列をPNG data URIとしてUserscriptへ埋め込んでいます。

- Floatingボタン用: `assets/generated/timeduper-td-logo-128.png`、128×102、5,008 bytes
- About用: `assets/generated/timeduper-full-logo-280.png`、280×241、25,083 bytes
- PC相対パス、`file://`、外部画像URL、CDN、`@resource`、`fetch`には依存しません。

## 保存方式

保存にはUserscriptsが提供する非同期の `GM.getValue` / `GM.setValue` を使用し、処理を薄い `StorageAdapter` に分離しています。これらはiPhone/iPad/macOS向けUserscriptsの現行App Store版公式ドキュメントに記載されたAPIで、利用するAPIごとの `@grant` とcontent contextが必要です。そのため本スクリプトは `@grant GM.getValue`、`@grant GM.setValue`、`@inject-into content` だけを宣言します。[Userscripts現行App Store版の公式APIドキュメント](https://github.com/quoid/userscripts/tree/release/4.x.x#api)

Instagramの `localStorage`、Cookie、IndexedDBは使用しません。保存場所はSafari内のUserscripts拡張が管理する、このUserscript専用ストレージです。Instagramや外部サーバーへ保存・同期しません。

保存キーは `timeduper.settings.v1` の1つだけで、値は次の3項目だけです。

```text
schemaVersion: 1
blockReels: boolean
blockExplore: boolean
```

読み込み、形式検証、保存のいずれかに失敗した場合、設定変更を無理に続行せず、起動時は `Block Reels = ON`、`Block Explore = ON` の安全なデフォルトを使います。

## 保存しない情報

- Instagramユーザー名、アカウントID、認証情報、Cookie、パスワード
- DM本文、投稿本文、投稿画像、Stories、閲覧内容
- 現在URL、URL履歴、閲覧履歴
- Analytics、Tracking、広告識別子、利用統計
- 上記設定以外のInstagramデータ

## 設定のリセット

`TD` を開き、`Block Reels` と `Block Explore` を両方ONへ戻してください。保存オブジェクトが初期値で上書きされます。スクリプトを無効化しても保存済み設定がUserscripts側に残る場合がありますが、残る内容は上記boolean 2個とschema versionだけです。

## インストール・更新

1. iPhoneにUserscriptsを用意し、Safari拡張を有効にします。
2. Userscriptsからアクセスできる保存先へ `timeduper.user.js` を保存します。
3. Userscripts側でスクリプトを有効にします。
4. iPhoneの設定で、Userscripts拡張のWebサイトアクセスを `www.instagram.com` に許可します。
5. Userscriptsが `GM.getValue` と `GM.setValue` の権限を求めた場合、対象がこの2つだけであることを確認して許可します。
6. Safariで `https://www.instagram.com/` を開き、必要なら一度再読み込みします。

Userscriptsのバージョンによって追加方法や権限画面の表記が異なる場合があります。実機確認には [TEST_CHECKLIST.md](./TEST_CHECKLIST.md) を使用してください。

## 安定性とパフォーマンス

- href / URLを優先し、英語・日本語ラベルは構造的に確認できた主要nav内だけの補助判定です。
- `Search` / `検索`という文字だけでは非表示にしないため、DM、Followers、Following等の検索UIは対象外です。
- hrefベースの非表示はCSSへ任せます。
- `MutationObserver` は1個だけ生成します。主要nav発見後はnavと直近親を中心に監視し、document全体の監視はnav再探索中の最長10秒だけです。
- DOM差分は主に `addedNodes` を処理し、同一フレームの重複をまとめます。
- URL比較は標準イベントを優先し、1.5秒ポーリングは最終フォールバックです。ページがhiddenの間は停止します。
- 同じページへ二重注入されても、UI、Observer、イベント、タイマーを重複初期化しません。
- InstagramのHistory APIはhookしません。

## セキュリティとプライバシー

- TimeDuper自身の外部通信はありません。
- `fetch`、XHR、WebSocket、EventSource、`sendBeacon`を使用しません。
- `@require`、`@resource`、CDN、外部JavaScript、外部画像URL、iframeを使用しません。ブランド画像はローカル生成したPNG data URIです。
- Cookie、パスワード、認証情報、DM本文、投稿内容を読み取り・収集・保存しません。
- Analytics、Tracking、広告、自動Like、Follow、自動DMはありません。
- Instagram内部/private API、React内部状態、`fetch`等のhook、History API hookを使用しません。
- `eval`、`new Function`を使用しません。
- URLと表示中DOMのリンク先・主要navラベル以外を利用しません。

Instagram Web自身は通常どおりInstagramと通信しますが、TimeDuperが通信先や通信処理を追加することはありません。例外時は登録済み処理とTimeDuperの表示変更を解除し、Instagramの通常動作を優先するfail-open設計です。ただし、保存データの読み込み失敗時だけは要件どおり両ブロックONを初期値にします。

## 既知の制限

- InstagramのDOM、URL、ラベル変更により、対象入口が残る可能性があります。その場合はInstagram本体を壊すよりブロックを弱くする方向に失敗します。
- 日本語・英語以外はhrefで判定できる入口だけが対象になりやすくなります。
- CSSは対象リンク自体を隠すため、Instagramのレイアウトによって空白が残る場合があります。
- Instagram側のプログラム遷移を標準イベントやDOM変更で即時検出できない場合、ReelsがHomeへ戻るまで最大約1.5秒表示される可能性があります。
- 保存設定はUserscripts/Safariの拡張データを消去すると失われます。その場合は両方ONへ戻ります。
- 非同期の設定読み込みが完了するまで、起動直後にInstagramの入口が短時間見える可能性があります。
- 固定位置のTDロゴボタンはsafe-areaと下部ナビゲーションを避けていますが、将来のInstagram UI変更では位置調整が必要になる可能性があります。
- 320px級の小画面や大きな文字設定ではパネル内部のスクロール量が増える可能性があります。

## 一時停止・削除

Userscriptsで `TimeDuper Phase 0` を無効化するか、`timeduper.user.js` を削除してください。Instagramアカウント側にはTimeDuper設定を保存していません。保存設定も初期値へ戻したい場合は、無効化前に2つのスイッチをONへ戻してください。
