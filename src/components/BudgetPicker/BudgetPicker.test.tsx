import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import type { CrawlBudget } from '../../api/types';
import { BudgetPicker } from './BudgetPicker';

function Harness() {
  const [value, setValue] = useState<CrawlBudget>(20);
  return (
    <>
      <span id="label">Pages to crawl</span>
      <BudgetPicker value={value} onChange={setValue} labelledBy="label" />
      <button type="button">After</button>
    </>
  );
}

const checked = () => screen.getByRole('radio', { checked: true }).textContent;

describe('BudgetPicker', () => {
  it('is a labelled radio group with one tab stop on the checked option', async () => {
    render(<Harness />);
    expect(screen.getByRole('radiogroup', { name: 'Pages to crawl' })).toBeTruthy();
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe('20');
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe('After');
  });

  it('moves and selects with the arrow keys, wrapping at both ends', async () => {
    render(<Harness />);
    await userEvent.tab();

    await userEvent.keyboard('{ArrowRight}');
    expect(checked()).toBe('60');
    expect(document.activeElement?.textContent).toBe('60');

    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(checked()).toBe('20');

    await userEvent.keyboard('{ArrowLeft}');
    expect(checked()).toBe('120');

    await userEvent.keyboard('{ArrowUp}');
    expect(checked()).toBe('60');
  });

  it('selects on click', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('radio', { name: '120' }));
    expect(checked()).toBe('120');
  });
});
