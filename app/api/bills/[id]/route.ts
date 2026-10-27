





import { NextRequest, NextResponse } from 'next/server';
import { getBillById, updateBillStatusById } from '@/lib/db';
import { getCurrentUser } from '@/lib/server-auth';
import type { BillStatus } from '@/lib/types';

type Context = { params: Promise<{ id: string }> };

const statuses = ['Pending', 'Approved', 'Rejected', 'Paid'];

export async function GET(req: NextRequest, context: Context) {
    const user = await getCurrentUser(req);

    if (!user) {
        return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }

    try {
        const { id } = await context.params;
        const billId = Number(id);

        if (!Number.isSafeInteger(billId) || billId <= 0) {
            return NextResponse.json({ error: 'Invalid bill ID.' }, { status: 400 });
        }

        const bill = await getBillById(billId);

        if (!bill) {
            return NextResponse.json({ error: 'Bill not found.' }, { status: 404 });
        }

        // Support can view only bills created by them.
        if (
            user.role === 'support' &&
            bill.created_by !== user.name
        ) {
            return NextResponse.json({ error: 'Permission denied.' }, { status: 403 });
        }

        return NextResponse.json({ success: true, bill });
    } catch (error) {
        console.error('Get bill error:', error);
        return NextResponse.json({ error: 'Failed to retrieve bill.' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, context: Context) {
    const user = await getCurrentUser(req);

    if (!user) {
        return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }

    try {
        const { id } = await context.params;
        const billId = Number(id);

        if (!Number.isSafeInteger(billId) || billId <= 0) {
            return NextResponse.json({ error: 'Invalid bill ID.' }, { status: 400 });
        }

        const body = await req.json();
        const { status, reason, paymentMethod, paymentNote, approvedAmount } = body;

        if (!statuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid bill status.' }, { status: 400 });
        }

        if (
            (status === 'Approved' || status === 'Rejected') &&
            !['admin', 'manager'].includes(user.role)
        ) {
            return NextResponse.json({ error: 'Permission denied.' }, { status: 403 });
        }

        if (status === 'Paid' && !['admin', 'accounts'].includes(user.role)) {
            return NextResponse.json({ error: 'Permission denied.' }, { status: 403 });
        }

        if (
            status === 'Pending' &&
            !['admin', 'support'].includes(user.role)
        ) {
            return NextResponse.json({ error: 'Permission denied.' }, { status: 403 });
        }

        if (
            approvedAmount !== undefined &&
            (!Number.isFinite(Number(approvedAmount)) || Number(approvedAmount) < 0)
        ) {
            return NextResponse.json({ error: 'Invalid approved amount.' }, { status: 400 });
        }

        const result = await updateBillStatusById(
            billId,
            status as BillStatus,
            {
                reason,
                approverName:
                    status === 'Approved' || status === 'Rejected'
                        ? `${user.name} (${user.role})`
                        : undefined,
                paidBy: status === 'Paid' ? `${user.name} (${user.role})` : undefined,
                paymentMethod,
                paymentNote,
                approvedAmount:
                    approvedAmount === undefined ? undefined : Number(approvedAmount),
            }
        );

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            bill: result.bill,
            message: `Bill ${billId} updated successfully.`,
        });
    } catch (error) {
        console.error('Update bill error:', error);
        return NextResponse.json({ error: 'Failed to update bill.' }, { status: 500 });
    }
}
