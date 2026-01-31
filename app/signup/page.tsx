'use client';

import Link from 'next/link';
import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signUp({ 
        email: email.trim(), 
        password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined
        }
      });
      
      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('This email is already registered. Try signing in instead.');
        } else {
          setError(authError.message);
        }
        return;
      }

      setSuccess('Account created! Check your email to confirm your account.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Sign up error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="card p-8 space-y-6 animate-fade-in-up">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-thi-blue/10 dark:bg-[var(--primary)]/10 mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-thi-blue dark:text-[var(--primary)]">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-[var(--text-muted)]">Join Campus Help and start learning</p>
          </div>

          {/* Features preview */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '📚', label: 'Find Tutors' },
              { icon: '💬', label: 'Post Requests' },
              { icon: '⚡', label: 'Fast Matching' },
            ].map((feature, i) => (
              <div key={i} className="text-center p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <div className="text-xl mb-1">{feature.icon}</div>
                <div className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">{feature.label}</div>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">Email address</label>
              <input 
                id="email"
                type="email" 
                className="input"
                placeholder="your@email.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">Password</label>
              <input 
                id="password"
                type="password" 
                className="input"
                placeholder="At least 8 characters" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                minLength={8}
                required 
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm password</label>
              <input 
                id="confirmPassword"
                type="password" 
                className="input"
                placeholder="Confirm your password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                required 
              />
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm animate-fade-in-up">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 text-sm animate-fade-in-up">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{success}</span>
              </div>
            </div>
          )}
          
          <button type="submit" className="btn w-full py-4" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="spinner" />
                Creating account...
              </span>
            ) : 'Create account'}
          </button>

          <div className="text-center text-sm text-[var(--text-muted)]">
            Already have an account?{' '}
            <Link href="/signin" className="text-thi-blue dark:text-[var(--primary)] font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

