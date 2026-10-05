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

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
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

        pocId:
            row.poc_id !== null
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

function parseId(id: string) {
    const parsed = Number(id);

    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }

    return parsed;
}

function validateStatus(value: unknown) {
    return value === 'Connected' || value === 'Disconnected'
        ? value
        : null;
}

async function getClientById(id: number) {
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
        WHERE c.id = ?
        LIMIT 1
        `,
        [id]
    );

    if (rows.length === 0) {
        return null;
    }

    return formatClient(rows[0]);
}

// GET /api/clients/[id]
export async function GET(
    _request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;
        const clientId = parseId(id);

        if (!clientId) {
            return NextResponse.json(
                { message: 'Invalid client ID.' },
                { status: 400 }
            );
        }

        const client = await getClientById(clientId);

        if (!client) {
            return NextResponse.json(
                { message: 'Client not found.' },
                { status: 404 }
            );
        }

        return NextResponse.json(client);
    } catch (error) {
        console.error(
            'GET /api/clients/[id] error:',
            error
        );

        return NextResponse.json(
            { message: 'Failed to load client.' },
            { status: 500 }
        );
    }
}

// PUT /api/clients/[id]
export async function PUT(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;
        const databaseId = parseId(id);

        if (!databaseId) {
            return NextResponse.json(
                { message: 'Invalid client ID.' },
                { status: 400 }
            );
        }

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

        // Check client exists
        const [currentRows] = await pool.query<RowDataPacket[]>(
            `
            SELECT id
            FROM clients
            WHERE id = ?
            LIMIT 1
            `,
            [databaseId]
        );

        if (currentRows.length === 0) {
            return NextResponse.json(
                { message: 'Client not found.' },
                { status: 404 }
            );
        }

        // Check duplicate Client ID
        const [duplicateRows] = await pool.query<RowDataPacket[]>(
            `
            SELECT id
            FROM clients
            WHERE client_id = ?
              AND id <> ?
            LIMIT 1
            `,
            [clientId, databaseId]
        );

        if (duplicateRows.length > 0) {
            return NextResponse.json(
                {
                    message:
                        'Another client with this Client ID already exists.',
                },
                { status: 409 }
            );
        }

        // Validate POC
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
                    {
                        message:
                            'Selected POC does not exist.',
                    },
                    { status: 400 }
                );
            }
        }

        await pool.execute<ResultSetHeader>(
            `
            UPDATE clients
            SET
                client_id = ?,
                client_name = ?,
                client_phone = ?,
                primary_ip = ?,
                primary_onu = ?,
                secondary_ip = ?,
                secondary_onu = ?,
                location = ?,
                poc_id = ?,
                status = ?,
                description = ?
            WHERE id = ?
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
                databaseId,
            ]
        );

        const updatedClient =
            await getClientById(databaseId);

        return NextResponse.json(updatedClient);
    } catch (error: any) {
        console.error(
            'PUT /api/clients/[id] error:',
            error
        );

        if (error?.code === 'ER_DUP_ENTRY') {
            return NextResponse.json(
                {
                    message:
                        'Another client with this Client ID already exists.',
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
            { message: 'Failed to update client.' },
            { status: 500 }
        );
    }
}

// DELETE /api/clients/[id]
export async function DELETE(
    _request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;
        const clientId = parseId(id);

        if (!clientId) {
            return NextResponse.json(
                { message: 'Invalid client ID.' },
                { status: 400 }
            );
        }

        const pool = getPool();

        const [result] = await pool.execute<ResultSetHeader>(
            `
            DELETE FROM clients
            WHERE id = ?
            `,
            [clientId]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { message: 'Client not found.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Client deleted successfully.',
        });
    } catch (error) {
        console.error(
            'DELETE /api/clients/[id] error:',
            error
        );

        return NextResponse.json(
            { message: 'Failed to delete client.' },
            { status: 500 }
        );
    }
}