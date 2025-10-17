"use client";

import { useMemo } from "react";
import type { AvailabilitySlot } from "../lib/availability";

type TutorAvailabilityProps = {
  slots: AvailabilitySlot[];
  onBook(slot: AvailabilitySlot): void;
};

function toDayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatDayLabel(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formatted = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);

  if (date.getTime() === today.getTime()) return `Today · ${formatted}`;
  if (date.getTime() === tomorrow.getTime()) return `Tomorrow · ${formatted}`;
  return formatted;
}

function formatTimeRange(startISO: string, endISO: string) {
  const startDate = new Date(startISO);
  const endDate = new Date(endISO);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return "Time TBD";
  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${formatter.format(startDate)} – ${formatter.format(endDate)}`;
}

export default function TutorAvailability({ slots, onBook }: TutorAvailabilityProps) {
  const grouped = useMemo(() => {
    const sorted = [...slots].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    const buckets = new Map<string, { label: string; date: Date; items: AvailabilitySlot[] }>();

    for (const slot of sorted) {
      const startDate = new Date(slot.start);
      if (Number.isNaN(startDate.getTime())) continue;
      const key = toDayKey(startDate);
      if (!buckets.has(key)) {
        buckets.set(key, { label: formatDayLabel(startDate), date: startDate, items: [slot] });
      } else {
        buckets.get(key)?.items.push(slot);
      }
    }

    return [...buckets.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [slots]);

  if (grouped.length === 0) {
    return (
      <div className="rounded-3xl border border-[var(--border)]/60 bg-white/[0.04] p-6 text-sm text-white/60">
        This tutor hasn’t published availability yet. Ask them for a time when you submit your request, or toggle the emergency button to see who’s free now.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map(group => (
        <div key={group.label} className="rounded-3xl border border-[var(--border)]/60 bg-white/[0.03] p-5 shadow-[0_30px_90px_-80px_rgba(8,20,40,0.9)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-white/45">{group.label}</div>
            {group.items.some(slot => slot.isEmergency) && (
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f87171]/40 bg-[#f87171]/15 px-3 py-1 text-xs font-medium text-[#fda4a4]">
                Priority slots available
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {group.items.map(slot => (
              <button
                key={slot.id}
                type="button"
                onClick={() => onBook(slot)}
                className={`group rounded-2xl border border-[var(--border)]/60 bg-white/[0.04] p-4 text-left text-sm text-white/75 transition hover:-translate-y-0.5 hover:border-[var(--primary)]/40 hover:bg-white/[0.08] hover:text-white ${slot.isEmergency ? 'ring-1 ring-[#f87171]/50' : ''}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-white">{formatTimeRange(slot.start, slot.end)}</div>
                  <div className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.3em] text-white/50">
                    {slot.mode === 'in-person' ? 'In person' : 'Online'}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-white/45">
                  <span>Seats: 1</span>
                  {slot.isEmergency ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f87171]/15 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.3em] text-[#fca5a5]">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#fda4a4]" /> Emergency
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-white/35">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" /> Open
                    </span>
                  )}
                </div>
                <div className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[var(--primary)]/80">
                  <span className="transition group-hover:translate-x-1">Book slot</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="opacity-60 transition group-hover:opacity-100"
                    aria-hidden
                  >
                    <path d="M8 5L16 12L8 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
