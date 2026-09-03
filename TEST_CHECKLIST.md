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

## Phase 1.5 Brand UI 実機テスト

以下は `timeduper.user.js` バージョン `0.2.5` をiPhone実機へ入れた後に実施します。Phase 0 / Phase 0.1 / Phase 1の既存テストは削除せず、あわせて回帰確認してください。

### Floating TD・パネル

- [x] Floating TDロゴボタンが正常に表示される
- [x] 小さい表示でもTDロゴを認識でき、ぼやけすぎていない
- [x] TDロゴの外側を含む約46×46pxのタップ領域を正常に押せる
- [x] TDロゴボタンがInstagram本来の重要UIを覆わない
- [x] TDロゴボタンから設定パネルを開ける
- [x] 背景タップで設定パネルを閉じられる
- [x] `Close` で設定パネルを閉じられる
- [x] Escapeキーを利用できる環境では設定パネルを閉じられる

### Settings・説明ビュー

- [x] `Block Reels` スイッチが正常に動作する
- [x] `Block Explore` スイッチが正常に動作する
- [x] 両スイッチともOFF → ONが再読み込みなしで即時反映される
- [x] 変更した設定が正常に保存される
- [x] `About TimeDuper` を開け、フルロゴと説明が正常に表示される
- [x] AboutからQuick Settingsへ戻れる
- [x] `How it works` を開け、説明が正常に表示される
- [x] How it worksからQuick Settingsへ戻れる
- [x] `Privacy` を開け、実装事実だけが表示される
- [x] PrivacyからQuick Settingsへ戻れる

### 小画面・再適用・回帰

- [x] 小画面・縦向き・横向きでレイアウトが画面外へはみ出さない
- [x] 長い表示ではInstagramページでなく設定パネル内部だけがスクロールする
- [x] Home、DM、Stories、Profile、通常投稿が正常に表示・操作できる
- [x] DM、Followers、Following検索が正常に表示・操作できる
- [x] SPA遷移後もTD UIが1個だけで重複しない
- [x] Safari再読み込み後もブランドUIが正常に表示される
- [x] Safariを終了して再起動した後もブランドUIが正常に表示される
- [x] 再読み込み・Safari再起動後も保存設定が維持される
- [x] 同じUserscriptを意図的に二重初期化してもUIが重複しない
- [x] SafariのWebインスペクタでTimeDuper由来の外部通信が0件である

## Phase 1.5 Brand UI 結果メモ

- 実施日: 2026-09-02
- 実施者: ユーザー（iPhone実機）
- 判定: **PASS**
- iPhone・iOS: ユーザー実機環境（詳細は実施者管理）
- Safari・Userscripts: ユーザー実機環境（詳細は実施者管理）
- 備考: Phase 1.5 Brand UIの全項目がPASSしたとの実機検証報告を受け、`timeduper.user.js` バージョン `0.2.5` をPhase 1.5 Brand UI正常動作版として確定

## Phase 2 Language Support 実機テスト

以下は `timeduper.user.js` バージョン `0.3.0` をiPhone実機へ入れた後に実施します。Phase 0 / Phase 0.1 / Phase 1 / Phase 1.5の既存テストも削除せず、回帰確認してください。

### 言語選択・即時反映

- [x] 初回起動時のLanguageが `Automatic` である
- [x] 日本語を優先言語にしたSafariで、`Automatic` のTimeDuper UIが日本語になる
- [x] 英語または日本語以外を優先言語にした環境で、`Automatic` のTimeDuper UIが英語になる
- [x] `English` を手動選択するとTimeDuper UI全体が英語になる
- [x] `日本語` を手動選択するとTimeDuper UI全体が日本語になる
- [x] 言語変更がページ再読み込みなしで即時反映される
- [x] Instagram本体の表示言語は変更されない
- [x] 言語変更後もTDロゴとPhase 1.5の基本デザインが維持される

### 翻訳範囲

- [x] 設定画面、Quick Settings、Reels / Explore、Language、Closeが選択言語で表示される
- [x] `About TimeDuper` のタイトル、説明、Backが選択言語で表示される
- [x] `How it works` のタイトル、説明、Backが選択言語で表示される
- [x] `Privacy` のタイトル、説明、Backが選択言語で表示される
- [x] ボタン、スイッチ、言語選択のaria-labelが選択言語へ更新される

### 保存・migration

- [x] 手動言語設定がSafari再読み込み後も保持される
- [x] 手動言語設定がSafari終了・再起動後も保持される
- [x] schema version 1の保存データから更新しても、既存のBlock Reels値が保持される
- [x] schema version 1の保存データから更新しても、既存のBlock Explore値が保持される
- [x] schema version 1からの移行後、Languageが `Automatic` になる
- [x] 保存キーは `timeduper.settings.v1` の1つだけである
- [x] 保存値は `schemaVersion: 2`、boolean 2個、`auto | en | ja`の言語値だけである

### 機能・安定性・セキュリティ回帰

- [x] 各言語設定でBlock ReelsのON/OFFとURLブロックが正常に動作する
- [x] 各言語設定でBlock ExploreのON/OFFが正常に動作する
- [x] Home、DM、Stories、Profile、通常投稿が正常に表示・操作できる
- [x] DM、Followers、Following検索が正常に表示・操作できる
- [x] SPA遷移後も選択言語が維持され、TimeDuper UIは1個だけである
- [x] Userscript二重初期化でもUI、Observer、タイマー、イベントが増殖しない
- [x] TimeDuper由来の外部通信が0件である

## Phase 2 Language Support 結果メモ

- 実施日: 2026-09-02
- 実施者: ユーザー（iPhone実機）
- 判定: **PASS**
- iPhone・iOS: ユーザー実機環境（詳細は実施者管理）
- Safari・Userscripts: ユーザー実機環境（詳細は実施者管理）
- 備考: Phase 2 Language Supportの全項目がPASSしたとの実機検証報告を受け、`timeduper.user.js` バージョン `0.3.0` をPhase 2 Language Support正常動作版として確定

## Phase 2.5 Fullscreen UI & Stable Floating TD 実機テスト

以下は `timeduper.user.js` バージョン `0.3.5` をiPhone実機へ入れた後に実施します。Phase 0〜2の既存テストも削除せず、回帰確認してください。

### Stable Floating TD

- [x] Floating TDロゴ入口が1個だけ表示される
- [x] Floating TDはInstagram本来のnav項目を変更しない
- [x] Floating TDのタップ領域・aria-labelが正常である
- [x] Floating TDをタップすると全画面TimeDuper設定が開く
- [x] スクロール後もFloating TDが同じ画面位置に表示される
- [x] SPA移動後もFloating TDは1個だけである
- [x] safe-area環境でFloating TDが重要UIを覆わない

### 全画面UI

- [x] TD入口から全画面設定を開ける
- [x] 全画面設定がblack / white / neon greenのブランドデザインを維持する
- [x] `TD logo + TimeDuper`、`QUICK SETTINGS`、`LANGUAGE`、`ABOUT`、`Close`が表示される
- [x] 全画面表示中にInstagram背面を誤タップ・スクロールしない
- [x] `Close`で閉じてInstagramへ正常に戻れる
- [x] Escapeキーを利用できる環境では閉じられる
- [x] 画面端の背景部分をタップして閉じられる
- [x] 内容が長い場合は全画面UI内部だけがスクロールする
- [x] 320×568の画面で横方向にはみ出さず、操作項目へ到達できる
- [x] 縦向き・横向き・safe-area環境で重要UIが欠けない

### 設定・説明・回帰

- [x] Block ReelsのON/OFFと `/reel/` / `/reels/` ブロックが正常に動作する
- [x] Block ExploreのON/OFFが正常に動作する
- [x] Languageの `Automatic` / `English` / `日本語` が正常に動作する
- [x] About TimeDuperを開き、戻れる
- [x] How it worksを開き、戻れる
- [x] Privacyを開き、戻れる
- [x] reload後もTD入口・全画面UIが正常で設定が保持される
- [x] Safari終了・再起動後もTD入口・全画面UIが正常で設定が保持される
- [x] Home、Stories、DM、Profile、通常投稿が正常に表示・操作できる
- [x] DM、Followers、Following検索が正常に表示・操作できる
- [x] Userscript二重初期化でもFloating TD、全画面UI、Observer、タイマー、イベントが増殖しない
- [x] TimeDuper由来の外部通信が0件である

## Phase 2.5 Fullscreen UI & Stable Floating TD 結果メモ

- 実施日: 2026-09-02
- 実施者: ユーザー実機検証
- 判定: **PASS**
- iPhone・iOS: ユーザー実機環境（詳細は実施者管理）
- Safari・Userscripts: ユーザー実機環境（詳細は実施者管理）
- 備考: Phase 2.5 Fullscreen UI + Stable Floating TDの全項目がPASSしたとの実機検証報告を受け、`timeduper.user.js` バージョン `0.3.5` を正常動作版として確定

## Phase 3 Time Control 実機テスト

以下は `timeduper.user.js` バージョン `0.4.0` をiPhone実機へ入れて実施します。既存テストも削除せず回帰確認してください。

### 設定・保存・migration

- [x] 初回のDaily LimitがOFFである
- [x] Daily Limit minutesの初期値が60分である
- [x] Temporary Unlock durationの初期値が5分である
- [x] Daily LimitのON/OFFがreload後も保持される
- [x] Daily Limit minutesの変更がreload・Safari再起動後も保持される
- [x] Temporary Unlock durationの変更がreload・Safari再起動後も保持される
- [x] schema version 1から移行してReels / Explore値が保持される
- [x] schema version 2から移行してReels / Explore / Language値が保持される
- [x] 保存データがschema v3で許可された設定、日別使用秒数、最小限のロック状態だけである

### 時間計測・日付

- [x] Instagram Webがforegroundかつvisibleの間だけ使用時間が増える
- [x] Safariをbackgroundへ移すと使用時間が増えない
- [x] reload後も当日の使用時間が保持される
- [x] Safari終了・再起動後も当日の使用時間が保持される
- [x] 長い停止や処理遅延で異常に大きな時間を一括加算しない
- [x] 端末のlocal dateが変わると新しい日の集計へ切り替わる
- [x] 日付変更後に警告・ロック・Temporary Unlock状態がリセットされる

### 警告・カウントダウン・ロック

- [x] 残り15分を初めて下回ったとき警告が1回だけ表示される
- [x] 残り10分を初めて下回ったとき警告が1回だけ表示される
- [x] 残り5分を初めて下回ったとき警告が1回だけ表示される
- [x] 同じ閾値の警告がreloadやSPA遷移後に繰り返されない
- [x] 残り5分以下で上部カウントダウンが表示される
- [x] 上限到達時に全画面ロックoverlayが表示される
- [x] ロック中にInstagramをタップ・スクロール・操作できない
- [x] ロック開始から5分未満はTemporary Unlockボタンが無効で残り時間を表示する
- [x] ロック開始5分後にTemporary Unlockが利用可能になる
- [x] Temporary Unlock中だけInstagramを利用でき、その時間も使用時間へ加算される
- [x] Temporary Unlock終了後、上限超過中なら再ロックされる
- [x] Temporary Unlockは当日のロックにつき1回だけ利用できる
- [x] 翌日のlocal dateでTemporary Unlock使用済み状態がリセットされる

### Phase 2.5回帰・安全性

- [x] Reels / Explore / Languageが正常に動作する
- [x] Floating TDと全画面設定UIが正常に動作する
- [x] About / How it works / Privacyが正常に動作する
- [x] Home / Stories / DM / Profile / 通常投稿が正常に動作する
- [x] DM / Followers / Following検索が正常に動作する
- [x] SPA遷移後もTimeDuper UI、Observer、timer、listenerが重複しない
- [x] Userscript二重初期化でもTimeDuper UI、Observer、timer、listenerが重複しない
- [x] TimeDuper由来の外部通信が0件である

## Phase 3 Time Control 結果メモ

- 実施日: 2026-09-03
- 実施者: ユーザー（iPhone実機）
- 判定: **PASS**
- iPhone・iOS: ユーザー実機環境（詳細は実施者管理）
- Safari・Userscripts: ユーザー実機環境（詳細は実施者管理）
- 備考: Phase 3 Time Controlの全項目がPASSしたとの実機検証報告を受け、`timeduper.user.js` バージョン `0.4.0` を正常動作版として確定
