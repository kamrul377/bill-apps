
import type { NextRequest } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { getPool } from '@/lib/db';

export type CurrentUser = {
    id: number;
    user_id: string;
    name: string;
    role: 'admin' | 'manager' | 'support' | 'accounts';
};

interface UserRow extends RowDataPacket {
    id: number;
    user_id: string;
    name: string;
    role: CurrentUser['role'];
}

export async function getCurrentUser(
    req: NextRequest
): Promise<CurrentUser | null> {
    try {
        const token = req.cookies.get('netbill_session_user')?.value;

        if (!token) return null;

        // Verify signature and expiry using the existing helper.
        const { verifySessionToken } = await import('@/lib/auth');
        const session = verifySessionToken(token);

        if (!session) return null;

        // Query the database directly; do not trust the role inside the cookie.
        const pool = getPool();

        const [rows] = await pool.execute<UserRow[]>(
            `SELECT id, user_id, name, role
       FROM users
       WHERE id = ?
       LIMIT 1`,
            [session.id]
        );

        if (rows.length !== 1) return null;

        const user = rows[0];
        const validRoles = ['admin', 'manager', 'support', 'accounts'];

        if (
            user.user_id !== session.user_id ||
            !validRoles.includes(user.role)
        ) {
            return null;
        }

        return {
            id: Number(user.id),
            user_id: user.user_id,
            name: user.name,
            role: user.role,
        };
    } catch (error) {
        console.error('Current-user verification failed:', error);
        return null;
    }
}

export function unauthorized() {
    return Response.json(
        { success: false, error: 'Please log in.' },
        { status: 401 }
    );
}

export function forbidden() {
    return Response.json(
        { success: false, error: 'You do not have permission.' },
        { status: 403 }
    );
}
