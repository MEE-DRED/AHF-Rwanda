import { NextResponse } from 'next/server';
import { serviceClient } from '@/lib/supabase/service';
import { validateSubmission } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: bots fill this hidden field. Pretend success, save nothing.
  if (body && typeof body === 'object' && (body as Record<string, unknown>).website) {
    return NextResponse.json({ ok: true });
  }

  const result = validateSubmission(body);
  if (!result.ok) return NextResponse.json({ ok: false, errors: result.errors }, { status: 400 });

  try {
    const { error } = await serviceClient()
      .from('questions')
      .insert({ ...result.data, status: 'Pending', answered_by: null });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Insert failed:', err instanceof Error ? err.message : 'unknown error');
    return NextResponse.json({ ok: false, error: 'Could not save your question.' }, { status: 500 });
  }
}
