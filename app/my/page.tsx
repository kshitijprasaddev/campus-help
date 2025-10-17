'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

type Req = { id: string; title: string; course: string; status: string; created_at: string };
type Rep = { id: string; request_id: string; message: string; created_at: string };
type Bid = { id: string; request_id: string; helper_id: string; amount_cents: number; message: string | null; created_at: string; request: { title: string } | null };
type BidRow = Omit<Bid, 'request'> & { request: { title: string } | { title: string }[] | null };

export default function MyPage() {
  const [myRequests, setMyRequests] = useState<Req[]>([]);
  const [myReplies, setMyReplies] = useState<Rep[]>([]);
  const [myBids, setMyBids] = useState<Bid[]>([]);
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

  const [{ data: reqs, error: reqErr }, { data: reps, error: repErr }, { data: bids, error: bidsErr }] = await Promise.all([
          supabase
            .from('requests')
            .select('id,title,course,status,created_at')
            .eq('author_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('replies')
            .select('id,request_id,message,created_at')
            .eq('helper_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('bids')
            .select('id,request_id,helper_id,amount_cents,message,created_at,request:requests(title)')
            .eq('helper_id', user.id)
            .order('created_at', { ascending: false })
        ]);

        if (!mounted) return;

        if (reqErr || repErr || bidsErr) {
          setError('Unable to load your activity right now.');
          setMyRequests([]);
          setMyReplies([]);
          setMyBids([]);
        } else {
          setMyRequests((reqs as Req[]) || []);
          setMyReplies((reps as Rep[]) || []);
          const bidRows = (bids ?? []) as BidRow[];
          const normalisedBids: Bid[] = bidRows.map(entry => {
            const request = entry.request;
            const requestData = Array.isArray(request) ? request[0] ?? null : request ?? null;
            return {
              id: entry.id,
              request_id: entry.request_id,
              helper_id: entry.helper_id,
              amount_cents: entry.amount_cents,
              message: entry.message,
              created_at: entry.created_at,
              request: requestData
            };
          });
          setMyBids(normalisedBids);
        }
      } catch (err) {
        if (mounted) {
          console.error('My activity load failed', err);
          setError('Unable to load your activity right now.');
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

  return (
    <div className="container space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">My activity</h1>
        <p className="mt-2 text-sm text-white/60">Review what you’ve posted and where you’ve already offered help.</p>
      </div>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="card skeleton h-28" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="card border border-[#f87171]/40 bg-[rgba(46,12,27,0.4)] px-5 py-4 text-sm text-[#fca5a5]">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">My requests</h2>
                <Link href="/request/new" className="btn-ghost text-xs">Post more</Link>
              </div>
              <div className="space-y-3">
                {myRequests.length === 0 && <div className="card p-5 text-sm text-white/60">You haven’t posted any requests yet.</div>}
                {myRequests.map(request => (
                  <Link
                    key={request.id}
                    href={`/request/${request.id}`}
                    className="rounded-2xl border border-[var(--border)]/60 bg-[rgba(12,19,38,0.8)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--primary)]/40"
                  >
                    <div className="text-base font-semibold text-white">
                      {request.title} <span className="text-white/45">· {request.course}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-white/45">
                      <span>{request.status}</span>
                      <span>{new Date(request.created_at).toLocaleString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">My replies</h2>
                <Link href="/tutors" className="btn-ghost text-xs">Browse tutors</Link>
              </div>
              <div className="space-y-3">
                {myReplies.length === 0 && <div className="card p-5 text-sm text-white/60">You haven’t replied to any requests.</div>}
                {myReplies.map(reply => (
                  <Link
                    key={reply.id}
                    href={`/request/${reply.request_id}`}
                    className="rounded-2xl border border-[var(--border)]/60 bg-[rgba(12,19,38,0.8)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--primary)]/40"
                  >
                    <div className="text-sm text-white/80">{reply.message}</div>
                    <div className="mt-2 text-xs text-white/40">{new Date(reply.created_at).toLocaleString()}</div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">My bids</h2>
            </div>
            <div className="space-y-3">
              {myBids.length === 0 && <div className="card p-5 text-sm text-white/60">No bids submitted yet.</div>}
              {myBids.map(bid => (
                <Link
                  key={bid.id}
                  href={`/request/${bid.request_id}`}
                  className="rounded-2xl border border-[var(--border)]/60 bg-[rgba(12,19,38,0.8)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--primary)]/40"
                >
                  <div className="text-sm font-semibold text-white">{bid.request?.title || 'Request'}</div>
                  <div className="mt-1 text-xs text-white/55">Offer: €{(bid.amount_cents / 100).toFixed(2)}</div>
                  {bid.message && <p className="mt-2 text-xs text-white/45">“{bid.message}”</p>}
                  <div className="mt-2 text-xs text-white/35">Submitted {new Date(bid.created_at).toLocaleString()}</div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
