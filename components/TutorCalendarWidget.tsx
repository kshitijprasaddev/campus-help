"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  AvailabilitySlot,
  generateFallbackSlots,
  normalizeAvailabilitySlot,
} from "../lib/availability";

type TutorProfile = {
  id: string;
  full_name: string | null;
  rate_cents: number | null;
  program: string | null;
  year: string | null;
};

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatDayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dayKeyFromISO(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : formatDayKey(date);
}

function dateFromDayKey(key: string | null) {
  if (!key) return null;
  const [year, month, day] = key.split("-").map(Number);
  if ([year, month, day].some(v => Number.isNaN(v))) return null;
  return new Date(year, month - 1, day);
}

function startOfWeek(date: Date) {
  const start = new Date(date);
  const day = (start.getDay() + 6) % 7; // Monday as first day
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
}

function endOfWeek(date: Date) {
  const end = startOfWeek(date);
  end.setDate(end.getDate() + 6);
  return end;
}

// Build a month grid that always starts on Monday so full weeks render cleanly.
function getCalendarDays(monthAnchor: Date) {
  const firstOfMonth = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
  const lastOfMonth = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0);
  const start = startOfWeek(firstOfMonth);
  const end = endOfWeek(lastOfMonth);
  const days: Date[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function formatSlotRange(slot: AvailabilitySlot) {
  const start = new Date(slot.start);
  const end = new Date(slot.end);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Time TBD";
  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function pickInitialDay(slots: AvailabilitySlot[]) {
  if (slots.length === 0) return null;
  const sorted = [...slots].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );
  const now = Date.now();
  const upcoming = sorted.find(slot => new Date(slot.start).getTime() >= now);
  const target = upcoming ?? sorted[0];
  return dayKeyFromISO(target.start);
}

function formatRate(cents: number | null | undefined) {
  if (typeof cents !== "number") return "Rate TBD";
  return `â‚¬${(cents / 100).toFixed(0)}/h`;
}

export default function TutorCalendarWidget() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [{ data: tutorData, error: tutorError }, { data: slotData, error: slotError }] = await Promise.all([
          supabase
            .from("public_profiles")
            .select("id, full_name, program, year, rate_cents")
            .eq("is_listed", true)
            .limit(200),
          supabase.from("tutor_availability").select("*").limit(600),
        ]);

        if (!active) return;

        if (tutorError) throw tutorError;

        const tutorList = (tutorData as TutorProfile[]) || [];
        setTutors(tutorList);

        let normalised = (slotData || [])
          .map(normalizeAvailabilitySlot)
          .filter(Boolean) as AvailabilitySlot[];

        if (slotError || normalised.length === 0) {
          normalised = generateFallbackSlots(tutorList.map(t => t.id));
        }

        setSlots(normalised);

        const defaultDay = pickInitialDay(normalised);
        setSelectedDayKey(prev => prev ?? defaultDay);
        if (defaultDay) {
          const defaultDate = dateFromDayKey(defaultDay);
          if (defaultDate) {
            setCurrentMonth(prev => {
              if (
                prev.getFullYear() === defaultDate.getFullYear() &&
                prev.getMonth() === defaultDate.getMonth()
              ) {
                return prev;
              }
              return new Date(defaultDate.getFullYear(), defaultDate.getMonth(), 1);
            });
          }
        }
      } catch (err) {
        if (!active) return;
        console.error("Tutor calendar failed to load", err);
        setError("We couldn't load the tutor calendar right now.");
        const fallback = generateFallbackSlots([]);
        setSlots(fallback);
        setSelectedDayKey(prev => prev ?? pickInitialDay(fallback));
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const tutorMap = useMemo(() => {
    const map = new Map<string, TutorProfile>();
    tutors.forEach(tutor => map.set(tutor.id, tutor));
    return map;
  }, [tutors]);

  const slotsByDay = useMemo(() => {
    const groups = new Map<string, AvailabilitySlot[]>();
    slots.forEach(slot => {
      const key = dayKeyFromISO(slot.start);
      if (!key) return;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)?.push(slot);
    });
    return groups;
  }, [slots]);

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);
  const selectedSlots = useMemo(() => {
    if (!selectedDayKey) return [];
    return slotsByDay.get(selectedDayKey) ?? [];
  }, [selectedDayKey, slotsByDay]);
  const selectedDate = dateFromDayKey(selectedDayKey);
  const todayKey = useMemo(() => formatDayKey(new Date()), []);

  const upcomingEmergency = useMemo(() => {
    const future = slots
      .filter(slot => slot.isEmergency)
      .map(slot => ({ slot, ts: new Date(slot.start).getTime() }))
      .filter(item => !Number.isNaN(item.ts) && item.ts >= Date.now())
      .sort((a, b) => a.ts - b.ts);
    if (future.length === 0) return null;
    const candidate = future[0].slot;
    return {
      slot: candidate,
      tutor: tutorMap.get(candidate.tutorId) ?? null,
    };
  }, [slots, tutorMap]);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: "long",
        year: "numeric",
      }).format(currentMonth),
    [currentMonth]
  );

  const renderDayButton = (day: Date, options?: { keySuffix?: string; className?: string }) => {
    const key = formatDayKey(day);
    const suffix = options?.keySuffix ?? "calendar";
    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
    const slotsForDay = slotsByDay.get(key) ?? [];
    const isSelected = key === selectedDayKey;
    const hasSlots = slotsForDay.length > 0;
    const hasEmergency = slotsForDay.some(slot => slot.isEmergency);
    const isToday = key === todayKey;
    const weekdayLabel = WEEKDAY_LABELS[(day.getDay() + 6) % 7];

    const buttonClasses = [
      "group relative flex min-h-[6rem] sm:min-h-[7.5rem] flex-col justify-between rounded-2xl border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-[rgba(8,12,22,0.95)]",
      isSelected
        ? "border-[var(--primary)]/70 bg-[var(--bg-secondary)] shadow-[0_30px_120px_-80px_rgba(30,120,255,0.75)]"
        : hasSlots
        ? "border-[var(--border)] bg-[var(--bg-tertiary)] hover:border-[var(--primary)]/50 hover:bg-white/[0.12]"
        : "border-[var(--border)]/30 bg-[var(--bg-tertiary)] hover:border-[var(--primary)]/40 hover:bg-[var(--bg-tertiary)]",
      isCurrentMonth ? "text-[var(--text)]" : "text-[var(--text-muted)]",
      options?.className ?? "",
    ].join(" ");

    return (
      <button
        key={`${key}-${suffix}`}
        type="button"
        onClick={() => handleSelectDay(key)}
        className={buttonClasses}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className={`block text-lg leading-none ${isToday ? "font-semibold text-[var(--text)]" : ""}`}>{day.getDate()}</span>
            <span className="mt-2 block text-[11px] uppercase tracking-[0.32em] text-[var(--text-muted)]">{weekdayLabel}</span>
          </div>
          <div className="flex flex-col items-end gap-1 text-[10px] uppercase tracking-[0.3em]">
            {isToday && (
              <span className="rounded-full bg-[var(--primary)]/20 px-2 py-0.5 text-[var(--primary)]">
                Today
              </span>
            )}
            {hasEmergency && (
              <span className="rounded-full bg-[#f87171]/22 px-2 py-0.5 text-[#fecaca]">Rush</span>
            )}
          </div>
        </div>
        <div className={`text-[11px] ${hasSlots ? "text-[var(--text-muted)]" : "text-[var(--text-muted)]"}`}>
          {hasSlots ? `${slotsForDay.length} ${slotsForDay.length === 1 ? "slot" : "slots"}` : "No slots"}
        </div>
      </button>
    );
  };

  function goToAdjacentMonth(delta: number) {
    setCurrentMonth(prev => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + delta);
      return new Date(next.getFullYear(), next.getMonth(), 1);
    });
  }

  function goToToday() {
    const now = new Date();
    const key = formatDayKey(now);
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDayKey(key);
  }

  function handleSelectDay(key: string) {
    setSelectedDayKey(key);
    const date = dateFromDayKey(key);
    if (date) {
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }

  function handleBook(slot: AvailabilitySlot) {
    const params = new URLSearchParams({ tutor: slot.tutorId, focus: slot.id });
    window.location.href = `/tutors?${params.toString()}`;
  }

  return (
    <section className="container">
      <div className="grid gap-5 lg:grid-cols-[1.05fr_1.25fr]">
        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--card)] p-6 md:p-8 shadow-[0_40px_140px_-110px_rgba(8,16,45,0.95)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="tag">Tutor calendar</div>
              <h3 className="mt-3 text-2xl font-semibold text-[var(--text)]">Plan ahead with live availability.</h3>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-1 text-xs text-[var(--text-muted)]">
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition hover:text-[var(--primary)]"
                onClick={() => goToAdjacentMonth(-1)}
                aria-label="Previous month"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M15 5L8 12L15 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className="min-w-[120px] text-center text-[var(--text-muted)]">{monthLabel}</span>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition hover:text-[var(--primary)]"
                onClick={() => goToAdjacentMonth(1)}
                aria-label="Next month"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                className="ml-1 rounded-full border border-[var(--border)] px-3 py-1 text-[var(--text-muted)] transition hover:text-[var(--primary)]"
                onClick={goToToday}
              >
                Today
              </button>
            </div>
          </div>

          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Choose any highlighted day to jump straight into the times tutors already confirmed. Bookings send a request instantly - no email chains.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/tutors" className="btn-ghost">Browse all tutors</Link>
            <Link href="/request/new" className="btn-ghost">Post a request</Link>
          </div>

          {loading ? (
            <div className="mt-6 animate-pulse space-y-4">
              <div className="h-12 rounded-3xl bg-[var(--bg-tertiary)]" />
              <div className="h-40 rounded-3xl bg-[var(--bg-tertiary)]" />
              <div className="h-24 rounded-3xl bg-[var(--bg-tertiary)]" />
            </div>
          ) : (
            <>
              {error && (
                <div className="mt-6 rounded-3xl border border-[#f87171]/30 bg-[#f87171]/10 p-4 text-sm text-[#fecaca]">
                  {error} Showing sample availability so you can keep planning.
                </div>
              )}

              <div className="mt-6 space-y-3">
                <div className="flex gap-3 overflow-x-auto pb-2 sm:hidden snap-x snap-mandatory">
                  {calendarDays.map(day =>
                    renderDayButton(day, {
                      keySuffix: "scroll",
                      className: "min-h-[5.2rem] w-[5.75rem] flex-shrink-0 snap-start",
                    })
                  )}
                </div>
                <div className="hidden sm:grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {calendarDays.map(day => renderDayButton(day, { keySuffix: "grid" }))}
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-5">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <div className="uppercase tracking-[0.3em]">
                    {selectedDate
                      ? new Intl.DateTimeFormat(undefined, {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        }).format(selectedDate)
                      : "Select a day"}
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <span className="inline-flex h-2 w-2 rounded-full bg-[var(--primary)]" />
                    <span>Live tutor availability</span>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {selectedSlots.length === 0 ? (
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4 text-sm text-[var(--text-muted)]">
                      Pick any highlighted day to see the exact times tutors opened.
                    </div>
                  ) : (
                    <div className="relative space-y-4 pl-0 md:pl-8">
                      <div className="pointer-events-none absolute left-3 top-1 bottom-1 hidden md:block w-px bg-white/12" aria-hidden />
                      {selectedSlots
                        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                        .map(slot => {
                          const tutor = tutorMap.get(slot.tutorId);
                          const slotRange = formatSlotRange(slot);
                          return (
                            <div
                              key={slot.id}
                              className="relative flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4 text-sm text-[var(--text-muted)] shadow-[0_24px_90px_-80px_rgba(20,40,90,0.9)] md:flex-row md:flex-wrap md:items-start"
                            >
                              <span className="absolute left-[-11px] top-5 hidden md:inline-flex h-2.5 w-2.5 rounded-full bg-[var(--primary)] ring-4 ring-[var(--primary)]/20" aria-hidden />
                              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] md:block md:min-w-[96px]">
                                <div className="font-semibold text-[var(--text)]">{slotRange}</div>
                                <div className="mt-1 uppercase tracking-[0.3em]">
                                  {slot.mode === "in-person" ? "In person" : "Online"}
                                </div>
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="text-sm font-medium text-[var(--text)]">
                                  {tutor?.full_name ?? "Tutor available"}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                                  {tutor?.program && <span>{tutor.program}</span>}
                                  {tutor?.year && <span>Year {tutor.year}</span>}
                                  {tutor && <span>{formatRate(tutor.rate_cents)}</span>}
                                  {slot.isEmergency && (
                                    <span className="rounded-full bg-[#f87171]/18 px-2 py-0.5 text-[#fda4a4] uppercase tracking-[0.3em]">
                                      Priority
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn text-sm md:self-center"
                                onClick={() => handleBook(slot)}
                              >
                                Book
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="rounded-[32px] border border-[#f87171]/35 bg-[rgba(46,12,27,0.35)] p-6 md:p-8 shadow-[0_35px_130px_-120px_rgba(120,30,60,0.7)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f87171]/45 bg-[#f87171]/18 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[#fecaca]">
            Emergency tutoring
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-[var(--text)]">Need help in the next hour?</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Tutors who enable &quot;priority mode&quot; appear here. Choose a slot and we&apos;ll alert them instantly. You&apos;ll get a confirmation ping on your dashboard.
          </p>

          {loading ? (
            <div className="mt-6 space-y-4">
              {Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="h-24 animate-pulse rounded-3xl bg-[var(--bg-tertiary)]" />
              ))}
            </div>
          ) : upcomingEmergency ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-white/15 bg-[rgba(15,6,18,0.8)] p-5 text-sm text-[var(--text-muted)]">
                <div className="flex items-center justify-between text-[var(--text-muted)]">
                  <span>{new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(new Date(upcomingEmergency.slot.start))}</span>
                  <span>
                    {new Intl.DateTimeFormat(undefined, {
                      month: "short",
                      day: "numeric",
                    }).format(new Date(upcomingEmergency.slot.start))}
                  </span>
                </div>
                <div className="mt-3 text-lg font-semibold text-[var(--text)]">
                  {formatSlotRange(upcomingEmergency.slot)}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                  {upcomingEmergency.tutor?.full_name && <span>{upcomingEmergency.tutor.full_name}</span>}
                  <span>{upcomingEmergency.slot.mode === "in-person" ? "In person" : "Online"}</span>
                  {upcomingEmergency.tutor && <span>{formatRate(upcomingEmergency.tutor.rate_cents)}</span>}
                </div>
                <button
                  type="button"
                  className="btn mt-4 w-full bg-[#f87171] text-[var(--text)] hover:bg-[#fb7185]"
                  onClick={() => handleBook(upcomingEmergency.slot)}
                >
                  Connect now
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-white/15 bg-[rgba(15,6,18,0.8)] p-5 text-sm text-[var(--text-muted)]">
              No tutors marked themselves available in the next hour, but new slots pop up often. Check the calendar or refresh shortly.
            </div>
          )}

          <p className="mt-5 text-xs text-[#fecaca]/80">
            Emergency bookings ping tutors who opted in for short-notice sessions. If no one responds within 10 minutes, we&apos;ll show nearby availability instead.
          </p>
        </div>
      </div>
    </section>
  );
}
