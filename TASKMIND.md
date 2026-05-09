# TaskMind 開発ルール

## Discord連携ルール

### 発言方針
- **最終回答まで検証依頼発言を行わない**
- **Discord発言はできるだけ1回にまとめる**
- 実装完了後にまとめて報告し、イツキ様にテストを依頼する

### Eyeとの連携
- Eyeへの検証依頼は、実装・修正が完了してから行う
- 中間報告をDiscordに投稿しない（開発中の検証は内部で行う）
- Eyeの検証結果は確認後、必要に応じて修正を行い、まとめて報告する

## Issue Resolution Log

### Issue: 詳細メニューの位置ずれ（親ノード・子ノード両方）

**原因:**
canvas要素に `transform: translate(...) scale(...)` が適用されているため、子孫の `position:fixed` はcanvasの座標系に対して固定されてしまい、ビューポート座標系での位置指定がずれる。

**解決策:**
1. メニュー（indicator-group）をクリック時に `document.body` に移動（append）
2. `position: fixed` でビューポート座標系に配置
3. `z-index: 10000` で最前面表示
4. 折りたたむ際は元のcontainerに戻す

**実装コード:**
```javascript
if (node.indicatorsExpanded) {
    document.body.appendChild(group);
    group.style.position = 'fixed';
    group.style.left = e.clientX + 'px';
    group.style.top = (e.clientY + 20) + 'px';
    group.style.zIndex = '10000';
} else {
    container.appendChild(group);
    group.style.position = '';
    group.style.left = '';
    group.style.top = '';
    group.style.zIndex = '';
}
```

### Issue: メニューが二重に発生し残留する

**解決策:**
1. `currentOpenGroup` で開いているメニューを追跡
2. 他のノードの ☰ をクリックする際、既に開いているメニューを自動で閉じる
3. documentのclickイベントで、メニュー以外をクリックした場合に現在開いているメニューを閉じる

**実装コード:**
```javascript
// Track currently open indicator group
let currentOpenGroup = null;

// Close menu when clicking elsewhere
document.addEventListener('click', (e) => {
    if (currentOpenGroup && !e.target.closest('.node-indicators')) {
        const otherContainer = currentOpenGroup.closest('.node-indicators');
        if (otherContainer) {
            otherContainer.classList.remove('expanded');
            const otherNodeId = otherContainer.closest('[data-node-id]')?.dataset.nodeId;
            const otherNode = allNodes.find(n => n.id === otherNodeId);
            if (otherNode) otherNode.indicatorsExpanded = false;
            otherContainer.appendChild(currentOpenGroup);
        }
        currentOpenGroup.style.position = '';
        currentOpenGroup.style.left = '';
        currentOpenGroup.style.top = '';
        currentOpenGroup.style.zIndex = '';
        currentOpenGroup = null;
    }
});
```

### Issue: 他の要素クリック時に詳細メニューを閉じる

**解決策:**
上記の `document.addEventListener('click', ...)` で、メニュー以外の要素をクリックした際に自動で閉じる処理を実装。

## 技術メモ

### CSS Transformとposition:fixedの関係
- 祖先に `transform` がある場合、`position:fixed` はその祖先の座標系に対して固定される
- canvasのpan/scaleがある場合、ビューポート座標とローカル座標系が一致しない
- 解決策：メニューをcanvasの外（body直下）に出し、`position:fixed` でビューポート座標系に配置
