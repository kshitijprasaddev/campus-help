'use client';
import { useMemo } from 'react';

export type RequestCardProps = {
  id: string;
  title: string;
  course: string;
  budget_cents: number | null;
  created_at: string;
  status: string;
};

function avatarFromTitle(title: string) {
  const letter = title.trim()[0]?.toUpperCase() || 'S';
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-thi-blue/10 dark:bg-[var(--primary)]/20 text-sm font-semibold text-thi-blue dark:text-[var(--primary)]">
      {letter}
    </div>
  );
}

function formatDate(value: string) {
  try {
    const date = new Date(value);
    return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return value;
  }
}

export default function RequestCard({ id, title, course, budget_cents, created_at, status }: RequestCardProps) {
  const statusStyles = useMemo(() => {
    if (status === 'closed') return 'bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20';
    if (status === 'in_progress') return 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20';
    return 'bg-thi-blue/10 dark:bg-[var(--primary)]/10 text-thi-blue dark:text-[var(--primary)] border border-thi-blue/20 dark:border-[var(--primary)]/20';
  }, [status]);

  return (
    <a href={`/request/${id}`} className="card group block p-5 transition-all hover:-translate-y-1 hover:border-thi-blue/40 dark:hover:border-[var(--primary)]/40">
      <div className="flex items-start gap-4">
        {avatarFromTitle(title)}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">{title}</h3>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-[0.2em] ${statusStyles}`}>{status}</span>
          </div>
          <p className="truncate text-sm text-[var(--text-muted)]">{course}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
            <time>{formatDate(created_at)}</time>
            {typeof budget_cents === 'number' && (
              <span className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-2.5 py-1">
                Min offer · €{(budget_cents / 100).toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className="mt-1 shrink-0 text-[var(--text-muted)] opacity-50 group-hover:opacity-100 transition-opacity"
          aria-hidden
        >
          <path d="M8 5L16 12L8 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </a>
  );
}
