'use client';

import Link from 'next/link';
import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });
      
      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Please check your email and confirm your account first.');
        } else {
          setError(authError.message);
        }
        return;
      }

      setSuccess('Welcome back! Redirecting...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 800);
    } catch (err) {
      console.error('Sign in error:', err);
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
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-[var(--text-muted)]">Sign in to your Campus Help account</p>
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
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
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
                Signing in...
              </span>
            ) : 'Sign in'}
          </button>

          <div className="text-center text-sm text-[var(--text-muted)]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-thi-blue dark:text-[var(--primary)] font-semibold hover:underline">
              Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
