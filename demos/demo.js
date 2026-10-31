(() => {
  'use strict';

  const menuButtons = [...document.querySelectorAll('[data-menu-filter]')];
  const menuItems = [...document.querySelectorAll('.cafe-item')];
  menuButtons.forEach(button => button.addEventListener('click', () => {
    const type = button.dataset.menuFilter;
    menuButtons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    menuItems.forEach(item => { item.hidden = type !== 'all' && item.dataset.category !== type; });
    const count = menuItems.filter(item => !item.hidden).length;
    const result = document.getElementById('menu-result');
    if (result) result.textContent = `${count} sample menu ${count === 1 ? 'item' : 'items'} shown. Prices and ordering are intentionally omitted.`;
  }));

  const galleryButtons = [...document.querySelectorAll('[data-gallery-filter]')];
  const galleryItems = [...document.querySelectorAll('.interiors-card')];
  galleryButtons.forEach(button => button.addEventListener('click', () => {
    const type = button.dataset.galleryFilter;
    galleryButtons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    galleryItems.forEach(item => { item.hidden = type !== 'all' && item.dataset.category !== type; });
    const count = galleryItems.filter(item => !item.hidden).length;
    const result = document.getElementById('gallery-result');
    if (result) result.textContent = `${count} concept ${count === 1 ? 'study' : 'studies'} shown.`;
  }));

  const board = document.getElementById('flow-columns');
  if (board) {
    const key = 'sdb-flowboard-demo-v1';
    const seed = [
      { id:'seed-1', text:'Write the homepage introduction', status:'todo' },
      { id:'seed-2', text:'Review responsive spacing', status:'doing' },
      { id:'seed-3', text:'Check navigation keyboard access', status:'done' },
      { id:'seed-4', text:'Plan the project handoff', status:'todo' }
    ];
    const validStatuses = ['todo','doing','done'];
    let filter = 'all';
    function read() {
      try {
        const raw = localStorage.getItem(key);
        if (raw === null) return seed.map(item => ({...item}));
        const items = JSON.parse(raw);
        if (!Array.isArray(items)) return seed.map(item => ({...item}));
        return items.filter(item => item && typeof item.id === 'string' && typeof item.text === 'string' && validStatuses.includes(item.status)).slice(0,100);
      } catch { return seed.map(item => ({...item})); }
    }
    let tasks = read();
    const save = () => { try { localStorage.setItem(key,JSON.stringify(tasks)); } catch {} };
    const make = (tag,className,text) => {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (text !== undefined) element.textContent = text;
      return element;
    };
    function render() {
      board.replaceChildren();
      board.classList.toggle('filtered',filter !== 'all');
      const total = document.getElementById('task-count');
      if (total) total.textContent = String(tasks.length);
      for (const [status,label] of [['todo','To do'],['doing','In progress'],['done','Done']]) {
        if (filter !== 'all' && filter !== status) continue;
        const column = make('section','flow-col');
        column.dataset.status = status;
        const matching = tasks.filter(task => task.status === status);
        const h3 = make('h3');
        h3.append(make('span','flow-dot'),document.createTextNode(' '+label+' '),make('b','',String(matching.length)));
        column.append(h3);
        if (!matching.length) column.append(make('p','flow-empty','Nothing here yet. Add or move a task.'));
        for (const task of matching) {
          const card = make('article','flow-task');
          card.append(make('p','',task.text));
          const actions = make('div','flow-task-actions');
          const next = make('button','',status === 'todo' ? 'Start →' : status === 'doing' ? 'Complete ✓' : 'Restart ↺');
          next.type = 'button';
          next.setAttribute('aria-label', `${next.textContent} task: ${task.text}`);
          next.addEventListener('click', () => {
            task.status = status === 'todo' ? 'doing' : status === 'doing' ? 'done' : 'todo';
            save(); render();
          });
          const remove = make('button','remove','Remove');
          remove.type = 'button';
          remove.setAttribute('aria-label', `Remove task: ${task.text}`);
          remove.addEventListener('click', () => { tasks = tasks.filter(item => item.id !== task.id); save(); render(); });
          actions.append(next,remove);
          card.append(actions);
          column.append(card);
        }
        board.append(column);
      }
    }
    document.getElementById('flow-task-form')?.addEventListener('submit', event => {
      event.preventDefault();
      const input = document.getElementById('flow-task-input');
      const status = document.getElementById('flow-status');
      const value = input?.value.trim();
      if (!value || value.length > 120) return;
      tasks.unshift({id:String(Date.now())+'-'+Math.random().toString(36).slice(2,7),text:value,status:validStatuses.includes(status.value)?status.value:'todo'});
      if (tasks.length > 100) tasks = tasks.slice(0,100);
      input.value = '';filter = 'all';
      document.querySelectorAll('[data-flow-filter]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.flowFilter === 'all')));
      save();render();input.focus();
    });
    document.querySelectorAll('[data-flow-filter]').forEach(button => button.addEventListener('click', () => {
      filter = button.dataset.flowFilter;
      document.querySelectorAll('[data-flow-filter]').forEach(b => b.setAttribute('aria-pressed',String(b === button)));
      render();
    }));
    document.getElementById('flow-reset')?.addEventListener('click', () => {
      if (!window.confirm('Reset this browser-local demo board to its sample tasks? Your added demo tasks will be removed.')) return;
      tasks = seed.map(item => ({...item}));save();render();
    });
    render();
  }

  const seoChecks = [...document.querySelectorAll('[data-seo-item]')];
  if (seoChecks.length) {
    const key = 'sdb-seo-launchpad-demo-v1';
    try {
      const checked = JSON.parse(localStorage.getItem(key) || '[]');
      if (Array.isArray(checked)) seoChecks.forEach(c => { c.checked = checked.includes(c.dataset.seoItem); });
    } catch {}
    const update = () => {
      const completed = seoChecks.filter(c => c.checked);
      const percent = Math.round(completed.length / seoChecks.length * 100);
      const number = document.getElementById('seo-progress-number');
      const fill = document.getElementById('seo-progress-fill');
      const sub = document.getElementById('seo-progress-sub');
      if (number) number.textContent = percent+'%';
      if (fill) fill.style.width = percent+'%';
      if (sub) sub.textContent = `${completed.length} of ${seoChecks.length} items completed`;
      try { localStorage.setItem(key,JSON.stringify(completed.map(c => c.dataset.seoItem))); } catch {}
    };
    seoChecks.forEach(box => box.addEventListener('change',update));
    document.getElementById('seo-reset')?.addEventListener('click', () => {
      if (!window.confirm('Clear your saved SEO checklist progress in this browser?')) return;
      seoChecks.forEach(box => { box.checked = false; });update();
      const status = document.getElementById('seo-copy-status');
      if (status) status.textContent = 'Checklist reset.';
    });
    document.getElementById('seo-copy')?.addEventListener('click', async () => {
      const completed = seoChecks.filter(box => box.checked).map(box => box.dataset.seoItem);
      const remaining = seoChecks.filter(box => !box.checked).map(box => box.dataset.seoItem);
      const report = [
        'SEO Launchpad — Demo checklist summary',
        `${completed.length} of ${seoChecks.length} items reviewed`,
        '',
        'Completed:',
        ...completed.map(item => '- '+item),
        '',
        'Still to review:',
        ...remaining.map(item => '- '+item),
        '',
        'This is a planning demo, not a live site audit.'
      ].join('\n');
      const status = document.getElementById('seo-copy-status');
      try {
        await navigator.clipboard.writeText(report);
        if (status) status.textContent = 'Summary copied to clipboard.';
      } catch {
        if (status) status.textContent = 'Clipboard unavailable. Please select and copy the checklist manually.';
      }
    });
    update();
  }
})();
