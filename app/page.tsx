'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import FeatureCards from '../components/HowItWorks';
import FloatingDots from '../components/FloatingDots';
import ModernHero from '../components/ModernHero';
import RequestCard from '../components/RequestCard';
import SimpleCalendar from '../components/SimpleCalendar';
import { supabase } from '../lib/supabaseClient';
import { useRoleTheme } from '../components/RoleThemeProvider';
import { useI18n } from '../components/I18nProvider';

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
  const { t } = useI18n();
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
    <div className="page-transition">
      <FloatingDots />
      <ModernHero loggedIn={hasSession} />
      <FeatureCards />
      
      <SimpleCalendar />

      <section className="container space-y-6 py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text)]">{t.home.latestRequests}</h2>
            <p className="text-sm text-[var(--text-muted)]">{t.home.latestRequestsDesc}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {!isTutor && <Link href="/request/new" className="btn-ghost">{t.home.createRequest}</Link>}
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            className="input md:max-w-sm"
            placeholder={t.home.filterPlaceholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            {query && (
              <button className="btn-ghost" onClick={() => setQuery('')}>
                {t.home.clearFilter}
              </button>
            )}
            {isTutor && (
              <select
                className="input md:w-48"
                value={sort}
                onChange={event => setSort(event.target.value as typeof sort)}
                aria-label="Sort requests"
              >
                <option value="newest">{t.home.newestFirst}</option>
                <option value="budget">{t.home.highestOffer}</option>
                <option value="course">{t.home.courseAZ}</option>
              </select>
            )}
          </div>
        </div>
      </section>

      <section className="container space-y-6">
        {loading && (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="card h-28 animate-pulse bg-[var(--bg-tertiary)]" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="card border-red-500/30 bg-red-500/10 p-5 text-sm text-red-600 dark:text-red-400">
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
              <div className="card p-6 text-sm text-[var(--text-muted)]">
                {t.home.noRequestsFilter} {query ? t.home.tryBroader : t.home.beFirst}
              </div>
            )}
          </div>
        )}

        {!loading && !error && hasResults && sorted.length >= REQUEST_LIMIT && (
          <div className="text-center text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
            {t.home.showingNewest} {REQUEST_LIMIT} {t.home.requests}
          </div>
        )}
      </section>

      <section className="container pb-16">
        <div className="card flex flex-col gap-6 px-8 py-9 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="tag">{t.home.nextSteps}</div>
            <h3 className="text-2xl font-semibold text-[var(--text)]">{hasSession ? t.home.keepMomentum : t.home.readyToStart}</h3>
            <p className="text-sm text-[var(--text-muted)] md:max-w-xl">
              {t.home.ctaDesc}
            </p>
          </div>
          <div className="flex flex-col gap-3 md:min-w-[220px]">
            {hasSession ? (
              <>
                {!isTutor && <Link href="/request/new" className="btn">{t.home.postAnother}</Link>}
                <Link href="/dashboard" className="btn-ghost">{t.home.openDashboard}</Link>
              </>
            ) : (
              <>
                <Link href="/signup" className="btn">{t.home.createFreeAccount}</Link>
                <Link href="/signin" className="btn-ghost">{t.home.alreadyHaveAccount}</Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}