'use client';

import Link from 'next/link';
import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../../lib/supabaseClient';

type Method = 'otp' | 'password';
type Step = 'email' | 'verify';

export default function SignIn() {
  const [method, setMethod] = useState<Method>('otp');
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Password sign in
  async function handlePasswordSignIn(e: FormEvent) {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });
      
      if (authError) {
        setLoading(false);
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Please verify your email first. Try signing in with OTP.');
        } else {
          setError(authError.message);
        }
        return;
      }

      setSuccess('Welcome back! Redirecting...');
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  // Send OTP
  async function handleSendOTP(e: FormEvent) {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false, // Don't create new accounts on signin
        }
      });

      if (otpError) {
        if (otpError.message.includes('Signups not allowed')) {
          setError('No account found with this email. Please sign up first.');
        } else {
          setError(otpError.message);
        }
        return;
      }

      setSuccess('Check your email for the 6-digit code!');
      setStep('verify');
      setCountdown(60);
    } catch (err) {
      setError('Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Verify OTP
  async function handleVerifyOTP(e: FormEvent) {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp,
        type: 'email',
      });

      if (verifyError) {
        setError('Invalid or expired code. Please try again.');
        return;
      }

      if (data.session) {
        setSuccess('Welcome back! Redirecting...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOTP() {
    if (countdown > 0) return;
    
    setError(null);
    setLoading(true);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: false }
      });

      if (otpError) {
        setError(otpError.message);
        return;
      }

      setSuccess('New code sent!');
      setCountdown(60);
    } catch (err) {
      setError('Failed to resend code.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card p-8 space-y-6 animate-fade-in-up">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-thi-blue/10 dark:bg-[var(--primary)]/10 mb-4">
              {step === 'verify' ? (
                <span className="text-3xl">📧</span>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-thi-blue dark:text-[var(--primary)]">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </div>
            <h1 className="text-2xl font-bold">
              {step === 'verify' ? 'Enter verification code' : 'Welcome back'}
            </h1>
            <p className="text-[var(--text-muted)]">
              {step === 'verify' 
                ? `We sent a 6-digit code to ${email}` 
                : 'Sign in to your Campus Help account'}
            </p>
          </div>

          {step === 'email' && (
            <>
              {/* Method toggle */}
              <div className="flex rounded-xl bg-[var(--bg-secondary)] p-1 border border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setMethod('otp')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    method === 'otp' 
                      ? 'bg-[var(--primary)] text-white' 
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  📧 Email Code
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('password')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    method === 'password' 
                      ? 'bg-[var(--primary)] text-white' 
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  🔒 Password
                </button>
              </div>

              {/* OTP Sign In */}
              {method === 'otp' && (
                <form onSubmit={handleSendOTP} className="space-y-4">
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
                    <p className="text-xs text-[var(--text-muted)]">
                      We&apos;ll send you a 6-digit code — no password needed
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <button type="submit" className="btn w-full py-4" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="spinner" />
                        Sending code...
                      </span>
                    ) : 'Send me a code'}
                  </button>
                </form>
              )}

              {/* Password Sign In */}
              {method === 'password' && (
                <form onSubmit={handlePasswordSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email-pw" className="block text-sm font-medium">Email address</label>
                    <input 
                      id="email-pw"
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

                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 text-sm">
                      {success}
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
                </form>
              )}
            </>
          )}

          {/* OTP Verification */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="otp" className="block text-sm font-medium">Verification code</label>
                <input 
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  className="input text-center text-2xl tracking-[0.5em] font-mono"
                  placeholder="000000" 
                  value={otp} 
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={loading}
                  autoComplete="one-time-code"
                  required 
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 text-sm">
                  {success}
                </div>
              )}

              <button type="submit" className="btn w-full py-4" disabled={loading || otp.length !== 6}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="spinner" />
                    Verifying...
                  </span>
                ) : 'Verify & Sign In'}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button 
                  type="button" 
                  onClick={() => { setStep('email'); setOtp(''); }}
                  className="text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  ← Back
                </button>
                <button 
                  type="button" 
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || loading}
                  className={countdown > 0 ? 'text-[var(--text-muted)]' : 'text-[var(--primary)] hover:underline'}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}

          <div className="text-center text-sm text-[var(--text-muted)]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-thi-blue dark:text-[var(--primary)] font-semibold hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
