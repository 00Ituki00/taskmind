# TaskMind Timeline Layout 追加プラン（改訂版）

## 1. 概要

現在の「フリーレイアウト」（ノードのx,y座標を記録・保持）に加え、「タイムラインレイアウト」を追加する。レイアウトは切り替え可能とし、フリーレイアウトの位置情報はタイムラインレイアウト切替時も保持される。

**イツキ様提案の設計:**
- **横方向（X軸）:** 時間進行（左から右へ）
- **縦方向（Y軸）:** 周期別グループ（毎日/毎週/毎月/毎年/随時・未設定）
- **親子関係:** 子ノードは親ノード内部にネストして多層表示

---

## 2. 利用可能な日時データ

| フィールド | データ型 | 用途 |
|-----------|---------|------|
| `node.createdAt` | ISO string | ノード作成日時 |
| `node.completedAt` | ISO string or null | 完了日時 |
| `node.details.when.repeatType` | string | 周期種別（'none','daily','weekly','monthly-day','monthly-week','yearly-date','yearly-week'）|
| `node.details.when.nextDate` | ISO string or null | 次回予定日時（繰り返しタスク） |
| `node.details.when.baseDateTime` | ISO string or null | 基準日時 |
| `node.details.when.deadlineDate` | ISO string or null | 期限日時（絶対指定時） |
| `node.details.when.lastCompleted` | ISO string or null | 最終完了日時 |

**タイムライン配置の優先順位:**
1. `deadlineDate`（期限日）があれば最優先
2. `nextDate`（次回予定日）
3. `baseDateTime`（基準日時）
4. `createdAt`（作成日）※フォールバック

---

## 3. レイアウト設計（イツキ様提案）

### 全体構造
```
┌─────────────────────────────────────────────────────────────────┐
│ タイムライン [週間▼] [◀] [▶] [📅切替]                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  毎日   │ [朝ジョギング] [ストレッチ] [日報作成]               │
│         │   ├─子: ウォームアップ                               │
│         │   └─子: クールダウン                                 │
│         │                                                      │
│  毎週   │ [週次MTG] [在庫確認]                                 │
│         │                                                      │
│  毎月   │ [月次レポート] [設備点检]                            │
│         │                                                      │
│  毎年   │ [決算対応] [健康診断]                                │
│         │                                                      │
│  随時   │ [企画書作成] [バグ修正] [問い合わせ対応]             │
│         │                                                      │
│ 未設定  │ [アイデア] [メモ]                                    │
│         │                                                      │
│                                                                 │
│  → 左から右へ時間が進む                                        │
│  → 縦は周期別の「レーン」                                      │
│  → ノード内に子ノードがネストして表示                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 周期グループ（Y軸レーン）
| レーン | repeatType | 説明 |
|--------|-----------|------|
| 毎日 | `daily` | 毎日繰り返し |
| 毎週 | `weekly` | 毎週繰り返し |
| 毎月 | `monthly-day`, `monthly-week` | 毎月繰り返し |
| 毎年 | `yearly-date`, `yearly-week` | 毎年繰り返し |
| 随時 | `none` + 期限あり | 期限が設定された随時タスク |
| 未設定 | `none` + 期限なし | 期限・周期未設定 |

**レーン内のソート:** 期限日/次回日時順（昇順）

### 時間軸（X軸）
- 左から右へ時間が進む
- 表示範囲: 開始日〜終了日（週間/月間/四半期切替）
- 1日あたりの幅: 設定可能（デフォルト120px）
- 日付ヘッダー: 上部に日付ラベルを表示

### 親子ネスト表示
```
┌─[親ノード: 朝ジョギング]─────────┐
│ 🔗 期限: 6/20                    │
│                                  │
│  ┌─[子: ウォームアップ]─┐        │
│  └─[子: クールダウン]───┘        │
│                                  │
└──────────────────────────────────┘
```
- 親ノードの内部に子ノードを縦に並べて表示
- 子ノードは親より小さいサイズで表示
- 親を折りたたむと子も非表示
- ネスト深度に応じてインデント増加

---

## 4. レイアウト切替UI

### ツールバー拡張
```
[現在] [✋][👆][📦][🔗][👁️][📊][🔄][💾][📂]
[追加]                    [📅]  ← レイアウト切替ボタン
```

- `📅` ボタンでフリー/タイムラインを切り替え
- 切替時はアニメーションで遷移

### 状態管理
```javascript
state.layoutMode = 'free' | 'timeline'
state.timeline = {
    viewStart: '2026-05-19',    // 表示開始日（ISO date）
    viewRange: 'week',           // 'week' | 'month' | 'quarter'
    dayWidth: 120,               // 1日あたりの幅（px）
    laneHeight: 200,             // レーンの基本高さ（px）
    expandedLanes: {             // レーンの展開/折りたたみ状態
        daily: true,
        weekly: true,
        monthly: true,
        yearly: true,
        asap: true,
        unset: true
    }
}
```

---

## 5. タイムライン描画アルゴリズム

### Step 1: ノード分類
```javascript
function classifyNodeForTimeline(node) {
    const when = node.details?.when;
    const repeatType = when?.repeatType || 'none';
    
    // レーン判定
    if (repeatType === 'daily') return { lane: 'daily', date: when?.nextDate };
    if (repeatType === 'weekly') return { lane: 'weekly', date: when?.nextDate };
    if (repeatType.startsWith('monthly')) return { lane: 'monthly', date: when?.nextDate };
    if (repeatType.startsWith('yearly')) return { lane: 'yearly', date: when?.nextDate };
    if (repeatType === 'none' && when?.deadlineDate) return { lane: 'asap', date: when.deadlineDate };
    return { lane: 'unset', date: null };
}
```

### Step 2: レーン構築
```javascript
function buildLanes(nodes, viewStart, viewEnd) {
    const lanes = {
        daily: [],
        weekly: [],
        monthly: [],
        yearly: [],
        asap: [],
        unset: []
    };
    
    for (const node of nodes) {
        const { lane, date } = classifyNodeForTimeline(node);
        if (node.parentId === null) {
            // 親ノードのみレーンに配置
            lanes[lane].push({
                node,
                date,
                children: nodes.filter(n => n.parentId === node.id)
            });
        }
    }
    
    // 各レーン内を日付順にソート
    for (const laneKey in lanes) {
        lanes[laneKey].sort((a, b) => {
            const da = a.date ? new Date(a.date) : new Date(0);
            const db = b.date ? new Date(b.date) : new Date(0);
            return da - db;
        });
    }
    
    return lanes;
}
```

### Step 3: X位置計算
```javascript
function getNodeXPosition(date, viewStart, dayWidth) {
    if (!date) return 0; // 未設定は左端
    const daysDiff = (new Date(date) - new Date(viewStart)) / (1000 * 60 * 60 * 24);
    return daysDiff * dayWidth;
}
```

### Step 4: レーンY位置計算
```javascript
function getLaneYPosition(laneIndex, laneHeight, expandedLanes) {
    let y = 0;
    const laneOrder = ['daily', 'weekly', 'monthly', 'yearly', 'asap', 'unset'];
    for (let i = 0; i < laneIndex; i++) {
        const key = laneOrder[i];
        if (expandedLanes[key]) y += laneHeight;
        else y += 30; // 折りたたみ時はヘッダーのみ
    }
    return y;
}
```

---

## 6. 描画詳細

### レーン描画
```
┌─ 毎日 ▼ ───────────────────────────────────────┐
│                                               │
│    5/19    5/20    5/21    5/22    5/23...   │  ← 日付ヘッダー
│      │       │       │       │       │       │
│   [T1]    [T2]              [T3]              │  ← ノード配置
│   ┌─┐     ┌─┐               ┌─┐               │
│   │朝│    │週│               │月│               │
│   │ジ│    │次│               │レ│               │
│   └─┘     └─┘               └─┘               │
│                                               │
└───────────────────────────────────────────────┘
```

### ノード要素（フリーレイアウトと共用）
- ヘッダー部分（色チップ、タイトル、リンクアイコン、インジケーター）は共通
- サイズはフリーとは異なる計算（タイムライン専用）
- 子ノードは親の内部に描画（相対座標）

### 親ノードの高さ計算
```
親ノード高さ = ヘッダー(36px) + padding(16px) + 子ノード総高さ + padding(16px)
```

---

## 7. インタラクション設計

### ナビゲーション
| 操作 | 動作 |
|------|------|
| [◀] [▶] ボタン | 週/月移動 |
| マウスホイール（横） | 時間軸スクロール |
| マウスホイール（縦） | レーン間スクロール |
| ズームスライダー | 1日あたりの幅変更（80px〜200px） |

### ノード操作
| 操作 | 動作 |
|------|------|
| ノードドラッグ（横方向） | 日付変更（deadlineDate/nextDate更新） |
| ノードドラッグ（縦方向） | レーン変更（周期種別変更） |
| 親ノードクリック | 選択 + 子ノード展開/折りたたみ |
| レーンヘッダークリック | レーン全体の展開/折りたたみ |

### 新規作成
- タイムラインモードでダブルクリック → 新規ノード作成（クリック日付を設定）
- レーンヘッダー右クリック → そのレーンの周期で新規ノード

---

## 8. 実装フェーズ

### Phase 1: 基盤構築（1〜2時間）
1. `state.layoutMode` と `state.timeline` 追加
2. ツールバーにレイアウト切替ボタン（📅）追加
3. `renderNodes()` 分岐：freeモードは現状維持
4. タイムラインレーンコンテナ（`#timeline-lanes`）追加
5. 周期判定関数 `classifyNodeForTimeline()` 実装

### Phase 2: レーン描画（2〜3時間）
1. レーン構築関数 `buildLanes()` 実装
2. レーンヘッダー描画（周期ラベル + 展開/折りたたみ）
3. 日付ヘッダー描画（X軸上部）
4. グリッド線描画（日付区切り線）

### Phase 3: ノード配置（2〜3時間）
1. X/Y位置計算関数
2. 親ノード描画（タイムライン版）
3. 子ノードネスト描画
4. ノードサイズ計算（親は子を含む高さ）
5. ノードクリック・ドラッグ対応

### Phase 4: インタラクション（2〜3時間）
1. 週/月ナビゲーション
2. ノードドラッグで日付変更
3. ノードドラッグでレーン変更（周期変更）
4. ズーム（dayWidth変更）

### Phase 5: 保存・微調整（1〜2時間）
1. JSON保存に layoutMode と timeline 設定を含める
2. フリー↔タイムライン切替時のスムーズ遷移
3. 空のレーン表示/非表示設定
4. 細かいスタイル調整

---

## 9. データ構造変更

### state 追加
```javascript
state: {
    // ...existing...
    layoutMode: 'free',  // 'free' | 'timeline'
    timeline: {
        viewStart: '2026-05-19',      // YYYY-MM-DD
        viewRange: 'week',             // 'week' | 'month' | 'quarter'
        dayWidth: 120,                 // px per day
        laneHeight: 200,               // px per lane (expanded)
        expandedLanes: {
            daily: true,
            weekly: true,
            monthly: true,
            yearly: true,
            asap: true,
            unset: true
        }
    }
}
```

### JSON保存互換性
- 旧データ読み込み時: `layoutMode`なし→`'free'`、`timeline`なし→デフォルト値
- 保存時: 新フィールドを追加

---

## 10. 既存機能への影響

| 機能 | 影響 | 対応 |
|------|------|------|
| フリーレイアウト描画 | なし | 現状維持、分岐のみ |
| ノード作成 | 小 | timeline時は現在日付・周期を設定 |
| ノード編集（統合エディタ） | なし | 共通 |
| ドラッグ＆ドロップ | 中 | timeline時は日付/レーン移動 |
| ズーム/パン | 中 | timeline時は横スクロール+ズーム |
| JSON保存/読み込み | 小 | 新フィールド追加（後方互換） |
| チュートリアル | 小 | timeline説明を追加 |
| キーボードショートカット | 小 | レイアウト切替ショートカット追加 |

---

## 11. 工数見積（目安）

| Phase | 内容 | 見積 |
|-------|------|------|
| Phase 1 | 基盤構築 | 1〜2時間 |
| Phase 2 | レーン描画 | 2〜3時間 |
| Phase 3 | ノード配置 | 2〜3時間 |
| Phase 4 | インタラクション | 2〜3時間 |
| Phase 5 | 保存・微調整 | 1〜2時間 |
| **合計** | | **8〜13時間** |

---

## 12. 決定事項（イツキ様へ確認）

| # | 項目 | 提案 |
|---|------|------|
| 1 | **デザイン方針** | 上記の水平タイムライン+周期レーン+親子ネストで確定？ |
| 2 | **初期表示範囲** | 週間表示で開始？月間？ |
| 3 | **未設定レーン** | 日付のないノードは「未設定」レーンに集約？ |
| 4 | **完了済みノード** | タイムラインに表示する？非表示？別レーン？ |
| 5 | **進め方** | Phase 1→2→3→4→5の順で、各Phase後にブラウザ確認を挟む？ |

---

*改訂日: 2026-05-19*
*対象ファイル: F:\MyProjects\taskmind\index.html*
