import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getPool } from '@/lib/db';

interface PocRow extends RowDataPacket {
    id: number;
    name: string;
    created_at: Date | string;
    updated_at: Date | string;
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

// GET /api/pocs
export async function GET() {
    try {
        const pool = getPool();

        const [rows] = await pool.query<PocRow[]>(
            `
            SELECT
                id,
                name,
                created_at,
                updated_at
            FROM pocs
            ORDER BY id DESC
            `
        );

        return NextResponse.json(rows.map(formatPoc));
    } catch (error) {
        console.error('GET /api/pocs error:', error);

        return NextResponse.json(
            {
                message: 'Failed to load POCs.',
            },
            { status: 500 }
        );
    }
}

// POST /api/pocs
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const name =
            typeof body.name === 'string'
                ? body.name.trim()
                : '';

        if (!name) {
            return NextResponse.json(
                {
                    message: 'POC name is required.',
                },
                { status: 400 }
            );
        }

        if (name.length > 150) {
            return NextResponse.json(
                {
                    message: 'POC name must be 150 characters or less.',
                },
                { status: 400 }
            );
        }

        const pool = getPool();

        // Check duplicate
        const [existing] = await pool.query<RowDataPacket[]>(
            `
            SELECT id
            FROM pocs
            WHERE LOWER(name) = LOWER(?)
            LIMIT 1
            `,
            [name]
        );

        if (existing.length > 0) {
            return NextResponse.json(
                {
                    message: 'A POC with this name already exists.',
                },
                { status: 409 }
            );
        }

        const [result] = await pool.execute<ResultSetHeader>(
            `
            INSERT INTO pocs (name)
            VALUES (?)
            `,
            [name]
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
            [result.insertId]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                {
                    message: 'POC created but could not be retrieved.',
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            formatPoc(rows[0]),
            { status: 201 }
        );
    } catch (error: any) {
        console.error('POST /api/pocs error:', error);

        // MySQL duplicate key
        if (error?.code === 'ER_DUP_ENTRY') {
            return NextResponse.json(
                {
                    message: 'A POC with this name already exists.',
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                message: 'Failed to create POC.',
            },
            { status: 500 }
        );
    }
}