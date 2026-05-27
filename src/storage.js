const INDEX_KEY = '__index__';
const noteKey = (d) => `note:${d}`;

export async function loadNote(domain) {
  const key = noteKey(domain);
  const obj = await chrome.storage.local.get(key);
  return obj[key] || null;
}

export async function saveNote(domain, doc, lastUrl) {
  const now = Date.now();
  const existing = (await chrome.storage.local.get(noteKey(domain)))[noteKey(domain)] || {};
  const payload = {
    domain,
    doc,
    updatedAt: now,
    lastUrl: lastUrl || existing.lastUrl || null,
  };
  await chrome.storage.local.set({ [noteKey(domain)]: payload });
  await updateIndex(domain, now, extractPreview(doc), payload.lastUrl);
  return now;
}

async function updateIndex(domain, updatedAt, preview, lastUrl) {
  const obj = await chrome.storage.local.get(INDEX_KEY);
  const idx = obj[INDEX_KEY] || { domains: [] };
  const existing = idx.domains.find((d) => d.domain === domain);
  if (existing) {
    existing.updatedAt = updatedAt;
    existing.preview = preview;
    if (lastUrl) existing.lastUrl = lastUrl;
  } else {
    idx.domains.push({ domain, updatedAt, preview, lastUrl: lastUrl || null });
  }
  await chrome.storage.local.set({ [INDEX_KEY]: idx });
}

export async function listDomains() {
  const obj = await chrome.storage.local.get(INDEX_KEY);
  const idx = obj[INDEX_KEY] || { domains: [] };
  return [...idx.domains].sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteNote(domain) {
  await chrome.storage.local.remove(noteKey(domain));
  const obj = await chrome.storage.local.get(INDEX_KEY);
  const idx = obj[INDEX_KEY] || { domains: [] };
  idx.domains = idx.domains.filter((d) => d.domain !== domain);
  await chrome.storage.local.set({ [INDEX_KEY]: idx });
}

function extractPreview(doc) {
  const walk = (node) => {
    if (!node) return '';
    if (typeof node.text === 'string') return node.text;
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        const t = walk(child);
        if (t) return t;
      }
    }
    return '';
  };
  return walk(doc).slice(0, 80);
}
