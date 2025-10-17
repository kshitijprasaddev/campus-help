'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const ADMIN_ALLOW = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);

type Report = { id: string; type: 'request'|'reply'; target_id: string; reason: string; status: 'open'|'reviewed'|'closed'; created_at: string };

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    const { data, error: supaError } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (supaError) {
      setError('Something went wrong while fetching reports.');
      setReports([]);
    } else {
      setReports((data as Report[]) || []);
    }
  }

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email?.toLowerCase() || '';
      if (!email || (ADMIN_ALLOW.length && !ADMIN_ALLOW.includes(email))) {
        location.href = '/';
        return;
      }
      setAuthorized(true);
      await load();
      setLoading(false);
    })();
  }, []);

  async function setStatus(id: string, status: Report['status']) {
    await fetch('/api/moderation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    await load();
  }

  if (!authorized) return null;

  return (
    <div className="container space-y-6">
      <div className="space-y-2">
        <div className="tag">Moderation</div>
        <h1 className="text-3xl font-semibold text-white">Community reports</h1>
        <p className="text-sm text-white/60">Only admins listed in NEXT_PUBLIC_ADMIN_EMAILS can see this dashboard.</p>
      </div>

      <div className="card p-6 md:p-8 space-y-4">
        {loading && <div className="card skeleton h-32" />}
        {!loading && error && <div className="rounded-2xl border border-[#f87171]/40 bg-[rgba(46,12,27,0.4)] px-4 py-3 text-sm text-[#fca5a5]">{error}</div>}
        {!loading && !error && reports.length === 0 && <div className="text-sm text-white/60">No reports.</div>}

        {!loading && !error && reports.length > 0 && (
          <div className="space-y-3">
            {reports.map(report => (
              <div key={report.id} className="rounded-2xl border border-[var(--border)]/60 bg-[rgba(12,19,38,0.82)] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-white">
                    {report.type} · {report.target_id}
                  </div>
                  <span className="rounded-full border border-[var(--border)]/40 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/50">
                    {report.status}
                  </span>
                </div>
                {report.reason && <div className="mt-3 text-sm text-white/70">Reason: {report.reason}</div>}
                <div className="mt-2 text-xs text-white/40">{new Date(report.created_at).toLocaleString()}</div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <button className="btn-ghost" onClick={() => setStatus(report.id, 'reviewed')}>
                    Mark reviewed
                  </button>
                  <button className="btn-ghost" onClick={() => setStatus(report.id, 'closed')}>
                    Close
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
