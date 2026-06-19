// connection.js - TaskMind Connection モデル・操作

function createConnection(from, to, label = '', type = '', customType = '') {
    const exists = state.connections.some(c => c.from === from && c.to === to);
    if (exists) return;

    state.connections.push({ from, to, label, type, customType });
    renderConnections();
}

function deleteConnection(from, to) {
    state.connections = state.connections.filter(c => !(c.from === from && c.to === to));
    renderConnections();
}

function getConnectionTypeInfo(label) {
    return state.customConnectionTypes.find(ct => ct.label === label) || { color: '#888888', icon: '' };
}

function getConnectionsFromNode(nodeId) {
    return state.connections.filter(c => c.from === nodeId);
}

function getConnectionsToNode(nodeId) {
    return state.connections.filter(c => c.to === nodeId);
}

function getAllConnectionsForNode(nodeId) {
    return state.connections.filter(c => c.from === nodeId || c.to === nodeId);
}

function updateConnectionType(from, to, newType, newCustomType = '') {
    const conn = state.connections.find(c => c.from === from && c.to === to);
    if (conn) {
        conn.type = newType;
        conn.customType = newCustomType;
        renderConnections();
    }
}

function setConnectionLabel(from, to, label) {
    const conn = state.connections.find(c => c.from === from && c.to === to);
    if (conn) {
        conn.label = label;
        renderConnections();
    }
}

function toggleConnectionCollapse(from, to) {
    const conn = state.connections.find(c => c.from === from && c.to === to);
    if (conn) {
        conn.collapsed = !conn.collapsed;
        renderConnections();
    }
}

function removeAllConnectionsForNode(nodeId) {
    state.connections = state.connections.filter(c => c.from !== nodeId && c.to !== nodeId);
    renderConnections();
}

function getConnectionBetween(from, to) {
    return state.connections.find(c => c.from === from && c.to === to);
}

function hasConnection(from, to) {
    return state.connections.some(c => c.from === from && c.to === to);
}

function getConnectedNodes(nodeId) {
    const connections = getAllConnectionsForNode(nodeId);
    return connections.map(c => {
        const otherId = c.from === nodeId ? c.to : c.from;
        return getNodeById(otherId);
    }).filter(Boolean);
}

function getChildConnections(parentId) {
    return state.connections.filter(c => c.from === parentId);
}

function getParentConnections(childId) {
    return state.connections.filter(c => c.to === childId);
}
