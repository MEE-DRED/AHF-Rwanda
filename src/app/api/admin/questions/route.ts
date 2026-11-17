import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/supabase/auth';
import { fetchAllQuestions } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await getAdminUser())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ questions: await fetchAllQuestions() });
  } catch (err) {
    console.error('Fetch failed:', err instanceof Error ? err.message : 'unknown error');
    return NextResponse.json({ error: 'Could not load questions.' }, { status: 500 });
  }
}
