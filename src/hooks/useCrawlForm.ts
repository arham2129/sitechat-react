import { useRef, useState, type FormEvent } from 'react';
import type { CrawlBudget } from '../api/types';

export type UrlCheck = { ok: true; url: string } | { ok: false; error: string };

export function validateUrl(raw: string): UrlCheck {
  const value = raw.trim();
  if (!value) return { ok: false, error: 'Enter a website address.' };
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return { ok: false, error: 'Enter a full address, like https://aibitsoft.com.' };
  }
  // new URL() also accepts mailto:, ftp: and javascript:, none of which can be crawled.
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: 'Only web addresses can be crawled. Start it with https:// instead.' };
  }
  return { ok: true, url: parsed.href };
}

export function useCrawlForm(
  onStart: (url: string, budget: CrawlBudget) => void,
  initialUrl = '',
  initialBudget: CrawlBudget = 20,
) {
  const [url, setUrlValue] = useState(initialUrl);
  const [budget, setBudget] = useState<CrawlBudget>(initialBudget);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validate on submit, not on every keystroke, so a half-typed address is not
  // flagged as wrong; editing clears the message once shown.
  const setUrl = (value: string) => {
    setUrlValue(value);
    setError(null);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const check = validateUrl(url);
    if (!check.ok) {
      setError(check.error);
      // Focus lands on the field, whose aria-describedby makes screen readers read the error.
      inputRef.current?.focus();
      return;
    }
    onStart(check.url, budget);
  };

  return { url, setUrl, budget, setBudget, error, submit, inputRef };
}
