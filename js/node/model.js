// node/model.js - TaskMind Node モデル・基本操作

function calculateNodeWidth(title, hasLink = false) {
    const temp = document.createElement('span');
    temp.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font-weight:600;font-size:15px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;';
    temp.textContent = title;
    document.body.appendChild(temp);
    const textWidth = temp.offsetWidth;
    document.body.removeChild(temp);

    let overhead = 146;
    if (hasLink) overhead += 18;
    return Math.max(160, Math.min(400, textWidth + overhead));
}

function createNode(x, y, title = '新規ノード', type = 'memo') {
    const now = new Date().toISOString();
    const excludedColors = ['#fff176', '#dce775'];
    const available = state.colors.filter(c => !excludedColors.includes(c));
    const node = {
        id: state.nextId++,
        x: x,
        y: y,
        title: title,
        type: type,
        color: available[Math.floor(Math.random() * available.length)],
        completed: false,
        completedAt: null,
        createdAt: now,
        expanded: false,
        width: calculateNodeWidth(title, false),
        height: null,
        parentId: null,
        children: [],
        priority: 0,
        details: {
            why: '',
            what: '',
            who: '',
            where: '',
            link: ''
        }
    };
    state.nodes.push(node);
    return node;
}

function deleteNode(nodeId) {
    const idx = state.nodes.findIndex(n => n.id === nodeId);
    if (idx === -1) return;
    const node = state.nodes[idx];

    // 子ノードの親参照を解除
    node.children.forEach(childId => {
        const child = state.nodes.find(n => n.id === childId);
        if (child) child.parentId = null;
    });

    // 親ノードから子リストを削除
    if (node.parentId) {
        const parent = state.nodes.find(n => n.id === node.parentId);
        if (parent) {
            parent.children = parent.children.filter(id => id !== nodeId);
        }
    }

    // 関連接続を削除
    state.connections = state.connections.filter(c => c.from !== nodeId && c.to !== nodeId);

    // ノードを削除
    state.nodes.splice(idx, 1);

    // 選択状態を更新
    if (state.selectedNodeId === nodeId) {
        state.selectedNodeId = null;
    }
    state.selectedNodeIds = state.selectedNodeIds.filter(id => id !== nodeId);
}

function updateNodeTitle(node, newTitle) {
    node.title = newTitle;
    node.width = calculateNodeWidth(newTitle, !!(node.details && node.details.link));
}

function toggleNodeComplete(node) {
    node.completed = !node.completed;
    node.completedAt = node.completed ? new Date().toISOString() : null;

    // 子ノードも連動
    if (node.children && node.children.length > 0) {
        node.children.forEach(childId => {
            const child = state.nodes.find(n => n.id === childId);
            if (child) {
                child.completed = node.completed;
                child.completedAt = node.completedAt;
            }
        });
    }
}

function expandNode(node, expand = true) {
    node.expanded = expand;
}

function moveNode(node, x, y) {
    node.x = x;
    node.y = y;
}

function resizeNode(node, width, height) {
    node.width = Math.max(NODE_DEFAULTS.minWidth, width);
    if (height) node.height = height;
}

function setNodeColor(node, color) {
    node.color = color;
}

function setNodePriority(node, priority) {
    node.priority = Math.max(PRIORITY_CONFIG.min, Math.min(PRIORITY_CONFIG.max, priority));
}

function setNodeType(node, type) {
    node.type = type;
}

function setNodeDetails(node, details) {
    node.details = { ...node.details, ...details };
}

function addChildNode(parentNode, childNode) {
    if (!parentNode.children) parentNode.children = [];
    parentNode.children.push(childNode.id);
    childNode.parentId = parentNode.id;
}

function removeChildNode(parentNode, childNode) {
    if (!parentNode.children) return;
    parentNode.children = parentNode.children.filter(id => id !== childNode.id);
    childNode.parentId = null;
}

function getNodeById(id) {
    return state.nodes.find(n => n.id === id);
}

function getNodesByType(type) {
    return state.nodes.filter(n => n.type === type);
}

function getRootNodes() {
    return state.nodes.filter(n => !n.parentId);
}

function getChildNodes(parentNode) {
    if (!parentNode.children) return [];
    return parentNode.children.map(id => getNodeById(id)).filter(Boolean);
}

function sortNodesByPriority(nodes = state.nodes) {
    return [...nodes].sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

function sortNodeChildren(parentNode) {
    if (!parentNode.children || parentNode.children.length <= 1) return;
    
    // 子ノードを取得
    const childNodes = parentNode.children
        .map(id => getNodeById(id))
        .filter(Boolean);
    
    // 未完了タスクを優先度でソート（高い順）、完了済みタスクを最下部に
    childNodes.sort((a, b) => {
        // 完了済みタスクは最下部へ
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        // 同じ完了状態なら優先度でソート
        return (b.priority || 0) - (a.priority || 0);
    });
    
    // children配列を更新
    parentNode.children = childNodes.map(n => n.id);
    
    // 子ノードの位置を整える（Y座標を均等に配置）
    const startY = parentNode.y + (parentNode.height || 100) + 20;
    const spacing = 80;
    childNodes.forEach((child, index) => {
        child.x = parentNode.x;
        child.y = startY + index * spacing;
    });
}

function sortNodesByDueDate(nodes = state.nodes) {
    return [...nodes].sort((a, b) => {
        const aDue = a.details && a.details.when ? calculateNextDueDate(a.details.when) : null;
        const bDue = b.details && b.details.when ? calculateNextDueDate(b.details.when) : null;
        if (!aDue && !bDue) return 0;
        if (!aDue) return 1;
        if (!bDue) return -1;
        return new Date(aDue) - new Date(bDue);
    });
}

function calculateNextDueDate(when) {
    if (!when || when.repeatType === 'disabled' || when.repeatType === 'none') {
        return when && when.baseDateTime ? when.baseDateTime : null;
    }
    // 簡易計算 - 実際の実装はより複雑
    return when.nextDate || when.baseDateTime || null;
}

function getNodeDepth(node, depth = 0) {
    if (!node.parentId) return depth;
    const parent = getNodeById(node.parentId);
    if (!parent) return depth;
    return getNodeDepth(parent, depth + 1);
}

function getNodeTree(node) {
    const result = [node];
    const children = getChildNodes(node);
    children.forEach(child => {
        result.push(...getNodeTree(child));
    });
    return result;
}

function cloneNode(node, offsetX = 20, offsetY = 20) {
    const newNode = createNode(node.x + offsetX, node.y + offsetY, node.title + ' (コピー)', node.type);
    newNode.color = node.color;
    newNode.priority = node.priority;
    newNode.details = JSON.parse(JSON.stringify(node.details));
    return newNode;
}
