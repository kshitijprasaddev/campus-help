'use client';

import Link from 'next/link';
import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../../lib/supabaseClient';

type Step = 'email' | 'otp';

export default function SignUp() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
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

  async function handleSendOTP(e: FormEvent) {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Send OTP to email
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
        }
      });

      if (otpError) {
        setError(otpError.message);
        return;
      }

      setSuccess('Check your email for the 6-digit code!');
      setStep('otp');
      setCountdown(60);
    } catch (err) {
      console.error('OTP error:', err);
      setError('Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

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
        setSuccess('Email verified! Redirecting...');
        setTimeout(() => {
          window.location.href = '/profile';
        }, 1000);
      }
    } catch (err) {
      console.error('Verify error:', err);
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
        options: {
          shouldCreateUser: true,
        }
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
              {step === 'otp' ? (
                <span className="text-3xl">📧</span>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-thi-blue dark:text-[var(--primary)]">
                  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <h1 className="text-2xl font-bold">
              {step === 'email' && 'Create your account'}
              {step === 'otp' && 'Enter verification code'}
            </h1>
            <p className="text-[var(--text-muted)]">
              {step === 'email' && 'Join Campus Help and start learning'}
              {step === 'otp' && `We sent a 6-digit code to ${email}`}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className={`w-8 h-1 rounded-full ${step === 'email' ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`} />
            <div className={`w-8 h-1 rounded-full ${step === 'otp' ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`} />
          </div>

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              {/* Features preview */}
              <div className="grid grid-cols-3 gap-3 mb-6">
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
                  We&apos;ll send you a 6-digit verification code
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
                ) : 'Continue with Email'}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
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
                ) : 'Verify & Continue'}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button 
                  type="button" 
                  onClick={() => setStep('email')}
                  className="text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  ← Change email
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
            Already have an account?{' '}
            <Link href="/signin" className="text-thi-blue dark:text-[var(--primary)] font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

