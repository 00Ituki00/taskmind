const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Fix loadAutosave to parse directly instead of using parseFileData
const oldLoadAutosave = `        // Auto-restore from localStorage on reload
        function loadAutosave() {
            try {
                const saved = localStorage.getItem('taskmind_autosave');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.nodes && data.nodes.length > 0) {
                        parseFileData({ target: { result: saved } });
                        showToast('自動保存データを復元しました');
                        return true;
                    }
                }
            } catch(e) {
                console.warn('Failed to load autosave:', e);
            }
            return false;
        }`;

const newLoadAutosave = `        // Auto-restore from localStorage on reload
        function loadAutosave() {
            try {
                const saved = localStorage.getItem('taskmind_autosave');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.nodes && data.nodes.length > 0) {
                        // Directly restore state without using FileReader
                        state.nodes = (data.nodes || []).map(n => {
                            const node = { ...n, completed: n.completed ?? false };
                            if (typeof node.priority !== 'number') node.priority = 0;
                            if (!node.details || typeof node.details !== 'object') {
                                node.details = { when: { cycle: '', startDate: '', deadline: '' }, what: '', who: '', where: '', link: '' };
                            }
                            if (!node.children) node.children = [];
                            return node;
                        });
                        state.connections = (data.connections || []).map(c => ({
                            ...c,
                            collapsed: c.collapsed ?? false,
                            originalToPos: c.originalToPos || null
                        }));
                        state.nextId = data.nextId || 1;
                        state.customConnectionTypes = data.customConnectionTypes || [];
                        renderNodes();
                        renderConnections();
                        showToast('自動保存データを復元しました');
                        return true;
                    }
                }
            } catch(e) {
                console.warn('Failed to load autosave:', e);
            }
            return false;
        }`;

if (content.includes(oldLoadAutosave)) {
    content = content.replace(oldLoadAutosave, newLoadAutosave);
    console.log('Replaced loadAutosave');
} else {
    console.log('loadAutosave not found');
}

fs.writeFileSync('index.html', content, 'utf8');
console.log('Done');
