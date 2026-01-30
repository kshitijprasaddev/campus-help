'use client';
// app/signin/page.tsx
import Link from 'next/link';
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : undefined;
      setToast({ msg: mapErrorMessage(message), type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-[150px]" />
      </div>

      <form
        className="relative w-full max-w-md animate-fade-in-up"
        onSubmit={event => {
          event.preventDefault();
          if (!loading) void signIn();
        }}
      >
        {/* Card glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)]/20 via-transparent to-[var(--accent)]/20 rounded-[32px] blur-xl opacity-50" />
        
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/10 border border-white/10 mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[var(--primary)]">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-sm text-white/50">Sign in to continue to Campus Help</p>
          </div>

          {/* Allowed domains badge */}
          <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Allowed: {ALLOWED.join(', ') || 'Any email'}
          </div>
          
          {/* Form fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Email</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[var(--primary)]/50 focus:ring-2 focus:ring-[var(--primary)]/20 focus:outline-none transition-all duration-300" 
                placeholder="you@thi.de" 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[var(--primary)]/50 focus:ring-2 focus:ring-[var(--primary)]/20 focus:outline-none transition-all duration-300" 
                placeholder="••••••••" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          {msg && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {msg}
            </div>
          )}
          
          <button
            type="submit"
            className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 ${
              loading 
                ? 'bg-white/10 text-white/50 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white hover:shadow-[0_10px_40px_-10px_var(--primary)] hover:scale-[1.02]'
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Signing in...
              </span>
            ) : 'Sign in'}
          </button>

          <div className="text-center text-sm text-white/50">
            New here?{' '}
            <Link className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors font-medium" href="/signup">
              Create an account
            </Link>
          </div>
        </div>
      </form>
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}