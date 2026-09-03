# TimeDuper Phase 4 — Usage Insights & BrainHeal

TimeDuper Phase 4は、iPhone Safari + Userscripts向けの最小プロトタイプです。Phase 3までの機能を維持し、端末内に保存したInstagram Webの日別利用時間から今日・今週・先週の利用状況を表示します。対象は `https://www.instagram.com/*` だけです。

## できること

- Instagram Webを開くと自動実行します。
- 初回は `Block Reels = ON`、`Block Explore = ON` で、Phase 0.1と同じブロック状態になります。
- 言語の初期値は `Automatic` です。Safariの優先言語が日本語なら日本語、それ以外は英語でTimeDuper UIを表示します。
- `Automatic`、`English`、`日本語`を切り替えると、再読み込みなしでTimeDuper UI全体へ反映します。Instagram本体の言語は変更しません。
- 画面右下のFloating TDロゴから全画面設定を開けます。
- `Daily Limit`は初期OFF、上限は60分、一時解除は5分です。
- Daily LimitがONの場合、残り15分・10分・5分で各1回警告し、残り5分以下は画面上部にカウントダウンを表示します。
- 上限到達時は独立したロック画面でInstagram操作を止め、ロック開始5分後に当日1回だけ設定時間の一時解除を利用できます。
- `Daily Target`は初期60分で、Daily Limitとは独立した利用目標として保存します。
- Brain Score記録開始日以降、各日の`Daily Target − 利用分数`を日次スコアとして確定し、累積が正なら`BrainHeal`、負なら`BrainRot`、0なら`Balanced`として表示します。Instagram Webを開かなかった日は利用0分として扱い、今日の差は小さく別表示します。
- Daily Targetの変更は今日の差へ即時反映しますが、確定済みの過去日スコアは書き換えません。
- 既存の直近14日の日別秒数から、Monday〜Sundayの今週・先週バーと週合計・差を計算します。今週の未来日は`—`で表示します。
- `Block Reels` がONのとき、Reels入口を可能な範囲で非表示にし、`/reel/` と `/reels/` への遷移をHomeへ戻してブロックします。
- `Block Reels` をOFFにすると、TimeDuperのReels非表示とURLブロックを解除します。
- `Block Explore` がONのとき、`/explore/` を指す主要ナビゲーション入口を可能な範囲で非表示にします。
- `Block Explore` をOFFにすると、TimeDuperのExplore非表示を解除します。
- 設定のON/OFFは再読み込みなしで反映し、Safariを閉じたりiPhoneを再起動したりしても端末内へ保持します。

Exploreは入口だけを非表示にします。`/explore/` の直接URLはブロックしません。ReelsだけがURL強制ブロックの対象です。

## 設定UIの構造

全画面設定UIとFloating TD入口は、InstagramのReactツリーや内部状態を改造せず、`document.body` の直下へTimeDuper独立DOMとして追加します。Instagram本来の項目は削除・並べ替えません。id/classはすべて `timeduper-` で名前空間化しています。

- Floating TDは46×46pxのタップ領域を持ち、ロゴ表示領域と分離しています。表示入口は常に1個です。
- iPhoneのsafe-areaをCSSの `env(safe-area-inset-*)` で考慮します。
- 全画面UIはnear-black背景、白文字、ネオングリーンのアクセントで構成します。
- `QUICK SETTINGS`、`TIME CONTROL`、`USAGE / INSIGHTS`、`LANGUAGE`、`ABOUT`を分けて表示します。
- 同じパネル内の説明ビューとして `About TimeDuper`、`How it works`、`Privacy` を表示します。外部ページは開きません。
- 画面端の背景、`Close`、Escapeキーで閉じられます。
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

保存キーは既存ユーザーの設定移行のため `timeduper.settings.v1` の1つを維持し、値は次の項目だけです。

```text
schemaVersion: 6
blockReels: boolean
blockExplore: boolean
language: "auto" | "en" | "ja"
dailyLimitEnabled: boolean
dailyLimitMinutes: 15 | 30 | 45 | 60 | 90 | 120 | 180 | 240
temporaryUnlockMinutes: 5 | 10 | 15
dailyTargetMinutes: 15 | 30 | 45 | 60 | 90 | 120 | 180 | 240
brainScoreState: {
  cumulativeFinalizedMinutes: signed integer
  lastFinalizedDate: "YYYY-MM-DD" | ""
  brainScoreStartDate: "YYYY-MM-DD"
}
usageByDate: { "YYYY-MM-DD": non-negative seconds }
timeControlState: {
  date: "YYYY-MM-DD"
  warnedThresholds: subset of [15, 10, 5]
  lockStartedAt: local timestamp | null
  temporaryUnlockUsed: boolean
  temporaryUnlockUntil: local timestamp | null
}
```

schema version 1〜5から、既存の `blockReels` / `blockExplore` / `language` / Time Control設定 / 日別履歴 / lock状態 / Daily Target / 累積確定スコアを保持してversion 6へ移行します。Brain Score開始日を確実に復元できない旧schemaでは、migration日のlocal dateを開始日にして既存累積値を保持し、推測した過去スコアは作りません。開始日以降は最終確定日の翌日から昨日までをすべて確定するため、未使用日も0分使用としてDaily Target分を加算します。日別履歴は直近14日へ整理し、それ以前は累積値として維持します。週次集計は保存せず表示時に計算します。

## 保存しない情報

- Instagramユーザー名、アカウントID、認証情報、Cookie、パスワード
- DM本文、投稿本文、投稿画像、Stories、閲覧内容
- 現在URL、URL履歴、閲覧履歴
- Analytics、Tracking、広告識別子
- 上記設定、Instagram Webの日別使用秒数、最小限のロック状態、累積スコア状態以外のInstagramデータ

## 設定のリセット

`TD` を開き、`Block Reels` と `Block Explore` を両方ON、`Language` を `Automatic`、`Daily Limit`をOFF、上限60分、一時解除5分、`Daily Target`を60分へ戻してください。日別使用時間も完全に消去する場合はUserscripts側でTimeDuperの保存データを削除してください。

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
- 使用時間はこの既存周期とvisibility/page lifecycleイベントを再利用し、timestamp差分を最大10秒ずつ加算します。hidden中は加算しません。
- 使用時間は約15秒ごと、およびbackground移行時に保存します。専用の新しいintervalやMutationObserverは追加しません。
- Usage InsightsはPhase 3の日別秒数を読み取り、端末のlocal dateとMonday始まりの週境界から画面表示時に計算します。新しい計測処理やタイマーは追加しません。
- 警告は前回残り時間から15分・10分・5分の閾値を跨いだときだけ、その日1回表示します。初回ロード時点ですでに閾値以下の場合は、過去の警告を遡って表示せず現在値を基準にします。
- 残り5分以下だけ、timestampから表示値を再計算する軽量な約1秒のone-shot timeoutを使用します。Safariの描画が遅れた場合は正しい残り時間へ追いつきます。
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
- Reels / Explore表示制御にはURLと表示中DOMのリンク先・主要navラベルだけを利用します。
- Time Controlは端末の現在時刻・ローカル日付・ページのvisibilityだけを利用します。

Instagram Web自身は通常どおりInstagramと通信しますが、TimeDuperが通信先や通信処理を追加することはありません。例外時は登録済み処理とTimeDuperの表示変更を解除し、Instagramの通常動作を優先するfail-open設計です。ただし、保存データの読み込み失敗時だけは要件どおり両ブロックONを初期値にします。

## 既知の制限

- InstagramのDOM、URL、ラベル変更により、対象入口が残る可能性があります。その場合はInstagram本体を壊すよりブロックを弱くする方向に失敗します。
- 日本語・英語以外はhrefで判定できる入口だけが対象になりやすくなります。
- CSSは対象リンク自体を隠すため、Instagramのレイアウトによって空白が残る場合があります。
- Instagram側のプログラム遷移を標準イベントやDOM変更で即時検出できない場合、ReelsがHomeへ戻るまで最大約1.5秒表示される可能性があります。
- 保存設定はUserscripts/Safariの拡張データを消去すると失われます。その場合は両方ONへ戻ります。
- `Automatic` はSafariの優先言語の先頭を確認し、日本語系なら日本語、それ以外は英語にフォールバックします。
- 非同期の設定読み込みが完了するまで、起動直後にInstagramの入口が短時間見える可能性があります。
- 固定位置のTDロゴボタンはsafe-areaと下部ナビゲーションを避けていますが、将来のInstagram UI変更では位置調整が必要になる可能性があります。
- 320px級の小画面や大きな文字設定ではパネル内部のスクロール量が増える可能性があります。
- Safariがvisibleのまま長時間停止した場合、異常な一括加算を避ける上限により実使用時間より少なく記録されることがあります。

## Phase 3実機テストを短くする方法

公開版にはデバッグUI、隠しURL、時間短縮用の裏口を含めません。コード改変なしで安全に確認する場合は、Daily Limitを最小の15分、一時解除を5分に設定し、実時間で確認してください。PCの隔離テストでは保存APIと時刻をモックした一時的テストハーネスを使用できますが、配布Userscriptには含めません。

## 一時停止・削除

Userscriptsで `TimeDuper Phase 0` を無効化するか、`timeduper.user.js` を削除してください。Instagramアカウント側にはTimeDuper設定を保存していません。保存設定も初期値へ戻したい場合は、無効化前に2つのスイッチをON、言語を `Automatic` へ戻してください。
