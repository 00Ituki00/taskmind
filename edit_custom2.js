const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// showConnectionTypeSelectorForEdit にカスタム接続線タイプ一覧を追加
const oldForEdit = `                popup.appendChild(btn);
            });

            // 自由入力ボタン
            const customBtn = document.createElement('button');
            const isCustom = !conn.type || !['Why','How','Problem','Result','Alternative','Caution','Therefore'].includes(conn.type);`;

const newForEdit = `                popup.appendChild(btn);
            });

            // カスタム接続線タイプ一覧
            if (state.customConnectionTypes \u0026\u0026 state.customConnectionTypes.length \u003e 0) {
                const divider = document.createElement('div');
                divider.style.cssText = 'border-top:1px solid #eee; margin:4px 0;';
                popup.appendChild(divider);

                state.customConnectionTypes.forEach(ct \u003d\u003e {
                    const row = document.createElement('div');
                    row.style.cssText = 'display:flex; align-items:center; gap:4px; padding:2px 0;';

                    const btn = document.createElement('button');
                    const isCurrent = conn.customType \u003d\u003d\u003d ct.label;
                    btn.style.cssText = \`border:none; background:\${isCurrent ? '#f0f0f0' : 'none'}; padding:6px 8px; border-radius:4px; cursor:pointer; text-align:left; font-size:13px; flex:1; display:flex; align-items:center; gap:6px; font-weight:\${isCurrent ? '600' : 'normal'};\`;
                    btn.innerHTML = \`<span style=\"width:10px;height:10px;border-radius:50%;background:\${ct.color};display:inline-block;\"></span> \${escapeHtml(ct.label)} \${isCurrent ? '✓' : ''}\`;
                    btn.addEventListener('mouseenter', () \u003d\u003e { if (!isCurrent) btn.style.background = '#f5f5f5'; });
                    btn.addEventListener('mouseleave', () \u003d\u003e { if (!isCurrent) btn.style.background = 'none'; });
                    btn.addEventListener('click', (e) \u003d\u003e {
                        e.stopPropagation();
                        conn.type = '';
                        conn.customType = ct.label;
                        conn.label = '';
                        renderConnections();
                        popup.remove();
                    });
                    row.appendChild(btn);

                    const delBtn = document.createElement('button');
                    delBtn.textContent = '×';
                    delBtn.style.cssText = 'border:none; background:none; padding:4px 6px; border-radius:4px; cursor:pointer; font-size:14px; color:#999; line-height:1;';
                    delBtn.addEventListener('mouseenter', () \u003d\u003e delBtn.style.color = '#d32f2f');
                    delBtn.addEventListener('mouseleave', () \u003d\u003e delBtn.style.color = '#999');
                    delBtn.addEventListener('click', (e) \u003d\u003e {
                        e.stopPropagation();
                        state.customConnectionTypes = state.customConnectionTypes.filter(c \u003d\u003e c.label !== ct.label);
                        row.remove();
                        if (state.customConnectionTypes.length === 0) divider.remove();
                    });
                    row.appendChild(delBtn);

                    popup.appendChild(row);
                });
            }

            // 自由入力ボタン
            const customBtn = document.createElement('button');
            const isCustom = !conn.type || !['Why','How','Problem','Result','Alternative','Caution','Therefore'].includes(conn.type);`;

if (content.includes(oldForEdit)) {
    content = content.replace(oldForEdit, newForEdit);
    console.log('Replaced forEdit');
} else {
    console.log('oldForEdit not found');
}

fs.writeFileSync('index.html', content, 'utf8');
console.log('Done');
