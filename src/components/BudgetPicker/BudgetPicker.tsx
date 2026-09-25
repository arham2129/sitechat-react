import { useRef, type KeyboardEvent } from 'react';
import { CRAWL_BUDGETS, type CrawlBudget } from '../../api/types';
import styles from './BudgetPicker.module.css';

interface BudgetPickerProps {
  value: CrawlBudget;
  onChange: (value: CrawlBudget) => void;
  /** Id of the visible label, so the group is announced by name. */
  labelledBy: string;
  disabled?: boolean;
}

const STEP: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

export function BudgetPicker({ value, onChange, labelledBy, disabled = false }: BudgetPickerProps) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  // Radio-group keyboard pattern: Tab reaches only the checked option, arrows move and
  // select, wrapping at the ends (WAI-ARIA APG "Radio Group").
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = STEP[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const index = CRAWL_BUDGETS.indexOf(value);
    const next = (index + step + CRAWL_BUDGETS.length) % CRAWL_BUDGETS.length;
    const budget = CRAWL_BUDGETS[next];
    if (budget === undefined) return;
    onChange(budget);
    buttons.current[next]?.focus();
  };

  return (
    <div className={styles.group} role="radiogroup" aria-labelledby={labelledBy} aria-disabled={disabled}>
      {CRAWL_BUDGETS.map((budget, index) => {
        const checked = budget === value;
        return (
          <button
            key={budget}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            disabled={disabled}
            className={styles.option}
            onClick={() => onChange(budget)}
            onKeyDown={onKeyDown}
          >
            {budget}
          </button>
        );
      })}
    </div>
  );
}
