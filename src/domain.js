import { getDomain } from 'tldts';

export function resolveDomain(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return getDomain(u.hostname) || u.hostname || null;
  } catch {
    return null;
  }
}

export async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}

export async function getActiveDomain() {
  const tab = await getActiveTab();
  return {
    domain: resolveDomain(tab?.url),
    url: tab?.url || null,
    title: tab?.title || null,
  };
}
