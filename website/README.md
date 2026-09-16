# TimeDuper Website MVP

Astroで生成する静的サイトです。実行時の外部JavaScript、Analytics、Tracking、広告、ログイン、Cookie、バックエンドは使用しません。

## Local preview

```powershell
npm install
npm run dev
```

表示先: `http://localhost:4321/TimeDuper/en/` または `http://localhost:4321/TimeDuper/ja/`

## Build and validate

```powershell
npm run build
npm run validate
```

静的出力は `dist/` に生成されます。公開先が `https://timeduper.github.io/TimeDuper/` と異なる場合は、公開前に `astro.config.mjs` の `site` と `base` を変更してください。

`public/downloads/timeduper.user.js` はPhase 4安定版のコピーです。リポジトリ直下の原本とSHA-256が一致することを検証スクリプトで確認します。
