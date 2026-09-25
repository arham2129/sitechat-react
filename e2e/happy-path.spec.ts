import { expect, test } from '@playwright/test';

test('crawl, ask, get a sourced answer, offline, with a clean console', async ({ page, context }) => {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') problems.push(message.text());
  });
  page.on('pageerror', (error) => problems.push(error.message));

  // Mock mode is the interview fallback, so it must never need the internet: any request
  // that leaves localhost is blocked and recorded, and the test expects none.
  const external: string[] = [];
  await context.route(
    (url) => url.hostname !== 'localhost',
    (route) => {
      external.push(route.request().url());
      return route.abort('internetdisconnected');
    },
  );

  await page.goto('/');
  await expect(page.getByText('Demo data')).toBeVisible();
  const question = page.getByRole('textbox', { name: 'Question' });
  await expect(question).toBeDisabled();

  // Crawl
  await page.getByRole('button', { name: 'Start crawl' }).click();
  await expect(page.getByRole('progressbar', { name: 'Crawl progress' })).toBeVisible();
  await expect(page.getByText('Ready', { exact: true })).toBeVisible();
  await expect(question).toBeEnabled();
  await expect(question).toBeFocused();

  // Ask
  await question.fill('Do you build mobile apps?');
  await question.press('Enter');
  await expect(page.getByRole('button', { name: 'Stop' })).toBeVisible();

  // Answer, copied from the crawled page
  await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();
  await expect(page.getByText(/we craft iOS & Android apps/)).toBeVisible();

  // Sources
  await page.getByText('Sources (3)').click();
  const sources = page.getByRole('link', { name: /opens in a new tab/ });
  await expect(sources).toHaveCount(3);
  await expect(sources.first()).toHaveAttribute('href', 'https://aibitsoft.com/?page=mobile-experiences');

  // A follow-up grows the conversation past the viewport. On desktop only the conversation
  // may scroll: the page must not, and the composer must stay on screen.
  await question.fill('Can you build an MVP?');
  await question.press('Enter');
  await expect(page.getByText(/Turn ideas into market-ready MVPs/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();
  const pageScrolls = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight);
  expect(pageScrolls).toBe(false);
  await expect(question).toBeInViewport();

  expect(external).toEqual([]);
  expect(problems).toEqual([]);
});
