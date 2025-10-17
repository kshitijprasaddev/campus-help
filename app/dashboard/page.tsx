'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

type Req = { id: string; title: string; course: string; status: string; created_at: string };

export default function DashboardPage() {
  const [email, setEmail] = useState<string>('');
  const [myRequests, setMyRequests] = useState<Req[]>([]);
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

        setEmail(user.email || '');

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

  return (
    <div className="container space-y-8">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="tag">Signed in as</div>
              <h1 className="mt-2 text-2xl font-semibold text-white">{email || '—'}</h1>
              <p className="mt-2 text-sm text-white/55">
                Keep track of your open requests, bids, and replies from classmates in one workspace.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <a className="btn" href="/request/new">Post a request</a>
            <a className="btn-ghost" href="/my">My items</a>
            <a className="btn-ghost" href="/tutors">Browse tutors</a>
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="tag">Snapshot</div>
              <h2 className="mt-2 text-lg font-semibold text-white">Request performance</h2>
            </div>
            <a href="/request/new" className="btn-ghost text-xs">Create new</a>
          </div>
          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl border border-[var(--border)]/60 bg-white/5 px-5 py-4">
              <div className="text-xs uppercase tracking-[0.3em] text-white/45">Open requests</div>
              <div className="mt-2 text-2xl font-semibold text-white">{openRequests}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)]/60 bg-white/5 px-5 py-4">
              <div className="text-xs uppercase tracking-[0.3em] text-white/45">Closed requests</div>
              <div className="mt-2 text-2xl font-semibold text-white">{closedRequests}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-white">My recent requests</h2>
          <a href="/my" className="btn-ghost text-sm">View all activity</a>
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
          <div className="card p-6 text-sm text-white/60">
            You haven’t posted any requests yet. Start by creating one for your toughest course.
          </div>
        )}

        {!loading && !error && myRequests.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {myRequests.map(req => (
              <a
                key={req.id}
                href={`/request/${req.id}`}
                className="group rounded-2xl border border-[var(--border)]/60 bg-[rgba(12,19,38,0.78)] p-5 transition-all hover:-translate-y-1 hover:border-[var(--primary)]/40 hover:bg-[rgba(26,35,58,0.85)]"
              >
                <div className="flex items-center justify-between">
                  <div className="text-base font-semibold text-white">
                    {req.title} <span className="text-white/45">· {req.course}</span>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium uppercase tracking-[0.25em] ${req.status === 'closed' ? 'bg-[rgba(248,113,113,0.12)] text-[#fca5a5]' : 'bg-[rgba(74,222,128,0.12)] text-[#86efac]'}`}>
                    {req.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-white/45">{new Date(req.created_at).toLocaleString()}</div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
