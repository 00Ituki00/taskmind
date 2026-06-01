const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. showConnectionTypeSelectorAtStart にカスタム接続線タイプ一覧を追加
const oldAtStart = `                popup.appendChild(btn);
            });

            // 自由入力ボタン`;
const newAtStart = `                popup.appendChild(btn);
            });

            // カスタム接続線タイプ一覧
            if (state.customConnectionTypes && state.customConnectionTypes.length > 0) {
                const divider = document.createElement('div');
                divider.style.cssText = 'border-top:1px solid #eee; margin:4px 0;';
                popup.appendChild(divider);

                state.customConnectionTypes.forEach(ct => {
                    const row = document.createElement('div');
                    row.style.cssText = 'display:flex; align-items:center; gap:4px; padding:2px 0;';

                    const btn = document.createElement('button');
                    btn.style.cssText = \`
                        border:none; background:none; padding:6px 8px; border-radius:4px;
                        cursor:pointer; text-align:left; font-size:13px; flex:1;
                        display:flex; align-items:center; gap:6px;
                    \`;
                    btn.innerHTML = \`<span style="width:10px;height:10px;border-radius:50%;background:\${ct.color};display:inline-block;"></span> \${escapeHtml(ct.label)}\`;
                    btn.addEventListener('mouseenter', () => btn.style.background = '#f5f5f5');
                    btn.addEventListener('mouseleave', () => btn.style.background = 'none');
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        state.pendingConnectionType = '';
                        state.pendingConnectionCustomType = ct.label;
                        state.connectingFrom = fromNodeId;
                        state.mode = 'connect';
                        modeIndicator.textContent = '接続モード: 終了ノードを選択';
                        modeIndicator.classList.add('active');
                        popup.remove();
                    });
                    row.appendChild(btn);

                    const delBtn = document.createElement('button');
                    delBtn.textContent = '×';
                    delBtn.style.cssText = 'border:none; background:none; padding:4px 6px; border-radius:4px; cursor:pointer; font-size:14px; color:#999; line-height:1;';
                    delBtn.addEventListener('mouseenter', () => delBtn.style.color = '#d32f2f');
                    delBtn.addEventListener('mouseleave', () => delBtn.style.color = '#999');
                    delBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        state.customConnectionTypes = state.customConnectionTypes.filter(c => c.label !== ct.label);
                        row.remove();
                        if (state.customConnectionTypes.length === 0) divider.remove();
                    });
                    row.appendChild(delBtn);

                    popup.appendChild(row);
                });
            }

            // 自由入力ボタン`;

if (content.includes(oldAtStart)) {
    content = content.replace(oldAtStart, newAtStart);
    console.log('Replaced atStart');
} else {
    console.log('oldAtStart not found');
}

fs.writeFileSync('index.html', content, 'utf8');
console.log('Done');
