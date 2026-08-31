# TimeDuper 実機テストチェックリスト

## テスト環境

- [x] iPhone機種・iOSバージョンを記録した
- [x] SafariとUserscriptsのバージョンを記録した
- [x] `timeduper.user.js` バージョン `0.1.0` を有効にした
- [x] Userscriptsに `www.instagram.com` のアクセスを許可した
- [x] Instagram Webへログインした（認証情報はTimeDuperへ入力しない）

## 基本動作

- [x] `https://www.instagram.com/` を開いただけでTimeDuperが自動実行される
- [x] Homeが正常に表示・操作できる
- [x] Reelsボタンまたはメニューが消える
- [x] Exploreボタンまたはメニューが消える
- [x] DMが正常に表示・操作できる
- [x] Storiesが正常に表示・操作できる
- [x] Profileが正常に表示・操作できる
- [x] 通常投稿が正常に表示・操作できる

## URLブロック

- [x] Safariのアドレス欄から既存の `/reel/` URLを直接開くとHomeへ戻される
- [x] Safariのアドレス欄から `https://www.instagram.com/reels/` を直接開くとHomeへ戻される
- [x] Instagram内に残っているReelsリンクを押してもReelsへ遷移しない
- [x] 戻る・進む操作の結果が `/reel/` または `/reels/` になった場合もHomeへ戻される
- [x] Exploreの直接URLはPhase 0の仕様どおりブロックされず、入口の非表示だけが適用される

## SPA・再適用

- [x] Home → DM → Profile → Homeとページ再読み込みなしでSPA遷移してもブロックが継続する
- [x] ページ再読み込み後もReelsとExploreの非表示が再適用される
- [x] Safariを完全に閉じて開き直した後も自動実行・再適用される
- [x] スクロール、モーダル開閉、画面切り替えなどでInstagramがDOMを更新してもReelsが復活しない
- [x] InstagramがDOMを更新してもExploreが復活しない

## 言語

- [x] 日本語Instagram UIでReelsとExploreが消え、その他の主要機能が正常に動く
- [x] 英語Instagram UIでReelsとExploreが消え、その他の主要機能が正常に動く

## 安定性・安全性

- [x] 5分以上通常操作しても異常なCPU負荷、端末の急な発熱、スクロールの引っかかり、連続ループがない
- [x] 意図しない連続再読み込みやHomeへの連続リダイレクトがない
- [x] Reels/Explore以外のナビゲーション項目が誤って消えない
- [x] TimeDuperをUserscriptsで無効にすると通常のInstagram表示へ戻る
- [x] SafariのWebインスペクタを使える場合、TimeDuper由来の未処理エラーが連続発生していない
- [x] SafariのWebインスペクタを使える場合、TimeDuperが外部通信を追加していない

## Phase 0基準版 結果メモ

- 実施日: 2026-08-31
- 実施者: ユーザー（iPhone実機）
- 判定: **PASS**
- 再現手順: 本チェックリストの全Phase 0項目を実施
- 画面・URL: iPhone Safari上の `https://www.instagram.com/*`
- 備考: 全項目の成功報告を受け、`timeduper.user.js` バージョン `0.1.0` をPhase 0基準版として確定

## Phase 0.1 Hardening 回帰テスト

以下は `timeduper.user.js` バージョン `0.1.1` をiPhone実機へ入れた後に実施します。上記のPhase 0全項目も改めて確認してください。

- [x] 既存のPhase 0テスト項目をすべて再実行し、全項目がPASSする
- [x] DM内の検索UIが消えず、正常に操作できる
- [x] Profile、Followers、Following等の検索UIが誤って消えない
- [x] 長時間スクロール後もReelsとExploreのブロックが継続する
- [x] 主要navが再生成された後もReelsとExploreのブロックが復旧する
- [x] 同じUserscriptを意図的に二重初期化しようとしてもObserver、イベント、タイマーが増殖しない
- [x] Safariをバックグラウンドへ移し、復帰した後も正常に動作する
- [x] バックグラウンド中にURLポーリングが継続しない
- [x] 長時間利用後も異常なCPU負荷、発熱、バッテリー消費、連続ループがない

## Phase 0.1 Hardening 結果メモ

- 実施日: 2026-09-01
- 実施者: ユーザー（iPhone実機）
- 判定: **PASS**
- iPhone・iOS: ユーザー実機環境（詳細は実施者管理）
- Safari・Userscripts: ユーザー実機環境（詳細は実施者管理）
- 再現手順: 既存のPhase 0全項目とPhase 0.1 Hardening回帰項目を実施
- 画面・URL: iPhone Safari上の `https://www.instagram.com/*`
- 備考: 全回帰項目の成功報告を受け、`timeduper.user.js` バージョン `0.1.1` をPhase 0.1基準版として確定

## Phase 1 Settings 実機テスト

以下は `timeduper.user.js` バージョン `0.2.0` をiPhone実機へ入れた後に実施します。Phase 0 / Phase 0.1の既存項目も削除せず、ブロックONの状態で再実行してください。

### 初期値・設定UI

- [x] 設定保存がない初回起動で `Block Reels` がONになる
- [x] 設定保存がない初回起動で `Block Explore` がONになる
- [x] Instagramを開くと `TD` 設定ボタンが表示される
- [x] `TD` を押すと、タイトルが `TimeDuper` の設定パネルを開ける
- [x] パネルに `Block Reels` と `Block Explore` の2スイッチだけがある
- [x] `Close` を押すと設定パネルを閉じられる
- [x] 外付けキーボード等を利用できる場合、Tab、Space、Enter、Escapeで最低限操作できる
- [x] `TD` ボタンとパネルがInstagramの重要ボタンを覆わず、画面回転後も操作できる

### Block Reels

- [x] `Block Reels` をOFFにすると、TimeDuperが隠していたReels UIが再読み込みなしで復活する
- [x] `Block Reels` がOFFのとき、既存の `/reel/` URLを開ける
- [x] `Block Reels` がOFFのとき、`https://www.instagram.com/reels/` を開ける
- [x] `Block Reels` をONへ戻すと、Reels UI非表示が再読み込みなしで復帰する
- [x] `Block Reels` をONへ戻した時点で `/reel/` または `/reels/` にいる場合、Homeへ戻る

### Block Explore

- [x] `Block Explore` をOFFにすると、TimeDuperが隠していたExplore入口が再読み込みなしで復活する
- [x] `Block Explore` がOFFのとき、Instagram本来のExplore/Search関連機能を利用できる
- [x] `Block Explore` をONへ戻すと、Explore入口の非表示が再読み込みなしで復帰する
- [x] `Block Explore` の設定にかかわらず、`/explore/` の直接URLはPhase 1仕様どおり強制ブロックされない

### 永続保存・SPA

- [x] 設定を変更してページを再読み込みしても、2つの設定が保持される
- [x] 設定を変更してSafariを完全終了し、再起動しても設定が保持される
- [x] 設定を変更してiPhoneを再起動しても設定が保持される
- [x] Home → DM → Profile → HomeとSPA遷移しても設定とブロック状態が保持される
- [x] ブロックON/OFFを別々に保存しても、各設定が独立して保持される
- [x] 保存読み込みに失敗する状況を再現できる場合、両ブロックONの安全な初期値になる

### Phase 0.1安全策の回帰

- [x] DM内の検索UIが消えず、正常に操作できる
- [x] Followers検索が消えず、正常に操作できる
- [x] Following検索が消えず、正常に操作できる
- [x] Storiesが正常に表示・操作できる
- [x] Profileが正常に表示・操作できる
- [x] 通常投稿が正常に表示・操作できる
- [x] 長時間スクロール後も、ONにしたReels / Exploreブロックが継続する
- [x] 主要navが再生成された後も、ONにしたReels / Exploreブロックが復旧する
- [x] Safariをバックグラウンドへ移して復帰後も、UI、設定、ブロックが正常に動く

### 重複・保存データ・負荷

- [x] SPA遷移やDOM再生成後もTimeDuper UIが1個だけで、重複生成されない
- [x] 同じUserscriptを意図的に二重初期化しても、Observer、タイマー、イベント、UIが増殖しない
- [x] 長時間利用後も異常なCPU負荷、発熱、バッテリー消費、連続ループがない
- [x] Userscriptsの保存内容を確認できる場合、キーは `timeduper.settings.v1` だけである
- [x] 保存値は `schemaVersion`、booleanの `blockReels`、booleanの `blockExplore` だけである
- [x] ユーザー名、アカウントID、URL履歴、DM、投稿、Cookie、認証情報が保存されていない
- [x] SafariのWebインスペクタを使える場合、TimeDuper由来の外部通信が追加されていない

## Phase 1 Settings 結果メモ

- 実施日: 2026-09-01
- 実施者: ユーザー（iPhone実機）
- 判定: **PASS**
- iPhone・iOS: ユーザー実機環境（詳細は実施者管理）
- Safari・Userscripts: ユーザー実機環境（詳細は実施者管理）
- 備考: Phase 1 Settingsの全項目がPASSしたとの実機検証報告を受け、`timeduper.user.js` バージョン `0.2.0` をPhase 1 Settings正常動作版として確定
