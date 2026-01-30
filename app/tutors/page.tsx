'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import TutorAvailability from '../../components/TutorAvailability';
import { AvailabilitySlot, generateFallbackSlots, normalizeAvailabilitySlot } from '../../lib/availability';
import Toast from '../../components/Toast';
import { supabase } from '../../lib/supabaseClient';

type TutorProfile = {
  id: string;
  full_name: string | null;
  program: string | null;
  year: string | null;
  courses: string[] | null;
  rate_cents: number | null;
  bio?: string | null;
};

type BookingDraft = {
  tutor: TutorProfile;
  slot: AvailabilitySlot;
};

function formatCurrency(value: number | null | undefined) {
  if (typeof value !== 'number') return 'Set your rate';
  return `€${(value / 100).toFixed(2)}/h`;
}

function extractTopCourses(courses: string[] | null | undefined) {
  if (!courses || courses.length === 0) return 'No courses listed yet';
  return courses.slice(0, 3).join(', ');
}

function TutorsPageInner() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [booking, setBooking] = useState<BookingDraft | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [pendingFocusSlot, setPendingFocusSlot] = useState<string | null>(null);
  const paramsHydratedRef = useRef(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [{ data: tutorData, error: tutorError }, { data: slotData, error: slotError }] = await Promise.all([
          supabase.from('public_profiles').select('*').eq('is_listed', true).limit(200),
          supabase.from('tutor_availability').select('*').limit(400),
        ]);

        if (!active) return;

        if (tutorError) throw tutorError;

        const tutorList = (tutorData as TutorProfile[]) || [];
        setTutors(tutorList);

        const normalisedSlots = (slotData || [])
          .map(normalizeAvailabilitySlot)
          .filter(Boolean) as AvailabilitySlot[];

        if (slotError || normalisedSlots.length === 0) {
          setSlots(generateFallbackSlots(tutorList.map(t => t.id)));
        } else {
          setSlots(normalisedSlots);
        }

        setSelectedTutorId(prev => prev ?? (tutorList[0]?.id ?? null));
      } catch (err: unknown) {
        if (!active) return;
        console.error('Tutor directory load failed:', err);
        setError('We had trouble loading tutors. Refresh the page or try again soon.');
        setTutors([]);
        setSlots(generateFallbackSlots([]));
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (paramsHydratedRef.current) return;
    const tutorParam = searchParams?.get('tutor');
    const slotParam = searchParams?.get('focus');
    if (tutorParam) setSelectedTutorId(tutorParam);
    if (slotParam) setPendingFocusSlot(slotParam);
    if (tutorParam || slotParam) paramsHydratedRef.current = true;
  }, [searchParams]);

  useEffect(() => {
    if (!toast) return;
    const handle = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(handle);
  }, [toast]);

  const filteredTutors = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return tutors;
    return tutors.filter(tutor => {
      const haystack = [
        tutor.full_name,
        tutor.program,
        tutor.year,
        ...(tutor.courses || []),
        tutor.bio,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [tutors, query]);

  useEffect(() => {
    if (!selectedTutorId && filteredTutors.length > 0) {
      setSelectedTutorId(filteredTutors[0].id);
    }
  }, [filteredTutors, selectedTutorId]);

  const upcomingEmergency = useMemo(() => {
    const futureEmergency = slots
      .filter(slot => slot.isEmergency)
      .map(slot => ({ slot, start: new Date(slot.start).getTime() }))
      .filter(item => !Number.isNaN(item.start) && item.start >= Date.now())
      .sort((a, b) => a.start - b.start);
    if (futureEmergency.length === 0) return null;
    const candidate = futureEmergency[0].slot;
    const tutor = tutors.find(t => t.id === candidate.tutorId) || null;
    return tutor ? { tutor, slot: candidate } : null;
  }, [slots, tutors]);

  const visibleSlots = useMemo(() => {
    if (!selectedTutorId) return [];
    return slots.filter(slot => slot.tutorId === selectedTutorId);
  }, [slots, selectedTutorId]);

  useEffect(() => {
    if (!pendingFocusSlot) return;
    const slot = slots.find(s => s.id === pendingFocusSlot);
    if (!slot) return;
    const tutor = tutors.find(t => t.id === slot.tutorId);
    if (!tutor) return;
    setSelectedTutorId(slot.tutorId);
    setPendingFocusSlot(null);
    openBooking(slot, tutor);
  }, [pendingFocusSlot, slots, tutors]);

  function openBooking(slot: AvailabilitySlot, tutor: TutorProfile) {
    setBooking({ tutor, slot });
  }

  function handleBook(slot: AvailabilitySlot) {
    const tutor = tutors.find(t => t.id === slot.tutorId);
    if (!tutor) return;
    openBooking(slot, tutor);
  }

  async function confirmBooking() {
    if (!booking) return;
    
    try {
      // Check if user is logged in
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setToast({ msg: 'Please sign in to book a session. Redirecting...', type: 'error' });
        setBooking(null);
        setTimeout(() => {
          window.location.href = '/signin';
        }, 1500);
        return;
      }

      // Don't allow booking yourself
      if (userData.user.id === booking.tutor.id) {
        setToast({ msg: 'You cannot book a session with yourself!', type: 'error' });
        setBooking(null);
        return;
      }

      // Create the booking in the database
      const { error: bookingError } = await supabase.from('bookings').insert({
        student_id: userData.user.id,
        tutor_id: booking.tutor.id,
        availability_id: booking.slot.id.includes('-') ? null : booking.slot.id, // Handle fallback IDs
        scheduled_start: booking.slot.start,
        scheduled_end: booking.slot.end,
        mode: booking.slot.mode,
        status: 'pending',
      });

      if (bookingError) {
        console.error('Booking failed:', bookingError);
        // Check if it's a table not found error
        if (bookingError.message?.includes('relation') || bookingError.code === '42P01') {
          setToast({ msg: 'Bookings system not set up yet. Please run the schema.sql file.', type: 'error' });
        } else {
          setToast({ msg: 'Could not complete booking. Please try again.', type: 'error' });
        }
        return;
      }

      setToast({ msg: 'Session booked! The tutor will confirm shortly.', type: 'success' });
      setBooking(null);
    } catch (err) {
      console.error('Booking error:', err);
      setToast({ msg: 'Something went wrong. Please try again.', type: 'error' });
    }
  }

  const selectedTutor = tutors.find(t => t.id === selectedTutorId) || null;

  return (
    <div className="container space-y-8">
      <header className="grid gap-6 rounded-[40px] border border-[var(--border)]/60 bg-[rgba(8,12,22,0.92)] p-8 shadow-[0_35px_110px_-85px_rgba(3,16,45,0.9)] lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <div className="tag">Find tutors</div>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">Plan sessions with campus-approved tutors.</h1>
          <p className="text-sm text-white/65 md:text-base">
            Explore tutors by program, browse their availability, and lock a slot without endless chats. Every profile is verified with a university email before it appears here.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/request/new" className="btn">Post a request</Link>
            <Link href="/dashboard" className="btn-ghost">Open dashboard</Link>
          </div>
        </div>
        <div className="rounded-3xl border border-[var(--border)]/60 bg-white/[0.04] p-5">
          <label className="text-xs uppercase tracking-[0.3em] text-white/40">Search tutors</label>
          <input
            className="input mt-3"
            placeholder="Search by name, course, or program"
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
          <p className="mt-3 text-xs text-white/40">Results update instantly on your device.</p>
        </div>
      </header>

      {upcomingEmergency && (
        <div className="rounded-[32px] border border-[#f87171]/40 bg-[rgba(46,12,27,0.35)] p-6 md:p-7">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f87171]/50 bg-[#f87171]/20 px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-[#fecaca]">
                Emergency tutoring
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-white">{upcomingEmergency.tutor.full_name || 'Available tutor'} can jump in within the hour.</h2>
              <p className="mt-2 text-sm text-white/70">
                Next open window starts at {new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(upcomingEmergency.slot.start))} ({upcomingEmergency.slot.mode === 'in-person' ? 'in person' : 'online'}).
              </p>
            </div>
            <button
              type="button"
              className="btn bg-[#f87171] text-white hover:bg-[#fb7185]"
              onClick={() => {
                setSelectedTutorId(upcomingEmergency.tutor.id);
                openBooking(upcomingEmergency.slot, upcomingEmergency.tutor);
              }}
            >
              Connect now
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="card skeleton h-32" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-[28px] border border-[#f87171]/35 bg-[rgba(46,12,27,0.4)] p-6 text-sm text-[#fca5a5]">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <aside className="space-y-4">
            <div className="text-xs uppercase tracking-[0.3em] text-white/35">Tutors ({filteredTutors.length})</div>
            <div className="grid gap-4">
              {filteredTutors.length === 0 && (
                <div className="rounded-3xl border border-[var(--border)]/60 bg-white/[0.04] p-6 text-sm text-white/60">
                  No tutors match that search yet. Try another course keyword or clear the filter.
                </div>
              )}
              {filteredTutors.map(tutor => {
                const isActive = tutor.id === selectedTutorId;
                return (
                  <button
                    type="button"
                    key={tutor.id}
                    onClick={() => setSelectedTutorId(tutor.id)}
                    className={`rounded-3xl border p-5 text-left transition ${
                      isActive
                        ? 'border-[var(--primary)]/60 bg-[rgba(8,16,30,0.95)] shadow-[0_26px_80px_-70px_rgba(20,100,255,0.8)]'
                        : 'border-[var(--border)]/60 bg-[rgba(8,12,22,0.85)] hover:-translate-y-0.5 hover:border-[var(--primary)]/35'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-lg font-semibold text-white">{tutor.full_name || 'Campus tutor'}</div>
                      <div className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/45">
                        {formatCurrency(tutor.rate_cents)}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-white/60">
                      {tutor.program || 'Program not listed'}{tutor.year ? ` · Year ${tutor.year}` : ''}
                    </div>
                    <div className="mt-3 text-xs text-white/45">
                      <span className="text-white/35 uppercase tracking-[0.3em]">Focus:</span> {extractTopCourses(tutor.courses)}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-white/35">Availability</div>
                <h2 className="text-2xl font-semibold text-white">
                  {selectedTutor?.full_name || 'Select a tutor'}
                </h2>
                {selectedTutor?.program && (
                  <p className="text-sm text-white/55">{selectedTutor.program}{selectedTutor.year ? ` · Year ${selectedTutor.year}` : ''}</p>
                )}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)]/60 bg-white/[0.04] px-4 py-1.5 text-xs text-white/55">
                <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                Updated live
              </div>
            </div>

            <TutorAvailability slots={visibleSlots} onBook={handleBook} />
          </section>
        </div>
      )}

      {booking && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
          <div className="w-full max-w-lg space-y-4 rounded-3xl border border-[var(--border)]/80 bg-[rgba(6,10,20,0.96)] p-6 shadow-[0_45px_160px_-100px_rgba(4,12,28,1)]">
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.32em] text-white/35">Confirm booking</div>
              <h3 className="text-2xl font-semibold text-white">{booking.tutor.full_name || 'Tutor'}</h3>
              <p className="text-sm text-white/60">
                {new Intl.DateTimeFormat(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                }).format(new Date(booking.slot.start))}
                {' '}· {booking.slot.mode === 'in-person' ? 'In person' : 'Online'}
              </p>
            </div>
            <p className="rounded-2xl border border-[var(--border)]/60 bg-white/[0.04] p-4 text-sm text-white/65">
              We’ll notify the tutor instantly. They’ll confirm or suggest a new time via your dashboard. You can always adjust details from your request page.
            </p>
            <div className="flex flex-wrap justify-end gap-3">
              <button type="button" className="btn-ghost" onClick={() => setBooking(null)}>Cancel</button>
              <button type="button" className="btn" onClick={confirmBooking}>Send booking request</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

export default function TutorsPage() {
  return (
    <Suspense fallback={<div className="container py-16 text-center text-white/60">Loading tutors…</div>}>
      <TutorsPageInner />
    </Suspense>
  );
}
