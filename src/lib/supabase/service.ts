import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Question } from '../types';

// Service-role client. SERVER ONLY: bypasses RLS. Never import from client components.
export function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase environment variables are not configured.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// Supabase returns at most 1000 rows per request, so page through everything.
export async function fetchAllQuestions(): Promise<Question[]> {
  const db = serviceClient();
  const pageSize = 1000;
  const all: Question[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await db
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false })
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    all.push(...((data ?? []) as Question[]));
    if (!data || data.length < pageSize) break;
  }
  return all;
}
