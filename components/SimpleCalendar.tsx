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
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dayKeyFromISO(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : formatDayKey(date);
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0
  
  const days: (Date | null)[] = [];
  
  // Empty slots before first day
  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }
  
  // Days of month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  
  return days;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function SimpleCalendar() {
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [tutorRes, slotRes] = await Promise.all([
          supabase.from("public_profiles").select("id, full_name, rate_cents").eq("is_listed", true).limit(100),
          supabase.from("tutor_availability").select("*").limit(300),
        ]);

        if (!active) return;

        const tutorList = (tutorRes.data as TutorProfile[]) || [];
        setTutors(tutorList);

        const normalized = (slotRes.data || []).map(normalizeAvailabilitySlot).filter(Boolean) as AvailabilitySlot[];
        const finalSlots = normalized.length > 0 ? normalized : generateFallbackSlots(tutorList.map(t => t.id));
        setSlots(finalSlots);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const calendarDays = useMemo(() => 
    getCalendarDays(currentMonth.getFullYear(), currentMonth.getMonth()), 
    [currentMonth]
  );

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

  const today = formatDayKey(new Date());

  const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const getTutor = (id: string) => tutors.find(t => t.id === id);

  if (loading) {
    return (
      <section className="container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="h-96 rounded-xl bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section className="container py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--text)] mb-2">
            Tutor Availability
          </h2>
          <p className="text-[var(--muted)]">
            Click a day to see available slots
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            {/* Month header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
              <button onClick={prevMonth} className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors">
                <svg className="w-5 h-5 text-[var(--text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="font-semibold text-[var(--text)]">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <button onClick={nextMonth} className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors">
                <svg className="w-5 h-5 text-[var(--text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-[var(--border)]">
              {DAYS.map(day => (
                <div key={day} className="py-2 text-center text-xs font-medium text-[var(--muted)] uppercase">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((date, i) => {
                if (!date) {
                  return <div key={`empty-${i}`} className="aspect-square border-b border-r border-[var(--border)] bg-[var(--bg-tertiary)]" />;
                }

                const key = formatDayKey(date);
                const isToday = key === today;
                const isSelected = key === selectedDay;
                const daySlots = slotsByDay[key] || [];
                const hasSlots = daySlots.length > 0;
                const isPast = key < today;

                return (
                  <button
                    key={key}
                    onClick={() => !isPast && setSelectedDay(isSelected ? null : key)}
                    disabled={isPast}
                    className={`
                      aspect-square border-b border-r border-[var(--border)] flex flex-col items-center justify-center gap-1 transition-colors
                      ${isPast ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-[var(--surface)]'}
                      ${isSelected ? 'bg-[var(--primary)] text-white' : ''}
                      ${isToday && !isSelected ? 'bg-[var(--primary)]/10' : ''}
                    `}
                  >
                    <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-[var(--text)]'}`}>
                      {date.getDate()}
                    </span>
                    {hasSlots && !isPast && (
                      <div className="flex gap-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[var(--primary)]'}`} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day slots */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
              <span className="font-semibold text-[var(--text)]">
                {selectedDay 
                  ? new Date(selectedDay).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
                  : 'Select a day'
                }
              </span>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto">
              {!selectedDay ? (
                <div className="text-center py-8 text-[var(--muted)]">
                  <p className="text-sm">Click a highlighted day to see available slots</p>
                </div>
              ) : selectedSlots.length === 0 ? (
                <div className="text-center py-8 text-[var(--muted)]">
                  <p className="text-sm">No slots available on this day</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedSlots.map(slot => {
                    const tutor = getTutor(slot.tutorId);
                    return (
                      <Link
                        key={slot.id}
                        href={`/tutors?tutor=${slot.tutorId}`}
                        className="block p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-[var(--text)]">
                              {tutor?.full_name || 'Tutor'}
                            </div>
                            <div className="text-sm text-[var(--muted)]">
                              {formatTime(slot.start)} - {formatTime(slot.end)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-[var(--primary)]">
                              €{((tutor?.rate_cents || 0) / 100).toFixed(0)}/h
                            </div>
                            <div className="text-xs text-[var(--muted)]">
                              {slot.mode === 'online' ? '💻 Online' : '📍 In-person'}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--surface)]">
              <Link href="/tutors" className="btn w-full text-center">
                View All Tutors
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
