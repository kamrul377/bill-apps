import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2/promise';
import { getPool } from '@/lib/db';

function csvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }

  return `"${String(value).replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const statusParam = searchParams.get('status');

    const status =
      statusParam?.toLowerCase() === 'paid'
        ? 'Paid'
        : 'Approved';

    console.log('EXPORT STATUS:', status);

    const pool = getPool();

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        b.id,
        b.ticket_id,
        b.user_id,
        b.amount,
        b.description,
        b.category_id,
        COALESCE(c.name, 'Others') AS category_name,
        DATE_FORMAT(b.date, '%Y-%m-%d') AS bill_date,
        b.status,
        b.created_by,
        b.paid_by,
        b.paid_at,
        b.payment_method,
        b.payment_note,
        b.created_at,
        b.updated_at
      FROM bills b
      LEFT JOIN bill_categories c
        ON b.category_id = c.id
      WHERE UPPER(b.status) = UPPER(?)
      ORDER BY b.date DESC, b.id DESC
      `,
      [status]
    );

    console.log('EXPORT ROW COUNT:', rows.length);

    const headers = [
      'ID',
      'Ticket ID',
      'User ID',
      'Amount (TK)',
      'Description',
      'Category',
      'Date',
      'Status',
      'Created By',
      'Paid By',
      'Paid At',
      'Payment Method',
      'Payment Note',
      'Created At',
      'Updated At',
    ];

    const csvRows = rows.map((row) => [
      csvValue(row.id),
      csvValue(row.ticket_id),
      csvValue(row.user_id),
      csvValue(row.amount),
      csvValue(row.description),
      csvValue(row.category_name),
      csvValue(row.bill_date),
      csvValue(row.status),
      csvValue(row.created_by),
      csvValue(row.paid_by),
      csvValue(row.paid_at),
      csvValue(row.payment_method),
      csvValue(row.payment_note),
      csvValue(row.created_at),
      csvValue(row.updated_at),
    ]);

    const csvContent = [
      headers.map(csvValue).join(','),
      ...csvRows.map((row) => row.join(',')),
    ].join('\r\n');

    const filename =
      `FNFOnline_${status}_Audit_Ledger_` +
      `${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse('\uFEFF' + csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('EXPORT CSV ERROR:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate CSV export.',
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}