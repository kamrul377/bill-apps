import { NextRequest, NextResponse } from 'next/server';
import { getBills } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'Approved';

    const bills = await getBills({ status });

    // Generate CSV content
    const headers = ['Ticket ID', 'User ID', 'Amount (TK)', 'Description', 'Date', 'Status', 'Created At'];
    const rows = bills.map((b) => [
      `"${b.ticket_id}"`,
      `"${b.user_id}"`,
      b.amount,
      `"${b.description.replace(/"/g, '""')}"`,
      `"${b.date}"`,
      `"${b.status}"`,
      `"${b.created_at}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="NetBill_${status}_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export CSV error:', error);
    return NextResponse.json({ error: 'Failed to generate CSV export.' }, { status: 500 });
  }
}
