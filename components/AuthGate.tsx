'use client';
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AuthGate() {
  useEffect(() => {
    (async () => {
      try {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        if (url && /[?&]code=/.test(url)) {
          const { error } = await supabase.auth.exchangeCodeForSession(url);
          // Remove query params from URL after exchange
          const clean = window.location.origin + window.location.pathname;
          window.history.replaceState({}, '', clean);
          if (error) console.error('Auth exchange error:', error.message);
        }
      } catch (e) {
        console.error('Auth gate error', e);
      }
    })();
  }, []);

  return null;
}
