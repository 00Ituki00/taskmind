const fs = require('fs');
const file = 'F:\\MyProjects\\taskmind\\index.html';
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

const toRemove = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('.group-label {')) {
    let j = i;
    while (j < lines.length && !lines[j].includes('}')) j++;
    toRemove.push({start: i, end: j, reason: 'CSS .group-label'});
  }
  if (line.includes('btn-group')) {
    toRemove.push({start: i, end: i, reason: 'btn-group'});
  }
  if (line.includes('id="groups"')) {
    toRemove.push({start: i, end: i, reason: 'div#groups'});
  }
  if (line.includes('groups: [],')) {
    toRemove.push({start: i, end: i, reason: 'state.groups'});
  }
  if (line.includes('groupDrag: null') || line.includes('groupDragOffset')) {
    toRemove.push({start: i, end: i, reason: 'groupDrag state'});
  }
  if (line.includes('groupsEl')) {
    toRemove.push({start: i, end: i, reason: 'groupsEl'});
  }
  if (line.includes("mode === 'group'")) {
    let j = i;
    while (j < lines.length && !lines[j].trim().startsWith('} else')) j++;
    toRemove.push({start: i, end: j, reason: 'group mode'});
  }
  if (line.includes('groupId: null,')) {
    toRemove.push({start: i, end: i, reason: 'groupId: null'});
  }
  if (line.includes('const hadGroupId')) {
    toRemove.push({start: i, end: i, reason: 'hadGroupId'});
  }
  if (line.includes('Group Operations')) {
    let j = i;
    while (j < lines.length && !lines[j].includes('Connection Operations')) j++;
    toRemove.push({start: i, end: j-1, reason: 'Group Operations'});
  }
  if (line.includes('function renderGroups()')) {
    let j = i;
    while (j < lines.length && !lines[j].includes('}')) j++;
    toRemove.push({start: i, end: j, reason: 'renderGroups'});
  }
  if (line.includes('Group Drag')) {
    let j = i;
    while (j < lines.length && !lines[j].includes('function saveToFile')) j++;
    toRemove.push({start: i, end: j-1, reason: 'Group Drag'});
  }
  if (line.includes('Migrate old groups')) {
    let j = i;
    while (j < lines.length && !lines[j].includes('renderNodes()')) j++;
    toRemove.push({start: i, end: j-1, reason: 'Migrate groups'});
  }
  if (line.includes('renderGroups();')) {
    toRemove.push({start: i, end: i, reason: 'renderGroups() call'});
  }
}

console.log('Found', toRemove.length, 'items:');
toRemove.forEach(r => console.log('  Line', r.start+1, '-', r.end+1, ':', r.reason));
