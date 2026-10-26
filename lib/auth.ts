
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

export const SESSION_COOKIE = 'netbill_session_user';

const SESSION_MAX_AGE = 8 * 60 * 60;

export type SessionUser = {
    id: number;
    user_id: string;
    name: string;
    role: 'admin' | 'manager' | 'support' | 'accounts';
    exp: number;
};

function getSecret(): string {
    const secret = process.env.SESSION_SECRET;

    if (!secret || secret.length < 32) {
        throw new Error('SESSION_SECRET must be at least 32 characters.');
    }

    return secret;
}

export function createSessionToken(
    user: Omit<SessionUser, 'exp'>
): string {
    const payload = Buffer.from(
        JSON.stringify({
            ...user,
            exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
        })
    ).toString('base64url');

    const signature = createHmac('sha256', getSecret())
        .update(payload)
        .digest('base64url');

    return `${payload}.${signature}`;
}

export function verifySessionToken(
    token?: string
): SessionUser | null {
    try {
        if (!token) return null;

        const parts = token.split('.');
        if (parts.length !== 2) return null;

        const [payload, signature] = parts;

        const expected = createHmac('sha256', getSecret())
            .update(payload)
            .digest();

        const actual = Buffer.from(signature, 'base64url');

        if (
            actual.length !== expected.length ||
            !timingSafeEqual(actual, expected)
        ) {
            return null;
        }

        const user = JSON.parse(
            Buffer.from(payload, 'base64url').toString('utf8')
        ) as SessionUser;

        if (
            !user.id ||
            !user.user_id ||
            !user.name ||
            !['admin', 'manager', 'support', 'accounts'].includes(user.role) ||
            !Number.isFinite(user.exp) ||
            user.exp <= Math.floor(Date.now() / 1000)
        ) {
            return null;
        }

        return user;
    } catch {
        return null;
    }
}

export function getSessionUser(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    return verifySessionToken(token);
}

export { SESSION_MAX_AGE };
