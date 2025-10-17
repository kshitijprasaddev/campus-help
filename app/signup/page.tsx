'use client';
// app/signup/page.tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Toast from '../../components/Toast';

const ALLOWED = (process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success'|'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  const domain = email.split('@')[1]?.toLowerCase();
  const domainAllowed = !!domain && ALLOWED.includes(domain);

  function mapErrorMessage(message: string | undefined) {
    if (!message) return 'Signup failed';
    if (message.toLowerCase().includes('failed to fetch')) {
      return 'Could not reach Supabase. Check your internet connection and .env values, then refresh.';
    }
    return message;
  }

  async function signUp() {
    setMsg(null);
    setToast(null);
    if (!domainAllowed) { setMsg(`Use your uni email (${ALLOWED.join(', ')})`); return; }
    if (password.length < 8) { setMsg('Password must be at least 8 characters.'); return; }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined } });
      if (error) throw error;
      setToast({ msg: 'Account created. Check your inbox to confirm.', type: 'success' });
    } catch (e: any) {
      setToast({ msg: mapErrorMessage(e?.message), type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4 card p-6 anim-fade-up">
      <div>
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-sm text-[color:var(--muted)] mt-1">Use your uni email: {ALLOWED.join(', ') || '—'}</p>
      </div>
      <input type="email" className="input" placeholder="you@uni-example.de" value={email} onChange={e=>setEmail(e.target.value)} />
      <input type="password" className="input" placeholder="Password (min 8 chars)" value={password} onChange={e=>setPassword(e.target.value)} />
      {msg && <p className="text-sm text-red-500">{msg}</p>}
      <button className={`btn ${loading ? '!bg-gray-400 cursor-not-allowed' : ''}`} onClick={signUp} disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
      <div className="text-xs text-[color:var(--muted)]">Already have an account? <a className="underline" href="/signin">Sign in</a></div>
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

