# TimeDuper Phase 0 実機テストチェックリスト

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
