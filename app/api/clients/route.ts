import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getPool } from '@/lib/db';

interface ClientRow extends RowDataPacket {
    id: number;
    client_id: string;
    client_name: string;
    client_phone: string | null;
    primary_ip: string | null;
    primary_onu: string | null;
    secondary_ip: string | null;
    secondary_onu: string | null;
    location: string | null;
    poc_id: number | null;
    poc_name: string | null;
    status: 'Connected' | 'Disconnected';
    description: string | null;
    created_at: Date | string;
    updated_at: Date | string;
}

function formatClient(row: ClientRow) {
    return {
        id: Number(row.id),

        clientId: row.client_id,
        clientName: row.client_name,
        clientPhone: row.client_phone,

        primaryIp: row.primary_ip,
        primaryOnu: row.primary_onu,

        secondaryIp: row.secondary_ip,
        secondaryOnu: row.secondary_onu,

        location: row.location,

        pocId: row.poc_id !== null
            ? Number(row.poc_id)
            : null,

        pocName: row.poc_name || null,

        status: row.status,

        description: row.description,

        createdAt: row.created_at
            ? new Date(row.created_at).toISOString()
            : null,

        updatedAt: row.updated_at
            ? new Date(row.updated_at).toISOString()
            : null,
    };
}

function cleanString(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();

    return trimmed || null;
}

function validateStatus(value: unknown) {
    return value === 'Connected' || value === 'Disconnected'
        ? value
        : null;
}

// GET /api/clients
export async function GET() {
    try {
        const pool = getPool();

        const [rows] = await pool.query<ClientRow[]>(
            `
            SELECT
                c.id,
                c.client_id,
                c.client_name,
                c.client_phone,
                c.primary_ip,
                c.primary_onu,
                c.secondary_ip,
                c.secondary_onu,
                c.location,
                c.poc_id,
                p.name AS poc_name,
                c.status,
                c.description,
                c.created_at,
                c.updated_at
            FROM clients c
            LEFT JOIN pocs p
                ON c.poc_id = p.id
            ORDER BY c.id DESC
            `
        );

        return NextResponse.json(
            rows.map(formatClient)
        );
    } catch (error) {
        console.error('GET /api/clients error:', error);

        return NextResponse.json(
            {
                message: 'Failed to load clients.',
            },
            { status: 500 }
        );
    }
}

// POST /api/clients
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const clientId = cleanString(body.clientId);
        const clientName = cleanString(body.clientName);

        if (!clientId) {
            return NextResponse.json(
                { message: 'Client ID is required.' },
                { status: 400 }
            );
        }

        if (!clientName) {
            return NextResponse.json(
                { message: 'Client name is required.' },
                { status: 400 }
            );
        }

        if (clientId.length > 100) {
            return NextResponse.json(
                { message: 'Client ID is too long.' },
                { status: 400 }
            );
        }

        if (clientName.length > 150) {
            return NextResponse.json(
                { message: 'Client name is too long.' },
                { status: 400 }
            );
        }

        const clientPhone = cleanString(body.clientPhone);
        const primaryIp = cleanString(body.primaryIp);
        const primaryOnu = cleanString(body.primaryOnu);
        const secondaryIp = cleanString(body.secondaryIp);
        const secondaryOnu = cleanString(body.secondaryOnu);
        const location = cleanString(body.location);
        const description = cleanString(body.description);

        const status =
            validateStatus(body.status) || 'Connected';

        const pocId =
            body.pocId !== null &&
                body.pocId !== undefined &&
                body.pocId !== ''
                ? Number(body.pocId)
                : null;

        if (
            pocId !== null &&
            (!Number.isInteger(pocId) || pocId <= 0)
        ) {
            return NextResponse.json(
                { message: 'Invalid POC ID.' },
                { status: 400 }
            );
        }

        const pool = getPool();

        // Check duplicate Client ID
        const [existing] = await pool.query<RowDataPacket[]>(
            `
            SELECT id
            FROM clients
            WHERE client_id = ?
            LIMIT 1
            `,
            [clientId]
        );

        if (existing.length > 0) {
            return NextResponse.json(
                {
                    message:
                        'A client with this Client ID already exists.',
                },
                { status: 409 }
            );
        }

        // Validate POC exists
        if (pocId !== null) {
            const [pocRows] = await pool.query<RowDataPacket[]>(
                `
                SELECT id
                FROM pocs
                WHERE id = ?
                LIMIT 1
                `,
                [pocId]
            );

            if (pocRows.length === 0) {
                return NextResponse.json(
                    { message: 'Selected POC does not exist.' },
                    { status: 400 }
                );
            }
        }

        const [result] = await pool.execute<ResultSetHeader>(
            `
            INSERT INTO clients (
                client_id,
                client_name,
                client_phone,
                primary_ip,
                primary_onu,
                secondary_ip,
                secondary_onu,
                location,
                poc_id,
                status,
                description
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                clientId,
                clientName,
                clientPhone,
                primaryIp,
                primaryOnu,
                secondaryIp,
                secondaryOnu,
                location,
                pocId,
                status,
                description,
            ]
        );

        const [rows] = await pool.query<ClientRow[]>(
            `
            SELECT
                c.id,
                c.client_id,
                c.client_name,
                c.client_phone,
                c.primary_ip,
                c.primary_onu,
                c.secondary_ip,
                c.secondary_onu,
                c.location,
                c.poc_id,
                p.name AS poc_name,
                c.status,
                c.description,
                c.created_at,
                c.updated_at
            FROM clients c
            LEFT JOIN pocs p
                ON c.poc_id = p.id
            WHERE c.id = ?
            LIMIT 1
            `,
            [result.insertId]
        );

        return NextResponse.json(
            formatClient(rows[0]),
            { status: 201 }
        );
    } catch (error: any) {
        console.error('POST /api/clients error:', error);

        if (error?.code === 'ER_DUP_ENTRY') {
            return NextResponse.json(
                {
                    message:
                        'A client with this Client ID already exists.',
                },
                { status: 409 }
            );
        }

        if (error?.code === 'ER_NO_REFERENCED_ROW_2') {
            return NextResponse.json(
                {
                    message: 'Selected POC does not exist.',
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                message: 'Failed to create client.',
            },
            { status: 500 }
        );
    }
}