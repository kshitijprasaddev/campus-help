'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AuthGate() {
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const handleAuth = async () => {
      if (typeof window === 'undefined') return;
      
      const url = window.location.href;
      const hash = window.location.hash;
      
      // Check for magic link token in hash (e.g., #access_token=...)
      if (hash && hash.includes('access_token')) {
        setProcessing(true);
        try {
          // Supabase automatically handles the hash, just need to get the session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Magic link auth error:', error.message);
            setProcessing(false);
            return;
          }
          
          if (data.session) {
            // Clean up URL
            window.history.replaceState({}, '', window.location.pathname);
            
            // Check if user needs onboarding
            const { data: profile } = await supabase
              .from('profiles')
              .select('onboarding_completed')
              .eq('id', data.session.user.id)
              .single();
            
            if (!profile || !profile.onboarding_completed) {
              window.location.href = '/onboarding';
            } else {
              window.location.href = '/dashboard';
            }
            return;
          }
        } catch (e) {
          console.error('Auth gate error:', e);
        }
        setProcessing(false);
      }
      
      // Check for PKCE code in query params (e.g., ?code=...)
      if (/[?&]code=/.test(url)) {
        setProcessing(true);
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(url);
          const clean = window.location.origin + window.location.pathname;
          window.history.replaceState({}, '', clean);
          
          if (error) {
            console.error('Auth exchange error:', error.message);
            setProcessing(false);
            return;
          }
          
          if (data.session) {
            // Check if user needs onboarding
            const { data: profile } = await supabase
              .from('profiles')
              .select('onboarding_completed')
              .eq('id', data.session.user.id)
              .single();
            
            if (!profile || !profile.onboarding_completed) {
              window.location.href = '/onboarding';
            } else {
              window.location.href = '/dashboard';
            }
            return;
          }
        } catch (e) {
          console.error('Auth gate error:', e);
        }
        setProcessing(false);
      }
    };

    handleAuth();
    
    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Clean URL if there's auth data in it
        if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show a loading state while processing auth
  if (processing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-muted)]">Signing you in...</p>
        </div>
      </div>
    );
  }

  return null;
}
