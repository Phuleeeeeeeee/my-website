import type { ReactNode } from "react";

const paths = {
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  back: <path d="M19 12H5m6-6-6 6 6 6" />,
  user: <><circle cx="12" cy="8" r="3" /><path d="M5 20v-2a7 7 0 0 1 14 0v2Z" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" /></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  error: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6m0 3h.01" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  tasks: <><circle cx="12" cy="12" r="9" /><path d="m7 12 3 3 7-7" /></>,
  book: <><path d="M12 5v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2Z" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 11h18" /></>,
  edit: <><path d="m14 5 5 5M4 20l5-1L21 7l-5-5L4 14Z" /></>,
  trash: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  logout: <><path d="M10 4H4v16h6m4-13 5 5-5 5M8 12h12" /></>,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><rect x="9" y="2" width="6" height="4" rx="1" /><path d="M9 11h6m-6 4h6" /></>,
  bulb: <><path d="M9 18h6m-6 3h6M8 14a6 6 0 1 1 8 0l-1 2H9Z" /></>,
  inbox: <><path d="M3 4h18v16H3Z M3 14h5l2 3h4l2-3h5" /></>,
  hourglass: <><path d="M6 3h12M6 21h12M7 3v4l10 10v4M17 3v4L7 17v4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></>,
  award: <><circle cx="12" cy="9" r="6" /><path d="m8 14-1 8 5-3 5 3-1-8m-7-5 2 2 4-4" /></>,
  wifi: <><path d="m3 3 18 18M2 8a16 16 0 0 1 3-2m4-2a16 16 0 0 1 13 4M5 12a11 11 0 0 1 4-2m5 0a11 11 0 0 1 5 2M8 16a6 6 0 0 1 8 0m-4 4h.01" /></>,
  tune: <><path d="M3 6h18M3 12h18M3 18h18M7 3v6m10 0v6M9 15v6" /></>,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;

export function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>{paths[name]}</svg>;
}
