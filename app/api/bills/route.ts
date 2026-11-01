




import { NextRequest, NextResponse } from 'next/server';
import {
  createBill,
  getBills,
  getDashboardStats,
  updateBillsBatch,
} from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import type { UserRole } from '@/lib/types';

// ==========================================
// AUTHENTICATION HELPER
// ==========================================
function unauthorized() {
  return NextResponse.json(
    { success: false, error: 'Unauthorized. Please log in.' },
    { status: 401 }
  );
}

function forbidden() {
  return NextResponse.json(
    { success: false, error: 'You do not have permission for this action.' },
    { status: 403 }
  );
}

// ==========================================
// 1. GET: Fetch Bills & Dashboard Stats
// ==========================================
export async function GET(req: NextRequest) {
  try {
    const user = getSessionUser(req);

    if (!user) return unauthorized();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    // Never trust role/user identity supplied in URL query parameters.
    const role = user.role as UserRole;
    const currentUserId = user.user_id;
    const currentUserName = user.name;

    const [bills, stats] = await Promise.all([
      getBills({
        status,
        search,
        role,
        currentUserId,
        currentUserName,
      }),
      getDashboardStats({
        role,
        currentUserId,
        currentUserName,
      }),
    ]);

    return NextResponse.json({
      success: true,
      bills,
      stats,
    });
  } catch (error) {
    console.error('Fetch bills error:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to retrieve bills.' },
      { status: 500 }
    );
  }
}

// ==========================================
// 2. POST: Create Single Bill
// ==========================================
export async function POST(req: NextRequest) {
  try {
    const user = getSessionUser(req);

    if (!user) return unauthorized();

    // Only authorized roles may create bills.
    if (!['admin', 'support', 'accounts','manager'].includes(user.role)) {
      return forbidden();
    }

    const body = await req.json();

    const {
      ticket_id,
      user_id,
      amount,
      category_id,
      description,
      date,
    } = body;

    if (
      !ticket_id ||
      !user_id ||
      amount === undefined ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0
    ) {
      return NextResponse.json(
        { success: false, error: 'Valid ticket ID, user ID, and amount are required.' },
        { status: 400 }
      );
    }

    // Use the authenticated user's identity, not body.created_by.
    const result = await createBill({
      ticket_id,
      user_id,
      amount: Number(amount),
      category_id: category_id ? Number(category_id) : 1,
      description,
      date,
      created_by: user.name,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
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
      { success: false, error: 'Failed to create bill.' },
      { status: 500 }
    );
  }
}

// ==========================================
// 3. PATCH: Batch Approve / Reject / Pay
// ==========================================
export async function PATCH(req: NextRequest) {
  try {
    const user = getSessionUser(req);

    if (!user) return unauthorized();

    const body = await req.json();

    const {
      billIds,
      status,
      actionBy,
      approvedAmount,
    } = body;

    if (!Array.isArray(billIds) || billIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No bill IDs provided.' },
        { status: 400 }
      );
    }

    const numericIds = billIds.map(Number);

    if (
      numericIds.some(
        (id: number) => !Number.isSafeInteger(id) || id <= 0
      )
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid bill IDs.' },
        { status: 400 }
      );
    }

    if (!['Approved', 'Rejected', 'Paid'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid bill status.' },
        { status: 400 }
      );
    }

    // Enforce role permissions on the server.
    if (
      (status === 'Approved' || status === 'Rejected') &&
      !['admin', 'manager'].includes(user.role)
    ) {
      return forbidden();
    }

    if (status === 'Paid' && !['admin', 'accounts'].includes(user.role)) {
      return forbidden();
    }

    if (
      status === 'Approved' &&
      approvedAmount !== undefined &&
      (!Number.isFinite(Number(approvedAmount)) || Number(approvedAmount) < 0)
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid approved amount.' },
        { status: 400 }
      );
    }

    // Never trust approverUserId/actionBy sent by the browser.
    const result = await updateBillsBatch(numericIds, status, {
      paidBy: `${user.name} (${user.role})`,
      approverUserId:
        status === 'Approved' || status === 'Rejected'
          ? user.id
          : undefined,
      approvedAmount:
        approvedAmount !== undefined
          ? Number(approvedAmount)
          : undefined,
    });

    return NextResponse.json({
      success: true,
      message: `${result.updatedCount} bills updated to ${status} successfully.`,
      result,
    });
  } catch (error) {
    console.error('Batch update error:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to process bulk operation.' },
      { status: 500 }
    );
  }
}
