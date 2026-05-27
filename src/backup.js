// Export / import all notes as a single JSON file.

const SCHEMA_VERSION = 1;

export async function exportAll() {
  const all = await chrome.storage.local.get(null);
  const payload = {
    schema: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: all,
  };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  a.href = url;
  a.download = `domain-notes-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return Object.keys(all).length;
}

export async function importAll(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || !parsed.data) {
    throw new Error('文件格式不正确');
  }
  if (parsed.schema !== SCHEMA_VERSION) {
    throw new Error(`不支持的备份版本 (${parsed.schema})`);
  }

  // Merge: existing index domains + imported, prefer newer updatedAt.
  const existing = await chrome.storage.local.get(null);
  const merged = { ...existing };

  for (const [key, value] of Object.entries(parsed.data)) {
    if (key === '__index__') continue;
    if (!key.startsWith('note:')) continue;
    const cur = merged[key];
    if (!cur || (value?.updatedAt || 0) > (cur?.updatedAt || 0)) {
      merged[key] = value;
    }
  }

  // Rebuild index from notes
  const domains = [];
  for (const [key, value] of Object.entries(merged)) {
    if (!key.startsWith('note:')) continue;
    if (!value?.domain) continue;
    domains.push({
      domain: value.domain,
      updatedAt: value.updatedAt || 0,
      preview: extractPreview(value.doc),
    });
  }
  merged.__index__ = { domains };

  await chrome.storage.local.clear();
  await chrome.storage.local.set(merged);
  return domains.length;
}

function extractPreview(doc) {
  const walk = (n) => {
    if (!n) return '';
    if (typeof n.text === 'string') return n.text;
    if (Array.isArray(n.content)) {
      for (const c of n.content) {
        const t = walk(c);
        if (t) return t;
      }
    }
    return '';
  };
  return walk(doc).slice(0, 80);
}
