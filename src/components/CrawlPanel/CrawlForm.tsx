import type { CrawlBudget } from '../../api/types';
import { useCrawlForm } from '../../hooks/useCrawlForm';
import { BudgetPicker } from '../BudgetPicker/BudgetPicker';
import { Button } from '../Button/Button';
import styles from './CrawlForm.module.css';

interface CrawlFormProps {
  onStart: (url: string, budget: CrawlBudget) => void;
  initialUrl: string;
  initialBudget: CrawlBudget;
}

export function CrawlForm({ onStart, initialUrl, initialBudget }: CrawlFormProps) {
  const { url, setUrl, budget, setBudget, error, submit, inputRef } = useCrawlForm(onStart, initialUrl, initialBudget);
  const errorId = 'crawl-url-error';

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="crawl-url">
          Website address
        </label>
        <input
          ref={inputRef}
          id="crawl-url"
          name="url"
          className={styles.input}
          type="url"
          inputMode="url"
          autoComplete="url"
          spellCheck={false}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          aria-invalid={error !== null}
          aria-describedby={error ? errorId : 'crawl-url-hint'}
        />
        {error ? (
          <p id={errorId} className={styles.error}>
            {error}
          </p>
        ) : (
          <p id="crawl-url-hint" className={styles.hint}>
            Starts with http:// or https://
          </p>
        )}
      </div>

      <div className={styles.field}>
        <span id="budget-label" className={styles.label}>
          Pages to crawl
        </span>
        <BudgetPicker value={budget} onChange={setBudget} labelledBy="budget-label" />
      </div>

      <Button type="submit" variant="primary">
        Start crawl
      </Button>
    </form>
  );
}
