export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// The end of a crawled URL (the page) matters more than the middle of its path, so
// long URLs lose characters from the middle, not the end as CSS ellipsis would.
export function truncateMiddle(text: string, max: number): string {
  if (text.length <= max) return text;
  const keep = max - 1;
  const head = Math.ceil(keep / 2);
  return `${text.slice(0, head)}…${text.slice(text.length - (keep - head))}`;
}

export function displayUrl(url: string, max = 48): string {
  return truncateMiddle(url.replace(/^https?:\/\/(www\.)?/, ''), max);
}
