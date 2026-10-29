/**
 * supabase.ts — Supabase JS client (Auth only)
 *
 * We use Supabase exclusively for authentication:
 *   - Email + Password sign-up / sign-in
 *   - Google OAuth
 *   - Password reset emails (built-in)
 *   - Session management (auto token refresh)
 *
 * All data (study plans, chat, stats) still goes through our FastAPI backend.
 * The Supabase JWT is forwarded as a Bearer token so FastAPI can verify it.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.\n' +
    'Get them from: Supabase → Project Settings → API'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,      // Keep user logged in across refreshes
    autoRefreshToken: true,    // Auto-renew JWT before it expires
    detectSessionInUrl: true,  // Needed for OAuth + magic link callbacks
  },
});
