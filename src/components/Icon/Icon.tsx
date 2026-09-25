// The brief allows six hand-drawn inline icons and no icon library; this file is the
// whole set, so the budget is checkable in one place.
const PATHS = {
  send: 'M10 16V4M4.5 9.5 10 4l5.5 5.5',
  stop: 'M5.5 5.5h9v9h-9z',
  chevron: 'm5 7.5 5 5 5-5',
  info: 'M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15ZM10 9v5M10 6.25v.5',
  alert: 'M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15ZM10 6v5M10 13.75v.5',
  retry: 'M16.5 10a6.5 6.5 0 1 1-1.9-4.6M16.5 3.5v3.5H13',
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps {
  name: IconName;
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
