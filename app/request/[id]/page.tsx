// app/request/[id]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import Toast from '../../../components/Toast';

type Reply = { id: string; helper_id: string; message: string; created_at: string; helper_name: string | null };
type Bid = { id: string; helper_id: string; amount_cents: number; message: string | null; created_at: string; helper_name: string | null };

type ReportDraft = { open: boolean; type: 'request'|'reply'; targetId: string; reason: string };

export default function RequestDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [req, setReq] = useState<any>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState('');
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [bidSaving, setBidSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success'|'error' } | null>(null);
  const [report, setReport] = useState<ReportDraft>({ open: false, type: 'request', targetId: '', reason: '' });

  async function refresh() {
    const { data: r, error: er } = await supabase.from('requests').select('*').eq('id', id).single();
    if (er) setToast({ msg: er.message, type: 'error' });
    setReq(r || null);
    const { data: reps, error: er2 } = await supabase
      .from('replies')
      .select('id,helper_id,message,created_at,profiles(full_name)')
      .eq('request_id', id)
      .order('created_at', { ascending: false });
    if (er2) setToast({ msg: er2.message, type: 'error' });
    const normalisedReplies: Reply[] = (reps || []).map((entry: any) => {
      const profile = entry?.profiles;
      const helperName = Array.isArray(profile) ? profile[0]?.full_name ?? null : profile?.full_name ?? null;
      return {
        id: entry.id,
        helper_id: entry.helper_id,
        message: entry.message,
        created_at: entry.created_at,
        helper_name: helperName
      };
    });
    setReplies(normalisedReplies);
    const { data: bidsData, error: bidsError } = await supabase
      .from('bids')
      .select('id,helper_id,amount_cents,message,created_at,profiles(full_name)')
      .eq('request_id', id)
      .order('amount_cents', { ascending: true });
    if (bidsError) {
      const friendly = bidsError.message.includes('public.bids')
        ? 'Bidding is not enabled yet. Ask an admin to run supabase/schema.sql to create the bids table.'
        : bidsError.message;
      setToast({ msg: friendly, type: 'error' });
    }
    const normalisedBids: Bid[] = (bidsData || []).map((entry: any) => {
      const profile = entry?.profiles;
      const helperName = Array.isArray(profile) ? profile[0]?.full_name ?? null : profile?.full_name ?? null;
      return {
        id: entry.id,
        helper_id: entry.helper_id,
        amount_cents: entry.amount_cents,
        message: entry.message,
        created_at: entry.created_at,
        helper_name: helperName
      };
    });
    setBids(normalisedBids);
  }

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setUserId(u.user?.id || '');
      await refresh();
    })();
  }, [id]);

  async function postReply() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { location.href = '/signin'; return; }
    if (!replyText) return;
    const { error } = await supabase.from('replies').insert({ request_id: id, helper_id: u.user.id, message: replyText });
    if (error) { setToast({ msg: error.message, type: 'error' }); return; }
    setReplyText('');
    setToast({ msg: 'Reply posted', type: 'success' });
    await refresh();
  }

  async function setStatus(status: 'open' | 'closed') {
    if (!req || userId !== req.author_id) return;
    try {
      setSaving(true);
      const { error } = await supabase.from('requests').update({ status }).eq('id', id);
      if (error) throw error;
      setToast({ msg: `Request ${status}`, type: 'success' });
      await refresh();
    } catch (e: any) {
      setToast({ msg: e?.message || 'Failed to update status', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function deleteRequest() {
    if (!req || userId !== req.author_id) return;
    if (!confirm('Delete this request? This cannot be undone.')) return;
    try {
      setSaving(true);
      const { error } = await supabase.from('requests').delete().eq('id', id);
      if (error) throw error;
      setToast({ msg: 'Request deleted', type: 'success' });
      setTimeout(() => { location.href = '/dashboard'; }, 600);
    } catch (e: any) {
      const message = typeof e?.message === 'string' && e.message.includes('violates row-level security')
        ? 'Supabase RLS is blocking deletes. Ensure the "requests delete own" policy from supabase/schema.sql is applied.'
        : e?.message || 'Failed to delete request';
      setToast({ msg: message, type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function submitBid() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { location.href = '/signin'; return; }
    if (!bidAmount.trim() || Number.isNaN(Number(bidAmount))) {
      setToast({ msg: 'Enter a numeric offer amount.', type: 'error' });
      return;
    }
    const numericOffer = Math.round(Number(bidAmount) * 100);
    if (numericOffer <= 0) {
      setToast({ msg: 'Offer must be greater than €0.', type: 'error' });
      return;
    }
    if (req?.budget_cents && numericOffer < req.budget_cents) {
      setToast({ msg: `Minimum offer is €${(req.budget_cents / 100).toFixed(2)}.`, type: 'error' });
      return;
    }

    try {
      setBidSaving(true);
      const alreadyBid = bids.some(b => b.helper_id === u.user?.id);
      const { error } = await supabase.from('bids').upsert({
        request_id: id,
        helper_id: u.user.id,
        amount_cents: numericOffer,
        message: bidMessage.trim() || null
      }, { onConflict: 'request_id,helper_id' });
      if (error) throw error;
      setToast({ msg: alreadyBid ? 'Bid updated' : 'Bid submitted', type: 'success' });
      setBidAmount('');
      setBidMessage('');
      await refresh();
    } catch (e: any) {
      setToast({ msg: e?.message || 'Failed to submit bid', type: 'error' });
    } finally {
      setBidSaving(false);
    }
  }

  function openReport(type: 'request'|'reply', targetId: string) {
    setReport({ open: true, type, targetId, reason: '' });
  }

  async function submitReport() {
    try {
      const payload = { type: report.type, id: report.targetId, reason: report.reason };
      const res = await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed to report.');
      setToast({ msg: 'Reported', type: 'success' });
    } catch (e: any) {
      setToast({ msg: e?.message || 'Failed to report', type: 'error' });
    } finally {
      setReport({ open: false, type: 'request', targetId: '', reason: '' });
    }
  }

  if (!req) return <div>Loading…</div>;

  return (
    <div className="space-y-6 container">
      <div className="card space-y-5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)]/60 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/45">
              {req.mode === 'in-person' ? 'In-person preferred' : 'Online friendly'}
              {req.budget_cents && <span className="text-white/70">· Min offer €{(req.budget_cents / 100).toFixed(2)}</span>}
            </div>
            <h1 className="text-2xl font-semibold text-white">{req.title}</h1>
            <p className="text-sm text-white/55">{req.course}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${req.status === 'closed' ? 'bg-[#f87171]/15 text-[#fca5a5]' : 'bg-[#4ade80]/15 text-[#86efac]'}`}>{req.status}</span>
            <button className="btn-ghost text-xs" onClick={() => openReport('request', id)}>Report</button>
            {userId && userId === req.author_id && (
              <>
                <button className="btn btn-critical text-xs" onClick={deleteRequest} disabled={saving}>Delete</button>
                {req.status === 'open' ? (
                  <button className="btn btn-secondary text-xs" onClick={() => setStatus('closed')} disabled={saving}>{saving ? 'Working…' : 'Close request'}</button>
                ) : (
                  <button className="btn btn-secondary text-xs" onClick={() => setStatus('open')} disabled={saving}>{saving ? 'Working…' : 'Reopen request'}</button>
                )}
              </>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)]/60 bg-[rgba(12,19,38,0.75)] p-5 text-sm text-white/70 whitespace-pre-wrap">
          {req.description}
        </div>
        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-white/35">
          <span>Posted {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(req.created_at))}</span>
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Live bids</h2>
          <span className="text-xs text-white/65">Sorted by offer</span>
        </div>
        <div className="space-y-3">
          {bids.length === 0 && <div className="rounded-2xl border border-[var(--border)]/60 bg-[rgba(11,17,32,0.75)] p-4 text-sm text-white/55">No bids yet. Be the first to submit an offer.</div>}
          {bids.map(bid => (
            <div key={bid.id} className="rounded-2xl border border-[var(--border)]/60 bg-[rgba(11,17,32,0.8)] p-4">
              <div className="flex items-center justify-between text-sm text-white/80">
                <span>{bid.helper_name || 'Student tutor'}</span>
                <span className="rounded-full bg-[#22d3ee]/15 px-2.5 py-1 text-xs font-semibold text-[#22d3ee]">€{(bid.amount_cents / 100).toFixed(2)}</span>
              </div>
              {bid.message && <p className="mt-2 text-sm text-white/60">{bid.message}</p>}
              <div className="mt-2 text-xs uppercase tracking-[0.25em] text-white/30">Sent {new Date(bid.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="font-semibold text-white">Replies</h2>
        <div className="space-y-3">
          {replies.map(r => (
            <div key={r.id} className="border rounded p-3 border-[var(--border)]">
              <p className="whitespace-pre-wrap">{r.message}</p>
              <div className="mt-2 flex gap-2 items-center">
                <div className="rounded-full border border-[var(--border)]/50 bg-white/5 px-3 py-1 text-xs text-white/60">
                  {r.helper_name || 'Student tutor'}
                </div>
                <button className="btn-ghost text-xs ml-auto" onClick={() => openReport('reply', r.id)}>Report</button>
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/30">{new Date(r.created_at).toLocaleString()}</div>
            </div>
          ))}
          {replies.length === 0 && <div className="text-sm text-[color:var(--muted)]">No replies yet.</div>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card space-y-3 p-6">
          <h2 className="font-semibold text-white">Submit a bid</h2>
          <input
            className="input"
            placeholder="Your offer (€)"
            value={bidAmount}
            onChange={e => setBidAmount(e.target.value)}
          />
          <textarea
            className="input h-24"
            placeholder="Optional note (availability, plan, etc.)"
            value={bidMessage}
            onChange={e => setBidMessage(e.target.value)}
          />
          <button className="btn" onClick={submitBid} disabled={bidSaving}>{bidSaving ? 'Submitting…' : 'Submit bid'}</button>
          <p className="text-xs text-white/45">Only bids at or above the minimum offer are shown to the requester.</p>
        </div>

        <div className="card space-y-3 p-6">
          <h2 className="font-semibold text-white">Send a quick reply</h2>
          <textarea className="input h-28" placeholder="Briefly explain how you can help"
            value={replyText} onChange={e=>setReplyText(e.target.value)} />
          <button className="btn" onClick={postReply}>Send reply</button>
          <p className="text-xs text-white/40">Replies are public. Use bids to surface your price and availability.</p>
        </div>
      </div>

      {report.open && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center">
          <div className="card p-4 w-full max-w-md">
            <h3 className="font-semibold mb-2">Report {report.type}</h3>
            <textarea className="input h-24" placeholder="Reason (optional)" value={report.reason} onChange={e=>setReport(r=>({ ...r, reason: e.target.value }))} />
            <div className="flex gap-2 justify-end mt-2">
              <button className="btn-ghost" onClick={() => setReport({ open: false, type: 'request', targetId: '', reason: '' })}>Cancel</button>
              <button className="btn" onClick={submitReport}>Submit report</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}