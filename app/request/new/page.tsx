'use client';
import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useSearchParams } from 'next/navigation';
import Toast from '../../../components/Toast';
import { supabase } from '../../../lib/supabaseClient';

type StaticPrograms = { programs?: { name: string; degree?: string; faculty?: string }[] };

type ProgramItem = { name: string; degree?: string; faculty?: string };

type FormState = {
  title: string;
  course: string;
  module: string;
  description: string;
  minRate: number;
  mode: 'online' | 'in-person';
};

const MIN_BUDGET = 10;
const MAX_BUDGET = 150;

function toLabel(p: ProgramItem): string {
  return p.degree ? `${p.name} (${p.degree})` : p.name;
}

function clampBudget(value: number) {
  if (Number.isNaN(value)) return MIN_BUDGET;
  return Math.min(Math.max(value, MIN_BUDGET), MAX_BUDGET);
}

export default function NewRequest() {
  const [userId, setUserId] = useState<string>('');
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState<boolean>(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [form, setForm] = useState<FormState>({ title: '', course: '', module: '', description: '', minRate: 45, mode: 'online' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [successOverlay, setSuccessOverlay] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [q, setQ] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        setCheckingAuth(false);
        location.href = '/signin';
        return;
      }
      setUserId(u.user.id);
      setCheckingAuth(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/thi-programs-static.json', { cache: 'no-store' });
        if (res.ok) {
          const json: StaticPrograms = await res.json();
          const items = (json.programs || []).map(p => ({
            name: String(p.name),
            degree: p.degree ? String(p.degree) : undefined,
            faculty: p.faculty ? String(p.faculty) : undefined,
          }));
          setPrograms(items);
        } else {
          setPrograms([]);
        }
      } catch {
        setPrograms([]);
      } finally {
        setLoadingPrograms(false);
      }
    })();
  }, []);

  useEffect(() => {
    const program = searchParams.get('program');
    if (program) {
      setForm(prev => ({ ...prev, course: program }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!successOverlay) return;
    let remaining = 3;
    setCountdown(remaining);
    const interval = window.setInterval(() => {
      remaining -= 1;
      setCountdown(remaining > 0 ? remaining : 1);
    }, 1000);
    const timeout = window.setTimeout(() => {
      clearInterval(interval);
      const target = redirectTarget ? `/request/${redirectTarget}` : '/dashboard';
      location.href = target;
    }, 2600);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [successOverlay, redirectTarget]);

  const filteredPrograms = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return programs;
    return programs.filter(p =>
      p.name.toLowerCase().includes(s) || (p.degree || '').toLowerCase().includes(s) || (p.faculty || '').toLowerCase().includes(s)
    );
  }, [q, programs]);

  const labels = useMemo(() => filteredPrograms.map(toLabel), [filteredPrograms]);
  const hasSelectedInList = useMemo(() => labels.includes(form.course), [labels, form.course]);

  const sliderProgress = ((form.minRate - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100;
  const sliderStyle = { '--progress': `${Math.min(Math.max(sliderProgress, 0), 100)}%` } as CSSProperties;

  async function ensureAuth(): Promise<string | null> {
    if (userId) return userId;
    const { data } = await supabase.auth.getUser();
    return data.user?.id || null;
  }

  async function submit() {
    setError(null);
    setToast(null);
    if (!form.title.trim() || !form.course.trim() || !form.description.trim()) {
      setError('Please fill program/course, title, and description.');
      return;
    }
    if (!Number.isFinite(form.minRate) || form.minRate < MIN_BUDGET) {
      setError('Set a minimum offer within the slider range.');
      return;
    }
    if (checkingAuth) {
      setError('Verifying your session. Please try again in a moment.');
      return;
    }
    const uid = await ensureAuth();
    if (!uid) {
      setError('Not signed in.');
      return;
    }

    try {
      setSaving(true);
      const desc = form.module ? `Module: ${form.module}\n\n${form.description.trim()}` : form.description.trim();
      const { data: inserted, error: e } = await supabase
        .from('requests')
        .insert({
          author_id: uid,
          title: form.title.trim(),
          course: form.course.trim(),
          description: desc,
          budget_cents: Math.round(form.minRate * 100),
          mode: form.mode
        })
        .select('id')
        .single();
      if (e) throw e;
      setRedirectTarget(inserted?.id ?? null);
      setSuccessOverlay(true);
    } catch (e: any) {
      console.error('Request creation failed:', e);
      const message = typeof e?.message === 'string' && e.message.toLowerCase().includes('failed to fetch')
        ? 'Could not reach Supabase. Double-check your connection and refresh.'
        : (e?.message || 'Failed to post. Check fields and try again.');
      setToast({ msg: message, type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container">
      <div className="mx-auto max-w-2xl space-y-6 rounded-[40px] border border-[var(--border)]/60 bg-[rgba(6,9,16,0.9)] p-8 shadow-[0_45px_140px_-90px_rgba(4,12,28,1)] anim-fade-up">
        <div className="space-y-2">
          <div className="tag">New request</div>
          <h1 className="text-3xl font-semibold text-white">Post what you need help with</h1>
          <p className="text-sm text-white/60">Share detail—tutors respond faster when they see the scope and the offer.</p>
        </div>

  <div className="rounded-2xl border border-[var(--border)]/60 bg-white/[0.04] p-5 space-y-3">
          <label className="text-xs uppercase tracking-[0.3em] text-white/40">Program</label>
          <input className="input" placeholder="Search program…" value={q} onChange={e => setQ(e.target.value)} />
          <select
            className={`input ${loadingPrograms ? 'cursor-wait opacity-60' : ''}`}
            value={form.course}
            onChange={e => setForm({ ...form, course: e.target.value, module: '' })}
            disabled={loadingPrograms}
          >
            {!loadingPrograms ? (
              <>
                <option value="">Choose a program</option>
                {form.course && !hasSelectedInList && <option value={form.course}>{form.course}</option>}
                {filteredPrograms.map((p, idx) => {
                  const label = toLabel(p);
                  const key = `${p.name}-${p.degree || 'NA'}-${p.faculty || 'NA'}-${idx}`;
                  return (
                    <option key={key} value={label}>
                      {label}
                    </option>
                  );
                })}
              </>
            ) : (
              <option value="">Loading programs…</option>
            )}
          </select>
        </div>

        <div className="grid gap-4">
          <input
            className="input"
            placeholder="Title (e.g. Calculus II mock exam review)"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="input h-36"
            placeholder="Describe what you need, preferred timing, and any expectations."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />

          <div className="grid gap-4 md:grid-cols-[1fr,180px]">
            <div className="rounded-2xl border border-[var(--border)]/60 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.28em] text-white/35">Minimum offer</span>
                <span className="text-[11px] uppercase tracking-[0.22em] text-white/30">Tutors see this first</span>
              </div>
              <div className="mt-4 flex items-end gap-3">
                <span className="text-4xl font-semibold text-white">€{form.minRate}</span>
                <span className="pb-1 text-sm text-white/45">per session</span>
              </div>
              <div className="mt-5 space-y-3">
                <input
                  type="range"
                  min={MIN_BUDGET}
                  max={MAX_BUDGET}
                  step={5}
                  value={form.minRate}
                  onChange={event => setForm({ ...form, minRate: clampBudget(Number(event.target.value)) })}
                  style={sliderStyle}
                />
                <div className="flex justify-between text-[11px] uppercase tracking-[0.28em] text-white/35">
                  <span>€{MIN_BUDGET}</span>
                  <span>€{MAX_BUDGET}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <select className="input" onChange={e => setForm({ ...form, mode: e.target.value as FormState['mode'] })} value={form.mode}>
                <option value="online">Online</option>
                <option value="in-person">In-person</option>
              </select>
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/30">Pick how you want to meet.</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="btn-ghost w-full justify-center text-xs uppercase tracking-[0.25em]"
                  onClick={() => setForm(prev => ({ ...prev, minRate: clampBudget(prev.minRate - 5) }))}
                >
                  - €5
                </button>
                <button
                  type="button"
                  className="btn-ghost w-full justify-center text-xs uppercase tracking-[0.25em]"
                  onClick={() => setForm(prev => ({ ...prev, minRate: clampBudget(prev.minRate + 5) }))}
                >
                  + €5
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && <p className="rounded-xl border border-[#ff6b6b]/40 bg-[rgba(46,12,27,0.4)] px-4 py-2 text-sm text-[#ff9a9a]">{error}</p>}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-white/40">Tutors bid at or above your slider value. Approve the fit before sharing payment details.</p>
          <button className="btn" onClick={submit} disabled={saving || checkingAuth}>
            {saving ? 'Posting…' : 'Publish request'}
          </button>
        </div>
      </div>

      {successOverlay && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 backdrop-blur-md px-4">
          <div className="success-pop relative w-full max-w-md overflow-hidden rounded-[32px] border border-[var(--border)]/70 bg-[rgba(6,10,20,0.95)] p-10 text-center text-white shadow-[0_45px_160px_-110px_rgba(4,12,28,1)]">
            <div className="pointer-events-none absolute inset-0 animate-pulse-sheen" aria-hidden />
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary)]/15">
              <div className="animate-scale-ring absolute inset-0 rounded-full border border-[var(--primary)]/40" aria-hidden />
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[var(--primary)]"
                aria-hidden
              >
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="relative text-2xl font-semibold">Request submitted!</h2>
            <p className="relative mt-2 text-sm text-white/70">
              {redirectTarget ? 'We’ll open your request so you can watch bids roll in.' : 'We’ll bring you back to your dashboard to monitor bids.'}
            </p>
            <p className="relative mt-5 text-xs uppercase tracking-[0.3em] text-white/35">Redirecting in {countdown}…</p>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}