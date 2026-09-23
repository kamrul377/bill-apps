import { NextRequest, NextResponse } from 'next/server';
import { createBill, getBills, getDashboardStats } from '@/lib/db';
import { UserRole } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const role = (searchParams.get('role') as UserRole) || undefined;
    const currentUserId = searchParams.get('userId') || undefined;

    const bills = await getBills({
      status,
      search,
      role,
      currentUserId,
    });

    const stats = await getDashboardStats();

    return NextResponse.json({
      success: true,
      bills,
      stats,
    });
  } catch (error) {
    console.error('Fetch bills error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve bills from MySQL database.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticket_id, user_id, amount, description, date, created_by } = body;

    const result = await createBill({
      ticket_id,
      user_id,
      amount,
      description,
      date,
      created_by,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        bill: result.bill,
        message: `Bill ${result.bill?.ticket_id} created successfully with PENDING status.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create bill error:', error);
    return NextResponse.json(
      { error: 'Failed to create bill in MySQL database.' },
      { status: 500 }
    );
  }
}
