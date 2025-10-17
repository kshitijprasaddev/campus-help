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
  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/12 text-sm font-semibold text-white">
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
    if (status === 'closed') return 'bg-[#ff6b6b]/10 text-[#ff9a9a] border border-[#ff9a9a]/20';
    if (status === 'in_progress') return 'bg-[#00f5c8]/12 text-[#7dfce4] border border-[#7dfce4]/20';
    return 'bg-[var(--primary)]/12 text-[var(--primary)] border border-[var(--primary)]/28';
  }, [status]);

  return (
    <a href={`/request/${id}`} className="group block rounded-3xl border border-[var(--border)]/65 bg-[rgba(5,8,14,0.82)] p-5 transition-all hover:-translate-y-1 hover:border-[var(--primary)]/45 hover:bg-[rgba(9,14,22,0.9)] hover:shadow-[0_35px_90px_-55px_rgba(8,20,45,0.7)]">
      <div className="flex items-start gap-4">
        {avatarFromTitle(title)}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight text-white">{title}</h3>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-[0.2em] ${statusStyles}`}>{status}</span>
          </div>
          <p className="truncate text-sm text-white/60">{course}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/45">
            <time>{formatDate(created_at)}</time>
            {typeof budget_cents === 'number' && (
              <span className="rounded-full border border-[var(--border)]/40 bg-white/5 px-2.5 py-1 text-white/75">
                Minimum offer · €{(budget_cents / 100).toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mt-1 shrink-0 text-white/30 transition-opacity group-hover:text-white/70"
          aria-hidden
        >
          <path d="M8 5L16 12L8 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </a>
  );
}
