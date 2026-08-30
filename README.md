# TimeDuper Phase 0

TimeDuper Phase 0は、iPhoneのSafariとUserscriptsで技術的な成立性を確認するための最小プロトタイプです。対象は `https://www.instagram.com/*` だけです。完成版ではありません。

## すること

- Instagram Webを開いたときに自動実行します。
- Reels（`/reel/`、`/reels/`）へのリンクや、英語・日本語のナビゲーション項目を可能な範囲で非表示にします。
- Explore（`/explore/`）へのリンクやナビゲーション項目を可能な範囲で非表示にします。
- Reels URLを直接開いた場合、InstagramのHome (`/`) に置き換えてブロックします。
- Reelsリンクのクリックを、画面遷移前に止めます。
- InstagramのSPA遷移をURLイベントと軽量な500ms間隔のURL比較で監視します。
- DOMの初回走査は1回だけ行い、その後は `MutationObserver` で追加・属性変更された部分だけを再確認します。
- Instagramが挿入した対象リンクにはCSSも直接適用するため、DOM再生成後にも非表示を再適用します。

Exploreは入口を非表示にしますが、Phase 0では `/explore/` への直接アクセス自体はブロックしません。ReelsのURLだけが強制ブロック対象です。

## インストール

1. iPhoneにUserscriptsを用意し、Safari拡張を有効にします。
2. Userscriptsからアクセスできる保存先へ `timeduper.user.js` を保存します。
3. Userscripts側でスクリプトを有効にします。
4. iPhoneの設定で、Userscripts拡張のWebサイトアクセスを `www.instagram.com` に許可します。
5. Safariで `https://www.instagram.com/` を開き、必要なら一度再読み込みします。

Userscriptsのバージョンによってファイルの追加方法や設定画面の表記が異なる場合があります。テスト時は [TEST_CHECKLIST.md](./TEST_CHECKLIST.md) を使用してください。

## 安全性とプライバシー

このスクリプトはURLと表示中DOMのリンク先・ナビゲーション用ラベルだけを利用します。

- 外部サーバーへの通信を追加しません。
- 外部JavaScriptを読み込みません（`@require` なし）。
- Userscriptの特権APIを使いません（`@grant none`）。
- Cookie、パスワード、DM本文、投稿内容を読み取り・収集・保存しません。
- Analytics、Tracking、広告、永続ストレージはありません。
- Like、Follow、DMその他のInstagram操作を自動実行しません。
- Instagram内部API、非公開API、React内部状態、`fetch`/XHRの横取りを使いません。

Instagramと通常どおり通信するのはInstagram Web自身です。TimeDuperが新しい通信先や通信処理を追加することはありません。

処理は例外を捕捉し、失敗時にInstagram側のイベントや描画を止め続けないfail-open設計です。ただし、対象リンクのクリックを正常に検出した場合は、そのクリックだけを意図的にキャンセルします。

## 既知の制限

- InstagramのDOM、URL、ラベルは予告なく変更されるため、ボタンが残る可能性があります。
- 日本語と英語の代表的なラベルだけに対応しています。他言語や新しい表記はリンク先URLで判定できる場合に限り非表示になります。
- CSSは対象リンクそのものを隠します。Instagramのレイアウトによっては空白が残ることがあります。
- Reelsが通常投稿と同じURLや別の新URLで表示された場合はブロックできません。
- URLの直接入力やInstagram側のプログラム遷移では、Homeへ戻るまで最大約500ms表示される場合があります。
- Exploreは非表示だけで、URL直接入力によるアクセスはPhase 0の対象外です。
- Instagram Webの仕様変更やUserscripts/Safariの制限により動作しなくなる可能性があります。
- Phase 0では設定画面、解除UI、ログ保存、テレメトリー、ビルド処理はありません。

## アンインストール・一時停止

Userscriptsで `TimeDuper Phase 0` を無効化するか、`timeduper.user.js` を削除してください。Instagramアカウント側へ設定やデータを保存しないため、追加の復旧作業は不要です。
