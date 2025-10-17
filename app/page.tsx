'use client';
import { useEffect, useMemo, useState } from 'react';
import FeatureCards from '../components/FeatureCards';
import Hero from '../components/Hero';
import RequestCard from '../components/RequestCard';
import TutorCalendarWidget from '../components/TutorCalendarWidget';
import { supabase } from '../lib/supabaseClient';
import { useRoleTheme } from '../components/RoleThemeProvider';

type Req = {
  id: string;
  title: string;
  course: string;
  description: string;
  budget_cents: number | null;
  created_at: string;
  status: string;
  author_id: string;
};

const REQUEST_LIMIT = 12;

export default function Home() {
  const { role, profile } = useRoleTheme();
  const [requests, setRequests] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [hasSession, setHasSession] = useState(false);
  const [sort, setSort] = useState<'newest' | 'budget' | 'course'>('newest');

  useEffect(() => {
    let isMounted = true;

    const loadRequests = async () => {
      setError(null);
      try {
        setLoading(true);
        let queryBuilder = supabase
          .from('requests')
          .select('id,title,course,description,budget_cents,created_at,status,author_id')
          .order('created_at', { ascending: false })
          .limit(REQUEST_LIMIT);

        if (role === 'tutor') {
          queryBuilder = queryBuilder.eq('status', 'open');
          if (profile?.id) {
            queryBuilder = queryBuilder.neq('author_id', profile.id);
          }
        }

        const { data, error: supaError } = await queryBuilder;

        if (!isMounted) return;

        if (supaError) {
          setError('Unable to load requests right now.');
          setRequests([]);
        } else {
          setRequests(data || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load requests', err);
          setError('Unable to load requests right now.');
          setRequests([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (isMounted) setHasSession(!!data.session);
    };

    loadSession();
    loadRequests();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setHasSession(!!session);
    });

    return () => {
      isMounted = false;
      subscription?.subscription.unsubscribe();
    };
  }, [role, profile?.id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter(r => r.course.toLowerCase().includes(q) || r.title.toLowerCase().includes(q));
  }, [requests, query]);

  const sorted = useMemo(() => {
    if (sort === 'budget') {
      return [...filtered].sort((a, b) => (b.budget_cents ?? 0) - (a.budget_cents ?? 0));
    }
    if (sort === 'course') {
      return [...filtered].sort((a, b) => a.course.localeCompare(b.course));
    }
    return filtered;
  }, [filtered, sort]);

  const hasResults = sorted.length > 0;
  const isTutor = role === 'tutor';
  return (
    <div className="space-y-24">
      <Hero loggedIn={hasSession} />
      <FeatureCards />

      <section className="container space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Latest requests</h2>
            <p className="text-sm text-white/70">Filter instantly without leaving your session. Tutors see only open learner requests.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {!isTutor && <a href="/request/new" className="btn-ghost">Create request</a>}
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            className="input md:max-w-sm"
            placeholder="Filter by course or title…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            {query && (
              <button className="btn-ghost" onClick={() => setQuery('')}>
                Clear filter
              </button>
            )}
            {isTutor && (
              <select
                className="input md:w-48"
                value={sort}
                onChange={event => setSort(event.target.value as typeof sort)}
                aria-label="Sort requests"
              >
                <option value="newest">Newest first</option>
                <option value="budget">Highest offer</option>
                <option value="course">Course A–Z</option>
              </select>
            )}
          </div>
        </div>
      </section>

      <section className="container space-y-6">
        {loading && (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="card skeleton h-28" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="card border border-[#f87171]/30 bg-[rgba(46,12,27,0.4)] p-5 text-sm text-[#fca5a5]">
            {error} Please refresh or try again later.
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-4 md:grid-cols-2">
            {hasResults ? (
              sorted.map((r, idx) => (
                <div key={r.id} className="anim-fade-up" style={{ animationDelay: `${idx * 0.06}s` }}>
                  <RequestCard
                    id={r.id}
                    title={r.title}
                    course={r.course}
                    budget_cents={r.budget_cents}
                    created_at={r.created_at}
                    status={r.status}
                  />
                </div>
              ))
            ) : (
              <div className="card p-6 text-sm text-white/60">
                No requests match that filter yet. {query ? 'Try a broader course keyword.' : 'Be the first to post a request today!'}
              </div>
            )}
          </div>
        )}

        {!loading && !error && hasResults && sorted.length >= REQUEST_LIMIT && (
          <div className="text-center text-xs uppercase tracking-[0.3em] text-white/40">
            Showing the newest {REQUEST_LIMIT} requests
          </div>
        )}
      </section>

      <section className="container">
        <div className="card flex flex-col gap-6 px-8 py-9 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="tag">Next steps</div>
            <h3 className="text-2xl font-semibold text-white">{hasSession ? 'Keep momentum on your studies.' : 'Join hundreds of students helping each other.'}</h3>
            <p className="text-sm text-white/60 md:max-w-xl">
              Minimal tools to match with the right tutor in minutes. Post what you need, set the price you can offer, and pick from verified tutors who respond instantly. No credits, no clutter just direct collaboration.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:min-w-[220px]">
            {hasSession ? (
              <>
                {!isTutor && <a href="/request/new" className="btn">Post another request</a>}
                <a href="/dashboard" className="btn-ghost">Open dashboard</a>
              </>
            ) : (
              <>
                <a href="/signup" className="btn">Create free account</a>
                <a href="/signin" className="btn-ghost">I already have an account</a>
              </>
            )}
          </div>
        </div>
      </section>

      <TutorCalendarWidget />
    </div>
  );
}