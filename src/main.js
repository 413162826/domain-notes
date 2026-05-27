import { createEditor, countCharacters, insertPageReference } from './editor.js';
import { getActiveDomain, getActiveTab, resolveDomain } from './domain.js';
import { loadNote, saveNote, listDomains, deleteNote } from './storage.js';
import { faviconUrl, attachFaviconFallback } from './favicon.js';
import { exportAll, importAll } from './backup.js';

const SAVE_DEBOUNCE = 500;

const state = {
  domain: null,
  activeTab: null,
  editor: null,
  pendingDoc: null,
  saveTimer: null,
};

const $ = (id) => document.getElementById(id);

// ============== Domain switching / editor lifecycle ==============

async function openDomain(domain, { tabContext } = {}) {
  await flushSave();
  state.domain = domain;
  state.lastUrl = tabContext?.url || null;

  // Header
  $('domain-label').textContent = domain;
  $('domain-label').title = domain;
  const favEl = $('domain-favicon');
  attachFaviconFallback(favEl);
  // Prefer the actual tab URL → fall back to stored lastUrl → fall back to domain
  const stored = await loadNote(domain);
  favEl.src = faviconUrl(tabContext?.url || stored?.lastUrl || domain, 32);

  if (tabContext?.url) {
    try {
      const u = new URL(tabContext.url);
      const sub = (tabContext.title || u.pathname) + (u.pathname !== '/' ? ` · ${u.pathname}` : '');
      $('page-sub').textContent = sub;
      $('page-sub').title = tabContext.url;
      $('btn-insert-ref').hidden = false;
    } catch {
      $('page-sub').textContent = '';
      $('btn-insert-ref').hidden = true;
    }
  } else {
    $('page-sub').textContent = '';
    $('btn-insert-ref').hidden = true;
  }

  // Editor
  if (state.editor) {
    state.editor.destroy();
    state.editor = null;
  }
  $('editor').innerHTML = '';

  state.editor = createEditor({
    element: $('editor'),
    content: stored?.doc || null,
    placeholder: `为 ${domain} 写点什么…（# 标题、- 列表、Ctrl+K 链接、粘贴图片）`,
    onUpdate: (doc) => {
      state.pendingDoc = doc;
      setStatus('编辑中…', 'saving');
      updateWordCount(doc);
      scheduleSave();
    },
    onImageClick: openLightbox,
  });

  const initialDoc = stored?.doc || state.editor.getJSON();
  updateWordCount(initialDoc);
  setStatus(stored ? `已保存 · ${fmtTime(stored.updatedAt)}` : '新笔记', stored ? 'saved' : '');
  showEditorView();
}

function scheduleSave() {
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(flushSave, SAVE_DEBOUNCE);
}

async function flushSave() {
  clearTimeout(state.saveTimer);
  state.saveTimer = null;
  if (!state.pendingDoc || !state.domain) return;
  const doc = state.pendingDoc;
  state.pendingDoc = null;
  const ts = await saveNote(state.domain, doc, state.lastUrl);
  setStatus(`已保存 · ${fmtTime(ts)}`, 'saved');
}

// ============== Status / word count ==============

function setStatus(text, cls = '') {
  const el = $('status-text');
  el.textContent = text;
  el.className = cls;
}

function updateWordCount(doc) {
  const n = countCharacters(doc);
  $('word-count').textContent = n ? `${n} 字` : '';
}

function fmtTime(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function fmtRelTime(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} 天前`;
  return new Date(ts).toLocaleDateString();
}

// ============== View switching ==============

function showEditorView() {
  $('folder-view').hidden = true;
  $('editor-view').hidden = false;
  if (state.editor) state.editor.commands.focus('end');
}

async function showFolderView() {
  await flushSave();
  $('editor-view').hidden = true;
  $('folder-view').hidden = false;
  await renderFolder();
}

async function renderFolder() {
  const domains = await listDomains();
  const grid = $('domain-grid');
  grid.innerHTML = '';
  $('folder-title').textContent = `所有笔记`;
  $('folder-sub').textContent = domains.length
    ? `共 ${domains.length} 本 · 按修改时间排序`
    : '';

  if (domains.length === 0) {
    grid.innerHTML = `<div class="empty">
      <div class="empty-icon">📝</div>
      还没有笔记<br>访问任意网站，点击插件即可开始
    </div>`;
    return;
  }

  for (const d of domains) {
    const card = document.createElement('div');
    card.className = 'card' + (d.domain === state.domain ? ' active' : '');

    const head = document.createElement('div');
    head.className = 'card-head';
    const fav = document.createElement('img');
    fav.className = 'card-favicon';
    attachFaviconFallback(fav);
    fav.src = faviconUrl(d.lastUrl || d.domain, 16);
    fav.alt = '';
    const name = document.createElement('div');
    name.className = 'card-domain';
    name.textContent = d.domain;
    head.append(fav, name);

    const preview = document.createElement('div');
    preview.className = 'card-preview';
    preview.textContent = d.preview || '（空笔记）';

    const time = document.createElement('div');
    time.className = 'card-time';
    time.textContent = fmtRelTime(d.updatedAt);

    const del = document.createElement('button');
    del.className = 'card-delete';
    del.title = '删除此笔记';
    del.textContent = '×';
    del.addEventListener('click', async (e) => {
      e.stopPropagation();
      const ok = await confirmDialog(`删除 ${d.domain} 的笔记？\n此操作无法撤销。`);
      if (!ok) return;
      await deleteNote(d.domain);
      if (state.domain === d.domain) {
        state.domain = null;
        state.pendingDoc = null;
      }
      toast(`已删除 ${d.domain}`);
      await renderFolder();
    });

    card.append(head, preview, time, del);
    card.addEventListener('click', async () => {
      const t = await getActiveTab();
      const ctx = t && resolveDomain(t.url) === d.domain
        ? { url: t.url, title: t.title }
        : null;
      await openDomain(d.domain, { tabContext: ctx });
    });
    grid.appendChild(card);
  }
}

// ============== Insert current page reference ==============

async function handleInsertRef() {
  if (!state.editor || !state.activeTab) return;
  insertPageReference(state.editor, {
    title: state.activeTab.title,
    url: state.activeTab.url,
  });
  toast('已插入当前页面');
}

// ============== Lightbox ==============

function openLightbox(src) {
  const lb = $('lightbox');
  const img = $('lightbox-img');
  img.src = src;
  lb.hidden = false;
}

function closeLightbox() {
  $('lightbox').hidden = true;
  $('lightbox-img').src = '';
}

// ============== Confirm dialog (returns Promise<boolean>) ==============

function confirmDialog(text) {
  return new Promise((resolve) => {
    $('confirm-text').textContent = text;
    $('confirm').hidden = false;

    const cleanup = (result) => {
      $('confirm').hidden = true;
      $('confirm-ok').removeEventListener('click', onOk);
      $('confirm-cancel').removeEventListener('click', onCancel);
      document.removeEventListener('keydown', onKey);
      resolve(result);
    };
    const onOk = () => cleanup(true);
    const onCancel = () => cleanup(false);
    const onKey = (e) => {
      if (e.key === 'Escape') cleanup(false);
      if (e.key === 'Enter') cleanup(true);
    };

    $('confirm-ok').addEventListener('click', onOk);
    $('confirm-cancel').addEventListener('click', onCancel);
    document.addEventListener('keydown', onKey);
  });
}

// ============== Toast ==============

let toastTimer = null;
function toast(text) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  clearTimeout(toastTimer);

  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = text;
  document.body.appendChild(t);
  toastTimer = setTimeout(() => t.remove(), 2000);
}

// ============== Export / import ==============

async function handleExport() {
  try {
    const n = await exportAll();
    toast(`已导出 (${n} 项)`);
  } catch (e) {
    toast('导出失败: ' + e.message);
  }
}

function handleImportClick() {
  $('import-file').click();
}

async function handleImportFile(e) {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  const ok = await confirmDialog(`从「${file.name}」导入备份？\n现有同域名笔记中更早的版本会被覆盖。`);
  if (!ok) return;
  try {
    const n = await importAll(file);
    toast(`已导入 ${n} 本笔记`);
    await renderFolder();
  } catch (err) {
    await confirmDialog('导入失败: ' + err.message);
  }
}

// ============== Init ==============

async function init() {
  // Action handlers
  $('btn-folder').addEventListener('click', showFolderView);
  $('btn-back').addEventListener('click', () => {
    if (state.domain) showEditorView();
    else showFolderView();
  });
  $('btn-insert-ref').addEventListener('click', handleInsertRef);
  $('btn-export').addEventListener('click', handleExport);
  $('btn-import').addEventListener('click', handleImportClick);
  $('import-file').addEventListener('change', handleImportFile);

  // Lightbox dismiss
  $('lightbox').addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('lightbox').hidden) {
      closeLightbox();
      e.preventDefault();
    }
  });

  // Global shortcuts
  document.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    if (e.key === '/') {
      e.preventDefault();
      if ($('folder-view').hidden) showFolderView();
      else if (state.domain) showEditorView();
    } else if (e.shiftKey && (e.key === 'R' || e.key === 'r')) {
      if (state.editor && state.activeTab) {
        e.preventDefault();
        handleInsertRef();
      }
    }
  });

  // Save on close / blur
  window.addEventListener('blur', flushSave);
  window.addEventListener('beforeunload', () => {
    if (state.pendingDoc && state.domain) {
      saveNote(state.domain, state.pendingDoc, state.lastUrl);
    }
  });

  // Initial load
  const { domain, url, title } = await getActiveDomain();
  state.activeTab = url ? { url, title } : null;

  if (domain) {
    await openDomain(domain, { tabContext: state.activeTab });
  } else {
    $('domain-label').textContent = '当前页面不支持记笔记';
    $('domain-favicon').removeAttribute('src');
    $('page-sub').textContent = 'chrome://、file:// 等内部页面已跳过';
    $('btn-insert-ref').hidden = true;
    await showFolderView();
  }
}

init();
