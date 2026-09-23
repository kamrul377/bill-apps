import { NextRequest, NextResponse } from 'next/server';
import { getBillByTicketId, updateBillStatus } from '@/lib/db';
import { BillStatus } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    const bill = await getBillByTicketId(ticketId);

    if (!bill) {
      return NextResponse.json(
        { error: `Bill with ticket ID "${ticketId}" was not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, bill });
  } catch (error) {
    console.error('Get bill error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve bill from MySQL database.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    const body = await req.json();
    const { status, reason, approverName } = body;

    if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status ("Pending", "Approved", "Rejected") is required.' },
        { status: 400 }
      );
    }

    const result = await updateBillStatus(ticketId, status as BillStatus, {
      reason,
      approverName,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      bill: result.bill,
      message: `Bill ${ticketId} successfully updated to ${status}.`,
    });
  } catch (error) {
    console.error('Update bill error:', error);
    return NextResponse.json(
      { error: 'Failed to update bill status in MySQL database.' },
      { status: 500 }
    );
  }
}
