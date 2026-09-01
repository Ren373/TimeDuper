# Changelog

TimeDuperの主な変更をこのファイルに記録します。

## 0.2.5 - 2026-09-02

### Phase 1.5 Brand UI

- 46×46pxのFloating TD入口を、文字表示から正式TDロゴへ変更
- near-black、白、ネオングリーンを使った独立設定パネルへ変更
- `QUICK SETTINGS` と既存の `Block Reels` / `Block Explore` スイッチをブランド化
- パネル内サブビューとして `About TimeDuper`、`How it works`、`Privacy` を追加
- 背景タップ、`Close`、Escapeによるパネル終了に対応
- 小画面ではパネル内部だけを縦スクロールする構成へ変更
- Instagram navから独立したFloating TD構成を維持

### Brand assets

- 原本PNG 2枚は変更せず `assets/` に保持
- TDロゴを128×102のindexed PNGへ軽量化し、Floatingボタンとヘッダーに使用
- フルロゴを280×241のindexed PNGへ軽量化し、Aboutビューに使用
- 派生画像を `assets/generated/` に分離し、同じ画像をPNG data URIとしてUserscriptへ埋め込み
- 相対画像パス、外部画像URL、CDN、`@resource`、外部通信へ依存しない

### Compatibility and security

- Reels / Explore判定、URLブロック、StorageAdapter、設定schemaを変更しない
- MutationObserver、SPA監視、URL監視、初期化ガードを変更しない
- 外部通信、Analytics、Tracking、広告、Instagram内部APIを追加しない
- Phase 1.5向けiPhone実機テスト項目を追加

### Validated

- iPhone Safari + UserscriptsによるPhase 0 / Phase 0.1 / Phase 1回帰およびPhase 1.5 Brand UI実機テストの全項目がPASS
- `timeduper.user.js` バージョン `0.2.5` をPhase 1.5 Brand UI正常動作版として確定
- Gitタグ `phase1.5-brand-ui-passed` で実機検証済み状態を識別

## 0.2.0 - 2026-09-01

### Phase 1 Settings

- Phase 0.1のReels / Exploreブロックを個別にON/OFFできる設定を追加
- 初回値を `Block Reels = ON`、`Block Explore = ON` とし、Phase 0.1と同じ動作を維持
- InstagramのReactツリーや主要navを改造しない、TimeDuper独立の設定DOMを追加
- safe-areaを考慮した `TD` ボタン、2スイッチ、`Close` ボタンを追加
- スイッチ変更を再読み込みなしで反映し、OFF時はTimeDuperの非表示マーカーを解除
- `StorageAdapter` を追加し、Userscriptsの `GM.getValue` / `GM.setValue` へ保存処理を限定
- Phase 1向けiPhone実機テスト項目を追加

### Storage and privacy

- 保存キーを `timeduper.settings.v1` の1つに限定
- 保存値をschema version、`blockReels` boolean、`blockExplore` booleanだけに限定
- InstagramのlocalStorage、Cookie、IndexedDB、ユーザー名、アカウントID、URL履歴、DM、投稿を保存しない
- 読み込み失敗または不正形式では、両ブロックONのデフォルトへ戻す

### Security and stability

- 設定保存に必要な `@grant GM.getValue` と `@grant GM.setValue` だけを追加
- Userscripts公式APIの要件に合わせて `@inject-into content` を明示
- 外部通信、外部依存、Analytics、Tracking、広告を追加しない
- Instagram内部API、React内部状態、History API hookを引き続き使用しない
- Phase 0.1の主要nav限定Observer、低頻度URLフォールバック、二重初期化ガードを維持

### Validated

- iPhone Safari + UserscriptsによるPhase 0 / Phase 0.1回帰およびPhase 1 Settings実機テストの全項目がPASS
- `timeduper.user.js` バージョン `0.2.0` をPhase 1 Settings正常動作版として確定
- Gitタグ `phase1-settings-passed` で実機検証済み状態を識別

## 0.1.1 - 2026-09-01

### Phase 0.1 Hardening

- Userscript識別用の `@name` はPhase 0から維持し、`@version` を `0.1.1` へ更新
- Explore判定をhref優先にし、`Search`・`検索`ラベルだけによる非表示を廃止
- ラベルフォールバックを構造的に確認した主要ナビゲーション内へ限定
- hrefベースの非表示をCSSへ委ね、DOM再生成時もObserverに依存せず再適用
- ページ全体のMutationObserverを主要nav探索中の最長10秒だけに限定
- nav発見後の監視対象をnav本体と直近親要素へ縮小
- addedNodesの差分処理をrequestAnimationFrame単位で重複排除
- navから切り離されたDOMの非表示マーカーを解除し、別UIへの再利用時はfail-open
- URLポーリングを500msから1.5秒へ緩和し、documentがhiddenの間は停止
- 同一ページへの二重注入を防ぐ初期化ガードと内部cleanupを追加
- Phase 0.1向け回帰テスト項目を追加

### Security

- 外部通信、外部依存、追加権限、永続ストレージを引き続き使用しない
- Instagram内部API、React内部状態、History API hookを引き続き使用しない

### Validated

- iPhone Safari + UserscriptsによるPhase 0およびPhase 0.1実機回帰テストの全項目がPASS
- `timeduper.user.js` バージョン `0.1.1` をPhase 0.1基準版として確定
- Gitタグ `phase0.1-passed` で実機回帰検証済み状態を識別

## 0.1.0 - 2026-08-31

### Added

- iPhone Safari + Userscripts向けのPhase 0 Userscriptを追加
- Reelsリンク・ナビゲーション項目の非表示を追加
- `/reel/` と `/reels/` のURLブロックを追加
- Exploreリンク・ナビゲーション項目の非表示を追加
- SPAのURL変更監視とDOM差分への再適用を追加
- 外部依存・通信・特権権限なしのfail-open初期実装を追加
- READMEとiPhone実機テストチェックリストを追加

### Validated

- iPhone Safari + UserscriptsによるPhase 0実機テストの全項目がPASS
- `timeduper.user.js` バージョン `0.1.0` をPhase 0基準版として確定
- Gitタグ `phase0-passed` で実機検証済み状態を識別
