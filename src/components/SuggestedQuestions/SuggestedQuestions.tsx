import styles from './SuggestedQuestions.module.css';

interface SuggestedQuestionsProps {
  questions: string[];
  onPick: (question: string) => void;
}

export function SuggestedQuestions({ questions, onPick }: SuggestedQuestionsProps) {
  if (questions.length === 0) return null;
  return (
    <div className={styles.wrap}>
      <p id="suggestions-label" className={styles.label}>
        Try asking
      </p>
      <ul className={styles.list} aria-labelledby="suggestions-label">
        {questions.map((question) => (
          <li key={question}>
            <button type="button" className={styles.chip} onClick={() => onPick(question)}>
              {question}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
