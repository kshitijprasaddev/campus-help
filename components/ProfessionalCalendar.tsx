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
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatDayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dayKeyFromISO(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : formatDayKey(date);
}

function startOfWeek(date: Date) {
  const start = new Date(date);
  const day = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
}

function endOfWeek(date: Date) {
  const end = startOfWeek(date);
  end.setDate(end.getDate() + 6);
  return end;
}

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

function formatSlotTime(slot: AvailabilitySlot) {
  const start = new Date(slot.start);
  const end = new Date(slot.end);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Time TBD";
  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

function formatRate(cents: number | null | undefined) {
  if (typeof cents !== "number") return "Rate TBD";
  return `€${(cents / 100).toFixed(0)}/h`;
}

export default function ProfessionalCalendar() {
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [monthAnchor, setMonthAnchor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [tutorRes, slotRes] = await Promise.all([
          supabase.from("public_profiles").select("id, full_name, rate_cents, program, year").eq("is_listed", true).limit(100),
          supabase.from("tutor_availability").select("*").limit(300),
        ]);

        if (!active) return;

        const tutorList = (tutorRes.data as TutorProfile[]) || [];
        setTutors(tutorList);

        const normalized = (slotRes.data || []).map(normalizeAvailabilitySlot).filter(Boolean) as AvailabilitySlot[];
        const finalSlots = normalized.length > 0 ? normalized : generateFallbackSlots(tutorList.map(t => t.id));
        setSlots(finalSlots);

        // Auto-select first available day
        const today = formatDayKey(new Date());
        const futureDays = finalSlots
          .map(s => dayKeyFromISO(s.start))
          .filter((d): d is string => d !== null && d >= today);
        
        if (futureDays.length > 0) {
          setSelectedDay(futureDays[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const calendarDays = useMemo(() => getCalendarDays(monthAnchor), [monthAnchor]);
  
  const slotsByDay = useMemo(() => {
    const map: Record<string, AvailabilitySlot[]> = {};
    for (const slot of slots) {
      const key = dayKeyFromISO(slot.start);
      if (!key) continue;
      if (!map[key]) map[key] = [];
      map[key].push(slot);
    }
    return map;
  }, [slots]);

  const selectedSlots = useMemo(() => {
    if (!selectedDay) return [];
    return (slotsByDay[selectedDay] || []).sort((a, b) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    );
  }, [selectedDay, slotsByDay]);

  const emergencySlots = useMemo(() => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    return slots
      .filter(s => s.isEmergency && new Date(s.start).getTime() - now < oneHour * 2 && new Date(s.start).getTime() > now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 3);
  }, [slots]);

  const today = formatDayKey(new Date());

  function prevMonth() {
    setMonthAnchor(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }

  function nextMonth() {
    setMonthAnchor(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  function goToToday() {
    setMonthAnchor(new Date());
    setSelectedDay(today);
  }

  function getTutorById(id: string) {
    return tutors.find(t => t.id === id);
  }

  if (loading) {
    return (
      <section className="container py-16">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="h-96 rounded-2xl bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
          <div className="h-96 rounded-2xl bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section className="container py-16">
      {/* Section Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] mb-4">
          <svg className="w-4 h-4 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium text-[var(--text)]">Live Availability</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-3">
          Book your next session
        </h2>
        <p className="text-lg text-[var(--text-muted)] max-w-2xl">
          Browse real-time tutor availability. Click any highlighted day to see open slots and book instantly.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-lg">
            {/* Calendar Header */}
            <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold text-[var(--text)]">
                    {MONTH_NAMES[monthAnchor.getMonth()]} {monthAnchor.getFullYear()}
                  </h3>
                  <button 
                    onClick={goToToday}
                    className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[var(--primary)] text-white hover:opacity-90 transition-opacity"
                  >
                    Today
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={prevMonth}
                    className="p-2 rounded-lg hover:bg-[var(--border)] transition-colors"
                    aria-label="Previous month"
                  >
                    <svg className="w-5 h-5 text-[var(--text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={nextMonth}
                    className="p-2 rounded-lg hover:bg-[var(--border)] transition-colors"
                    aria-label="Next month"
                  >
                    <svg className="w-5 h-5 text-[var(--text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-[var(--border)]">
              {WEEKDAY_LABELS.map(day => (
                <div key={day} className="py-3 text-center text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((date, idx) => {
                const key = formatDayKey(date);
                const isCurrentMonth = date.getMonth() === monthAnchor.getMonth();
                const isToday = key === today;
                const isSelected = key === selectedDay;
                const isHovered = key === hoveredDay;
                const daySlots = slotsByDay[key] || [];
                const hasSlots = daySlots.length > 0;
                const hasEmergency = daySlots.some(s => s.isEmergency);
                const isPast = key < today;

                return (
                  <button
                    key={idx}
                    onClick={() => hasSlots && !isPast && setSelectedDay(key)}
                    onMouseEnter={() => setHoveredDay(key)}
                    onMouseLeave={() => setHoveredDay(null)}
                    disabled={!hasSlots || isPast}
                    className={`
                      relative aspect-square p-2 border-b border-r border-[var(--border)] transition-all duration-200
                      ${!isCurrentMonth ? 'bg-[var(--bg-tertiary)]' : 'bg-[var(--card)]'}
                      ${isPast ? 'opacity-40 cursor-not-allowed' : ''}
                      ${hasSlots && !isPast ? 'cursor-pointer hover:bg-[var(--surface)]' : ''}
                      ${isSelected ? 'bg-[var(--primary)]/10 ring-2 ring-[var(--primary)] ring-inset' : ''}
                      ${isHovered && hasSlots && !isPast && !isSelected ? 'bg-[var(--surface)]' : ''}
                    `}
                  >
                    <span className={`
                      text-sm font-medium
                      ${!isCurrentMonth ? 'text-[var(--text-muted)]/50' : 'text-[var(--text)]'}
                      ${isToday ? 'text-[var(--primary)] font-bold' : ''}
                      ${isSelected ? 'text-[var(--primary)] font-bold' : ''}
                    `}>
                      {date.getDate()}
                    </span>

                    {/* Today indicator */}
                    {isToday && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                    )}

                    {/* Slot indicators */}
                    {hasSlots && !isPast && (
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {daySlots.slice(0, 3).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-1.5 h-1.5 rounded-full ${hasEmergency && i === 0 ? 'bg-amber-500' : 'bg-[var(--primary)]'}`}
                          />
                        ))}
                        {daySlots.length > 3 && (
                          <span className="text-[8px] text-[var(--text-muted)] ml-0.5">+{daySlots.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--surface)] flex items-center gap-6 text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Emergency slot</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected slots */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)]">
              <h3 className="font-bold text-[var(--text)]">
                {selectedDay ? (
                  <>
                    {new Date(selectedDay + 'T00:00:00').toLocaleDateString(undefined, { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                    <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">
                      {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} available
                    </span>
                  </>
                ) : (
                  'Select a day'
                )}
              </h3>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto">
              {selectedSlots.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Click a highlighted day to see available slots</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedSlots.map(slot => {
                    const tutor = getTutorById(slot.tutorId);
                    return (
                      <Link
                        key={slot.id}
                        href={`/tutors?tutor=${slot.tutorId}&focus=${slot.id}`}
                        className="block p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)] hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors truncate">
                              {tutor?.full_name || 'Tutor'}
                            </div>
                            <div className="text-sm text-[var(--text-muted)] mt-1">
                              {formatSlotTime(slot)}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                slot.mode === 'online' 
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              }`}>
                                {slot.mode === 'online' ? '💻 Online' : '📍 In-person'}
                              </span>
                              {slot.isEmergency && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                  ⚡ Emergency
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-[var(--primary)]">
                              {formatRate(tutor?.rate_cents)}
                            </div>
                            <div className="text-xs text-[var(--text-muted)] mt-1">
                              {tutor?.program || 'Program'}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Emergency Tutoring */}
          {emergencySlots.length > 0 && (
            <div className="rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⚡</span>
                <h3 className="font-bold text-[var(--text)]">Need help now?</h3>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                These tutors can start within the next 2 hours
              </p>
              <div className="space-y-2">
                {emergencySlots.map(slot => {
                  const tutor = getTutorById(slot.tutorId);
                  return (
                    <Link
                      key={slot.id}
                      href={`/tutors?tutor=${slot.tutorId}&focus=${slot.id}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/80 dark:bg-white/10 border border-amber-200 dark:border-amber-500/30 hover:border-amber-400 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-[var(--text)]">{tutor?.full_name || 'Tutor'}</div>
                        <div className="text-xs text-[var(--text-muted)]">{formatSlotTime(slot)}</div>
                      </div>
                      <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                        Book now →
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-col gap-3">
            <Link href="/tutors" className="btn w-full justify-center">
              Browse All Tutors
            </Link>
            <Link href="/request/new" className="btn-ghost w-full justify-center">
              Post a Request Instead
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
