const fs = require('fs');
const file = 'F:\\MyProjects\\taskmind\\index.html';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
const removeFlags = new Array(lines.length).fill(false);

function markRemove(start, end) {
  for (let k = start; k <= end && k < lines.length; k++) removeFlags[k] = true;
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('.group-label {')) {
    let j = i;
    while (j < lines.length && !lines[j].includes('}')) j++;
    markRemove(i, j);
  }
  if (line.includes('btn-group')) {
    markRemove(i, i);
  }
  if (line.includes('id="groups"')) {
    markRemove(i, i);
  }
  if (line.includes('groups: [],')) {
    markRemove(i, i);
  }
  if (line.includes('groupDrag: null') || line.includes('groupDragOffset')) {
    markRemove(i, i);
  }
  if (line.includes('groupsEl')) {
    markRemove(i, i);
  }
  if (line.includes("mode === 'group'")) {
    let j = i;
    while (j < lines.length && !lines[j].trim().startsWith('} else')) j++;
    markRemove(i, j);
  }
  if (line.includes('groupId: null,')) {
    markRemove(i, i);
  }
  if (line.includes('const hadGroupId')) {
    markRemove(i, i);
  }
  if (line.includes('Group Operations')) {
    let j = i;
    while (j < lines.length && !lines[j].includes('Connection Operations')) j++;
    markRemove(i, j - 1);
  }
  if (line.includes('function renderGroups()')) {
    let j = i;
    while (j < lines.length && !lines[j].includes('}')) j++;
    markRemove(i, j);
  }
  if (line.includes('Group Drag')) {
    let j = i;
    while (j < lines.length && !lines[j].includes('function saveToFile')) j++;
    markRemove(i, j - 1);
  }
  if (line.includes('Migrate old groups')) {
    let j = i;
    while (j < lines.length && !lines[j].includes('renderNodes()')) j++;
    markRemove(i, j - 1);
  }
  if (line.includes('renderGroups();')) {
    markRemove(i, i);
  }
}

// 追加: deleteNode内のグループ関連ブロックを検出して削除
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// Remove node from any group it belonged to')) {
    let j = i;
    while (j < lines.length && !lines[j].trim().startsWith('// Clear parentId')) j++;
    markRemove(i, j - 1);
  }
  if (lines[i].includes('// Also remove from groups where this node was a member')) {
    let j = i;
    while (j < lines.length && !lines[j].trim().startsWith('renderNodes()')) j++;
    markRemove(i, j - 1);
  }
}

// 追加: マウスムーブ・タッチムーブのgroupDragブロックを検出
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === 'if (state.groupDrag) {' || lines[i].trim() === 'if (state.groupDrag && e.touches.length === 1) {') {
    let j = i;
    let braceCount = 0;
    while (j < lines.length) {
      for (const ch of lines[j]) {
        if (ch === '{') braceCount++;
        if (ch === '}') braceCount--;
      }
      if (braceCount === 0 && j > i) break;
      j++;
    }
    // return; があれば含める
    if (j + 1 < lines.length && lines[j + 1].trim() === 'return;') {
      markRemove(i, j + 1);
    } else {
      markRemove(i, j);
    }
  }
}

const result = lines.filter((_, idx) => !removeFlags[idx]);
fs.writeFileSync(file, result.join('\n'), 'utf8');
console.log('Removed', removeFlags.filter(f => f).length, 'lines. New line count:', result.length);
