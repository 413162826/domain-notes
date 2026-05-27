// Chrome favicon API: chrome-extension://<id>/_favicon/?pageUrl=...&size=...
// Requires "favicon" permission. Chrome returns the cached favicon for the
// exact pageUrl, so passing the URL the user actually visited gives the best
// hit rate (otherwise fall back to https://<domain>/).

const FALLBACK_ICON =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' +
    'fill="none" stroke="%23999" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/>' +
    '<path d="M12 2a15 15 0 010 20"/><path d="M12 2a15 15 0 000 20"/></svg>'
  );

export function faviconUrl(urlOrDomain, size = 32) {
  if (!urlOrDomain) return FALLBACK_ICON;
  const pageUrl = /^https?:\/\//i.test(urlOrDomain)
    ? urlOrDomain
    : `https://${urlOrDomain}/`;
  const url = new URL(chrome.runtime.getURL('/_favicon/'));
  url.searchParams.set('pageUrl', pageUrl);
  url.searchParams.set('size', String(size));
  return url.toString();
}

export function attachFaviconFallback(imgEl) {
  imgEl.addEventListener('error', () => {
    if (imgEl.src !== FALLBACK_ICON) imgEl.src = FALLBACK_ICON;
  }, { once: true });
}
