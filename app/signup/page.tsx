'use client';

import Link from 'next/link';
import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../../lib/supabaseClient';

type Step = 'method' | 'email' | 'otp';

export default function SignUp() {
  const [step, setStep] = useState<Step>('method');
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

  // Microsoft OAuth sign in (for THI students)
  async function handleMicrosoftSignIn() {
    setError(null);
    setLoading(true);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'email profile openid',
          redirectTo: `${window.location.origin}/onboarding`,
        }
      });

      if (oauthError) {
        setError(oauthError.message);
        setLoading(false);
      }
    } catch (err) {
      console.error('Microsoft sign in error:', err);
      setError('Failed to connect to Microsoft. Please try email instead.');
      setLoading(false);
    }
  }

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
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/onboarding`,
        }
      });

      if (otpError) {
        setError(otpError.message);
        return;
      }

      setSuccess('Check your email for the magic link or 6-digit code!');
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
        setSuccess('Email verified! Setting up your account...');
        setTimeout(() => {
          window.location.href = '/onboarding';
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
          emailRedirectTo: `${window.location.origin}/onboarding`,
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
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-8 sm:py-12 bg-[var(--bg)]">
      <div className="w-full max-w-md">
        <div className="card p-6 sm:p-8 space-y-5 sm:space-y-6 animate-fade-in-up">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-thi-blue/10 dark:bg-[var(--primary)]/10 mb-3 sm:mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-thi-blue dark:text-[var(--primary)] sm:w-7 sm:h-7">
                <path d="M4 9.5L12 4L20 9.5V19.5C20 20.0523 19.5523 20.5 19 20.5H5C4.44772 20.5 4 20.0523 4 19.5V9.5Z" stroke="currentColor" strokeWidth="1.6" />
                <path d="M9 20.5V13.5H15V20.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
              {step === 'method' && 'Create your account'}
              {step === 'email' && 'Enter your email'}
              {step === 'otp' && 'Check your inbox'}
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-muted)]">
              {step === 'method' && 'Join Campus Help and start learning'}
              {step === 'email' && 'We\'ll send you a magic link'}
              {step === 'otp' && `We sent a code to ${email}`}
            </p>
          </div>

          {/* Step: Choose Method */}
          {step === 'method' && (
            <div className="space-y-4">
              {/* Features preview */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                {[
                  { icon: '📚', label: 'Find Tutors' },
                  { icon: '💬', label: 'Post Requests' },
                  { icon: '⚡', label: 'Fast Matching' },
                ].map((feature, i) => (
                  <div key={i} className="text-center p-2 sm:p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                    <div className="text-lg sm:text-xl mb-1">{feature.icon}</div>
                    <div className="text-[9px] sm:text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">{feature.label}</div>
                  </div>
                ))}
              </div>

              {/* Email option - Primary */}
              <button
                onClick={() => setStep('email')}
                className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl bg-[var(--primary)] text-white font-medium hover:opacity-90 transition-all active:scale-[0.98]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M22 6L12 13L2 6"/>
                </svg>
                Continue with Email
              </button>

              <p className="text-center text-xs text-[var(--text-muted)]">
                ✨ Use your @thi.de email for automatic verification
              </p>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step: Enter Email */}
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep('method')}
                className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                ← Back
              </button>

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
                  autoFocus
                  required 
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button type="submit" className="btn w-full py-4" disabled={loading || !email}>
                {loading ? 'Sending...' : 'Send magic link'}
              </button>
            </form>
          )}

          {/* Step: OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                ← Back
              </button>

              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-sm">
                💡 Check your email! You can click the magic link OR enter the 6-digit code below.
              </div>

              <div className="space-y-2">
                <label htmlFor="otp" className="block text-sm font-medium">Or enter 6-digit code</label>
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
                {loading ? 'Verifying...' : 'Verify code'}
              </button>

              <p className="text-center text-sm text-[var(--text-muted)]">
                {countdown > 0 ? `Resend in ${countdown}s` : (
                  <button type="button" onClick={handleResendOTP} disabled={loading} className="text-[var(--primary)] hover:underline">
                    Resend code
                  </button>
                )}
              </p>
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