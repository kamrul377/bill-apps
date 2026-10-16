import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getPool } from '@/lib/db';

interface ActivityLogRow extends RowDataPacket {
    id: number;
    action: 'CREATE_CLIENT' | 'UPDATE_CLIENT' | 'DELETE_CLIENT';
    client_id: string;
    client_name: string;
    details: string | null;
    performed_by: string;
    created_at: Date | string;
}

function formatLog(row: ActivityLogRow) {
    return {
        id: Number(row.id),
        action: row.action,
        clientId: row.client_id,
        clientName: row.client_name,
        details: row.details,
        performedBy: row.performed_by,
        createdAt: row.created_at
            ? new Date(row.created_at).toISOString()
            : null,
    };
}

function cleanString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed || null;
}

// GET /api/logs
export async function GET() {
    try {
        const pool = getPool();
        const [rows] = await pool.query<ActivityLogRow[]>(
            `
            SELECT 
                id,
                action,
                client_id,
                client_name,
                details,
                performed_by,
                created_at
            FROM activity_logs
            ORDER BY id DESC
            LIMIT 100
            `
        );

        return NextResponse.json(rows.map(formatLog));
    } catch (error) {
        console.error('GET /api/logs error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch activity logs.' },
            { status: 500 }
        );
    }
}

// POST /api/logs
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const action = body.action;
        const clientId = cleanString(body.clientId);
        const clientName = cleanString(body.clientName);
        const details = cleanString(body.details);
        const performedBy = cleanString(body.performedBy) || 'Admin';

        if (!action || !['CREATE_CLIENT', 'UPDATE_CLIENT', 'DELETE_CLIENT'].includes(action)) {
            return NextResponse.json(
                { message: 'Valid action type is required.' },
                { status: 400 }
            );
        }

        if (!clientId || !clientName) {
            return NextResponse.json(
                { message: 'Client ID and Client Name are required for logs.' },
                { status: 400 }
            );
        }

        const pool = getPool();

        await pool.execute<ResultSetHeader>(
            `
            INSERT INTO activity_logs (
                action,
                client_id,
                client_name,
                details,
                performed_by
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [action, clientId, clientName, details, performedBy]
        );

        return NextResponse.json(
            { success: true, message: 'Activity log recorded successfully.' },
            { status: 201 }
        );
    } catch (error) {
        console.error('POST /api/logs error:', error);
        return NextResponse.json(
            { message: 'Failed to record activity log.' },
            { status: 500 }
        );
    }
}