import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getPool } from '@/lib/db';

interface PocRow extends RowDataPacket {
    id: number;
    name: string;
    created_at: Date | string;
    updated_at: Date | string;
}

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

function formatPoc(row: PocRow) {
    return {
        id: Number(row.id),
        name: String(row.name),
        createdAt: row.created_at
            ? new Date(row.created_at).toISOString()
            : null,
        updatedAt: row.updated_at
            ? new Date(row.updated_at).toISOString()
            : null,
    };
}

function parseId(id: string) {
    const parsed = Number(id);

    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }

    return parsed;
}

// GET /api/pocs/[id]
export async function GET(
    _request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;
        const pocId = parseId(id);

        if (!pocId) {
            return NextResponse.json(
                { message: 'Invalid POC ID.' },
                { status: 400 }
            );
        }

        const pool = getPool();

        const [rows] = await pool.query<PocRow[]>(
            `
            SELECT
                id,
                name,
                created_at,
                updated_at
            FROM pocs
            WHERE id = ?
            LIMIT 1
            `,
            [pocId]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                { message: 'POC not found.' },
                { status: 404 }
            );
        }

        return NextResponse.json(formatPoc(rows[0]));
    } catch (error) {
        console.error('GET /api/pocs/[id] error:', error);

        return NextResponse.json(
            { message: 'Failed to load POC.' },
            { status: 500 }
        );
    }
}

// PUT /api/pocs/[id]
export async function PUT(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;
        const pocId = parseId(id);

        if (!pocId) {
            return NextResponse.json(
                { message: 'Invalid POC ID.' },
                { status: 400 }
            );
        }

        const body = await request.json();

        const name =
            typeof body.name === 'string'
                ? body.name.trim()
                : '';

        if (!name) {
            return NextResponse.json(
                { message: 'POC name is required.' },
                { status: 400 }
            );
        }

        if (name.length > 150) {
            return NextResponse.json(
                {
                    message:
                        'POC name must be 150 characters or less.',
                },
                { status: 400 }
            );
        }

        const pool = getPool();

        // Check current POC
        const [currentRows] = await pool.query<RowDataPacket[]>(
            `
            SELECT id
            FROM pocs
            WHERE id = ?
            LIMIT 1
            `,
            [pocId]
        );

        if (currentRows.length === 0) {
            return NextResponse.json(
                { message: 'POC not found.' },
                { status: 404 }
            );
        }

        // Check duplicate name
        const [duplicateRows] = await pool.query<RowDataPacket[]>(
            `
            SELECT id
            FROM pocs
            WHERE LOWER(name) = LOWER(?)
              AND id <> ?
            LIMIT 1
            `,
            [name, pocId]
        );

        if (duplicateRows.length > 0) {
            return NextResponse.json(
                {
                    message:
                        'Another POC with this name already exists.',
                },
                { status: 409 }
            );
        }

        await pool.execute<ResultSetHeader>(
            `
            UPDATE pocs
            SET name = ?
            WHERE id = ?
            `,
            [name, pocId]
        );

        const [rows] = await pool.query<PocRow[]>(
            `
            SELECT
                id,
                name,
                created_at,
                updated_at
            FROM pocs
            WHERE id = ?
            LIMIT 1
            `,
            [pocId]
        );

        return NextResponse.json(formatPoc(rows[0]));
    } catch (error: any) {
        console.error('PUT /api/pocs/[id] error:', error);

        if (error?.code === 'ER_DUP_ENTRY') {
            return NextResponse.json(
                {
                    message: 'A POC with this name already exists.',
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: 'Failed to update POC.' },
            { status: 500 }
        );
    }
}

// DELETE /api/pocs/[id]
export async function DELETE(
    _request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;
        const pocId = parseId(id);

        if (!pocId) {
            return NextResponse.json(
                { message: 'Invalid POC ID.' },
                { status: 400 }
            );
        }

        const pool = getPool();

        const [result] = await pool.execute<ResultSetHeader>(
            `
            DELETE FROM pocs
            WHERE id = ?
            `,
            [pocId]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { message: 'POC not found.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'POC deleted successfully.',
        });
    } catch (error) {
        console.error('DELETE /api/pocs/[id] error:', error);

        return NextResponse.json(
            { message: 'Failed to delete POC.' },
            { status: 500 }
        );
    }
}