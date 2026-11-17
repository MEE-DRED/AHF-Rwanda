import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/supabase/auth';
import { serviceClient } from '@/lib/supabase/service';
import { UUID_RE, validateUpdate } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await getAdminUser())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!UUID_RE.test(params.id)) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const result = validateUpdate(body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  const { data, error } = await serviceClient()
    .from('questions')
    .update(result.data)
    .eq('id', params.id)
    .select('*')
    .maybeSingle();

  if (error) {
    console.error('Update failed:', error.message);
    return NextResponse.json({ error: 'Could not update the question.' }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Question not found.' }, { status: 404 });
  return NextResponse.json({ question: data });
}
