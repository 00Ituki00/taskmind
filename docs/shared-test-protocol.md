# TaskMind 共有テスト手順（ユーザー⇔AI 情報共有）

目的：ユーザーとエージェントが同じ TaskMind ファイルを見て、操作を共有できる状態にするための手順。

## 1. 準備（ローカルサーバー起動）

### ローカルサーバー（推奨）
1. `F:\MyProjects\taskmind` フォルダで `start-taskmind.bat` をダブルクリック（または `start-taskmind.ps1`）
2. `http://localhost:8080/` が自動で開く
3. サーバー停止は `Ctrl+C`

### ページ側の確認
- ローカルサーバー経由で `http://localhost:8080/` を開く
- ファイルを開く（📂 読込）→ `2026-11-07_shared-test.json` を読み込む
- 同じタブ続けて操作できれば成功

## 2. 画面の見取り（AI 側）

1. **Gateway ブラウザ** で同じ URL（`http://localhost:8080/`）を開く
2. キャンバス状態（ノード・色・接続・グループ）が DOM に反映されていることを確認
3. ノード一覧は `document.body.innerText` or `localStorage.getItem('taskmind_autosave')` から読み取り可能

## 3. 保存・共有運用

### ローカル（自動保存）
- ページリロード時に localStorage 自動復元（`taskmind_autosave`）
- ページ側を編集した後は `buildSavePayload()` で JSON 形式で保存
- AI 側保存は `index.html` の `saveToFile()` / `driveSave()` を使う

### Google Drive
- 💾 保存 → メニューで保存先選択
- 未認証なら GIS 同意フローへ誘導（pendingSave が callback 側で処理）
- 認証済みなら即座に保存可能
- 読込は ☁️ メニューで Picker で選択

## 4. エージェント向け運用ルール

- **共有正本は 1 ファイル**（ローカル / Drive いずれか）
- ファイル名は `YYYY-MM-DD_<topic>.json` 推奨
- データ構造は `buildSavePayload()` に統一（`version`, `nodes`, `connections`, `groups`, `nextId`）
- 読込は `applyLoadedData()`（`buildSavePayload()` / `driveLoad()` / `loadFromFile()` / `loadAutosave()` 共通）
- グループは折りたたみ可能なセクションとして使う
- ノード追加時の `parentId` / `children` の整合性を壊さない
- `details`（`why` / `what` / `who` / `where` / `link`）に意味情報を残す
- 色分けは `docs/shared-usage.md` の推奨案内を参照
