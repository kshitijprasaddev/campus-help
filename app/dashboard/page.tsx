'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

type Req = { id: string; title: string; course: string; status: string; created_at: string };
type Booking = {
  id: string;
  scheduled_start: string;
  scheduled_end: string;
  mode: string;
  status: string;
  tutor_id: string;
  student_id: string;
  tutor_name?: string;
  student_name?: string;
};

export default function DashboardPage() {
  const [userId, setUserId] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [myRequests, setMyRequests] = useState<Req[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setError(null);
      try {
        const { data: userResult } = await supabase.auth.getUser();
        const user = userResult.user;
        if (!user) {
          location.href = '/signin';
          return;
        }

        if (!mounted) return;

        setUserId(user.id);
        setEmail(user.email || '');

        // Load requests
        const { data: reqs, error: reqError } = await supabase
            .from('requests')
            .select('id,title,course,status,created_at')
            .eq('author_id', user.id)
            .order('created_at', { ascending: false })
            .limit(12);

        if (!mounted) return;

        if (reqError) {
          setError('Unable to load your requests right now.');
          setMyRequests([]);
        } else {
          setMyRequests((reqs as Req[]) || []);
        }

        // Load bookings (as student or tutor)
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .or(`student_id.eq.${user.id},tutor_id.eq.${user.id}`)
          .order('scheduled_start', { ascending: true })
          .limit(20);

        if (!bookingsError && bookingsData) {
          // Fetch tutor/student names
          const userIds = [...new Set(bookingsData.flatMap(b => [b.tutor_id, b.student_id]))];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);

          const nameMap = new Map((profiles || []).map(p => [p.id, p.full_name]));
          
          const enrichedBookings = bookingsData.map(b => ({
            ...b,
            tutor_name: nameMap.get(b.tutor_id) || 'Unknown Tutor',
            student_name: nameMap.get(b.student_id) || 'Unknown Student',
          }));
          
          setMyBookings(enrichedBookings);
        }
      } catch (err) {
        if (mounted) {
          console.error('Dashboard load failed', err);
          setError('Something went wrong while loading your dashboard.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const openRequests = useMemo(() => myRequests.filter(r => r.status !== 'closed').length, [myRequests]);
  const closedRequests = myRequests.length - openRequests;
  const upcomingBookings = useMemo(() => 
    myBookings.filter(b => b.status !== 'cancelled' && new Date(b.scheduled_start) >= new Date()), 
    [myBookings]
  );

  const formatBookingTime = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString()} · ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const handleBookingAction = async (bookingId: string, newStatus: 'confirmed' | 'cancelled') => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', bookingId);
    
    if (!error) {
      setMyBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    }
  };

  return (
    <div className="container space-y-8">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="tag">Signed in as</div>
              <h1 className="mt-2 text-2xl font-semibold">{email || '—'}</h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Keep track of your open requests, bids, and replies from classmates in one workspace.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link className="btn" href="/request/new">Post a request</Link>
            <Link className="btn-ghost" href="/my">My items</Link>
            <Link className="btn-ghost" href="/tutors">Browse tutors</Link>
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="tag">Snapshot</div>
              <h2 className="mt-2 text-lg font-semibold">Request performance</h2>
            </div>
            <Link href="/request/new" className="btn-ghost text-xs">Create new</Link>
          </div>
          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-5 py-4">
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Open requests</div>
              <div className="mt-2 text-2xl font-semibold">{openRequests}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-5 py-4">
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Closed requests</div>
              <div className="mt-2 text-2xl font-semibold">{closedRequests}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold">My recent requests</h2>
          <Link href="/my" className="btn-ghost text-sm">View all activity</Link>
        </div>

        {loading && (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="card skeleton h-24" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="card border border-[#f87171]/40 bg-[rgba(46,12,27,0.4)] p-5 text-sm text-[#fca5a5]">
            {error}
          </div>
        )}

        {!loading && !error && myRequests.length === 0 && (
          <div className="card p-6 text-sm text-[var(--text-muted)]">
            You haven’t posted any requests yet. Start by creating one for your toughest course.
          </div>
        )}

        {!loading && !error && myRequests.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {myRequests.map(req => (
              <Link
                key={req.id}
                href={`/request/${req.id}`}
                className="card group p-5 transition-all hover:-translate-y-1 hover:border-thi-blue/40 dark:hover:border-[var(--primary)]/40"
              >
                <div className="flex items-center justify-between">
                  <div className="text-base font-semibold">
                    {req.title} <span className="text-[var(--text-muted)]">· {req.course}</span>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium uppercase tracking-[0.25em] ${req.status === 'closed' ? 'bg-red-500/10 text-red-500 dark:text-red-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>
                    {req.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-[var(--text-muted)]">{new Date(req.created_at).toLocaleString()}</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bookings Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold">My Sessions</h2>
          <Link href="/tutors" className="btn-ghost text-sm">Book a tutor</Link>
        </div>

        {!loading && upcomingBookings.length === 0 && (
          <div className="card p-6 text-sm text-[var(--text-muted)]">
            No upcoming sessions. Browse tutors to book your first session!
          </div>
        )}

        {!loading && upcomingBookings.length > 0 && (
          <div className="grid gap-4">
            {upcomingBookings.map(booking => {
              const isTutor = booking.tutor_id === userId;
              const otherPerson = isTutor ? booking.student_name : booking.tutor_name;
              const roleLabel = isTutor ? 'Student' : 'Tutor';
              
              return (
                <div
                  key={booking.id}
                  className="card p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold">{otherPerson}</span>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium uppercase tracking-[0.25em] ${
                          booking.status === 'confirmed' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                          booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                          'bg-red-500/10 text-red-500 dark:text-red-400'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-[var(--text-muted)]">{roleLabel}</div>
                      <div className="mt-2 text-sm text-[var(--text-muted)]">
                        {formatBookingTime(booking.scheduled_start, booking.scheduled_end)}
                      </div>
                      <div className="mt-1 text-xs text-[var(--text-muted)] uppercase tracking-wider">
                        {booking.mode === 'in-person' ? 'In Person' : 'Online'}
                      </div>
                    </div>
                    
                    {booking.status === 'pending' && (
                      <div className="flex gap-2">
                        {isTutor && (
                          <button 
                            onClick={() => handleBookingAction(booking.id, 'confirmed')}
                            className="btn text-xs"
                          >
                            Confirm
                          </button>
                        )}
                        <button 
                          onClick={() => handleBookingAction(booking.id, 'cancelled')}
                          className="btn-ghost text-xs text-red-500 dark:text-red-400 hover:bg-red-500/10"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
