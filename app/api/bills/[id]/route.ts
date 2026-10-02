import { NextRequest, NextResponse } from 'next/server';
import { getBillById, updateBillStatusById } from '@/lib/db';
import { BillStatus } from '@/lib/types';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const billId = Number(id);

        if (!Number.isInteger(billId) || billId <= 0) {
            return NextResponse.json(
                { error: 'Invalid bill ID.' },
                { status: 400 }
            );
        }

        const bill = await getBillById(billId);

        if (!bill) {
            return NextResponse.json(
                { error: `Bill with ID "${billId}" was not found.` },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            bill,
        });
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const billId = Number(id);

        if (!Number.isInteger(billId) || billId <= 0) {
            return NextResponse.json(
                { error: 'Invalid bill ID.' },
                { status: 400 }
            );
        }

        const body = await req.json();

        const {
            status,
            reason,
            approverName,
            paidBy,
            paymentMethod,
            paymentNote,
        } = body;

        if (
            !status ||
            !['Pending', 'Approved', 'Rejected', 'Paid'].includes(status)
        ) {
            return NextResponse.json(
                {
                    error:
                        'Valid status ("Pending", "Approved", "Rejected", "Paid") is required.',
                },
                { status: 400 }
            );
        }

        const result = await updateBillStatusById(
            billId,
            status as BillStatus,
            {
                reason,
                approverName,
                paidBy,
                paymentMethod,
                paymentNote,
            }
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            bill: result.bill,
            message: `Bill ${billId} successfully updated to ${status}.`,
        });
    } catch (error) {
        console.error('Update bill error:', error);

        return NextResponse.json(
            { error: 'Failed to update bill status in MySQL database.' },
            { status: 500 }
        );
    }
}