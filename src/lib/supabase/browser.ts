import { createBrowserClient } from '@supabase/ssr';

// Browser client: used ONLY for admin sign-in/sign-out. It cannot read the questions table (RLS).
export function browserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
