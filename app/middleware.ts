import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // কুকি থেকে টোকেন বা সেশন চেক করুন
    const userCookie = request.cookies.get('netbill_session_user');

    // ইউজার যদি /client-info তে ঢুকতে চায় এবং লগইন না থাকে
    if (request.nextUrl.pathname.startsWith('/client-info') && !userCookie) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/client-info/:path*'],
};