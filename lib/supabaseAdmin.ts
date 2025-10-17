'use server';
// lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export async function getSupabaseAdmin(): Promise<SupabaseClient> {
  if (!cachedClient) {
    cachedClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return cachedClient;
}