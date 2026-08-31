# Changelog

TimeDuperの主な変更をこのファイルに記録します。

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
