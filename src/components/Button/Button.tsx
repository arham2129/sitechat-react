import { forwardRef, type ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'text';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Square icon-only button; the caller must pass aria-label. */
  iconOnly?: boolean;
}

// forwardRef so callers can manage focus (the composer returns focus after Stop).
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', iconOnly = false, className, type = 'button', ...rest },
  ref,
) {
  const classes = [styles.button, styles[variant], iconOnly && styles.iconOnly, className].filter(Boolean).join(' ');
  return <button ref={ref} type={type} className={classes} {...rest} />;
});
