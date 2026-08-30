# Changelog

TimeDuperの主な変更をこのファイルに記録します。

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
