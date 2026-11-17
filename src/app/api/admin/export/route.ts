import ExcelJS from 'exceljs';
import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/supabase/auth';
import { fetchAllQuestions } from '@/lib/supabase/service';
import { RESPONDENTS, GENDERS } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Stop Excel treating text as a formula (CSV/formula injection).
function safe(text: string): string {
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

function kigali(iso: string): string {
  return new Date(iso).toLocaleString('sv-SE', { timeZone: 'Africa/Kigali' }); // yyyy-mm-dd hh:mm:ss
}

export async function GET() {
  if (!(await getAdminUser())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const rows = await fetchAllQuestions();
    const wb = new ExcelJS.Workbook();
    wb.created = new Date();

    // ---- Summary sheet ----
    const s = wb.addWorksheet('Summary');
    s.columns = [{ width: 30 }, { width: 14 }, { width: 14 }, { width: 14 }];
    const bold = (r: ExcelJS.Row) => (r.font = { bold: true });
    const count = (f: (q: (typeof rows)[number]) => boolean) => rows.filter(f).length;

    bold(s.addRow(['AHF Rwanda - Student Q&A summary']));
    s.addRow(['Generated (Africa/Kigali)', kigali(new Date().toISOString())]);
    s.addRow([]);
    bold(s.addRow(['Total questions', rows.length]));
    s.addRow([]);
    bold(s.addRow(['By gender', 'Total']));
    GENDERS.forEach((g) => s.addRow([g, count((q) => q.gender === g)]));
    s.addRow([]);
    bold(s.addRow(['By status', 'Total']));
    (['Pending', 'Answered'] as const).forEach((st) => s.addRow([st, count((q) => q.status === st)]));
    s.addRow([]);
    bold(s.addRow(['Gender x status', 'Pending', 'Answered']));
    GENDERS.forEach((g) =>
      s.addRow([
        g,
        count((q) => q.gender === g && q.status === 'Pending'),
        count((q) => q.gender === g && q.status === 'Answered'),
      ])
    );
    s.addRow([]);
    bold(s.addRow(['Answered by', 'Total']));
    RESPONDENTS.forEach((r) => s.addRow([r, count((q) => q.answered_by === r)]));

    // ---- Detailed records ----
    const d = wb.addWorksheet('Questions', { views: [{ state: 'frozen', ySplit: 1 }] });
    d.columns = [
      { header: 'Submission ID', key: 'id', width: 38 },
      { header: 'Nickname', key: 'nickname', width: 20 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Avatar', key: 'avatar', width: 8 },
      { header: 'Question', key: 'question', width: 80 },
      { header: 'Submitted (Africa/Kigali)', key: 'created_at', width: 22 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Answered by', key: 'answered_by', width: 14 },
    ];
    d.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    d.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF921B21' } };
    rows.forEach((q) =>
      d.addRow({
        id: q.id,
        nickname: safe(q.nickname),
        gender: q.gender,
        avatar: q.avatar,
        question: safe(q.question),
        created_at: kigali(q.created_at),
        status: q.status,
        answered_by: q.answered_by ?? '',
      })
    );
    d.getColumn('question').alignment = { wrapText: true, vertical: 'top' };
    d.autoFilter = { from: 'A1', to: 'H1' };

    const buffer = await wb.xlsx.writeBuffer();
    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="ahf-rwanda-questions-${stamp}.xlsx"`,
      },
    });
  } catch (err) {
    console.error('Export failed:', err instanceof Error ? err.message : 'unknown error');
    return NextResponse.json({ error: 'Could not generate the export.' }, { status: 500 });
  }
}
