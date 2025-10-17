'use client';
// app/signin/page.tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Toast from '../../components/Toast';

const ALLOWED = (process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success'|'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  const domain = email.split('@')[1]?.toLowerCase();
  const domainAllowed = !!domain && ALLOWED.includes(domain);

  function mapErrorMessage(message: string | undefined) {
    if (!message) return 'Sign-in failed';
    if (message.toLowerCase().includes('failed to fetch')) {
      return 'Could not reach Supabase. Check your internet connection and .env values, then refresh.';
    }
    return message;
  }

  async function signIn() {
    setMsg(null);
    setToast(null);
    if (!domainAllowed) { setMsg(`Use your uni email (${ALLOWED.join(', ')})`); return; }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setToast({ msg: 'Signed in', type: 'success' });
      setTimeout(()=>{ location.href = '/dashboard'; }, 400);
    } catch (e: any) {
      setToast({ msg: mapErrorMessage(e?.message), type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="max-w-md mx-auto space-y-4 card p-6 anim-fade-up"
      onSubmit={event => {
        event.preventDefault();
        if (!loading) void signIn();
      }}
    >
      <div>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-[color:var(--muted)] mt-1">Use your uni email: {ALLOWED.join(', ') || '—'}</p>
      </div>
      <input type="email" className="input" placeholder="you@uni-example.de" value={email} onChange={e=>setEmail(e.target.value)} required />
      <input type="password" className="input" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
      {msg && <p className="text-sm text-red-500">{msg}</p>}
      <button
        type="submit"
        className={`btn ${loading ? '!bg-gray-400 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
      <div className="text-xs text-[color:var(--muted)]">New here? <a className="underline" href="/signup">Create an account</a></div>
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </form>
  );
}