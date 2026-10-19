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


// =============2nd=============


// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//     const { pathname } = request.nextUrl;

//     // কুকি থেকে ইউজার সেশন ডাটা রিড করা
//     const userCookie = request.cookies.get('netbill_session_user');

//     // /client-info সিকিউরিটি (লগইন না থাকলে হোমপেজে পাঠাবে)
//     if (pathname.startsWith('/client-info') && !userCookie) {
//         return NextResponse.redirect(new URL('/', request.url));
//     }

//     // /paid-history সিকিউরিটি (লগইন না থাকলে বা Accounts/Admin রোল না হলে আটকে দিবে)
//     if (pathname.startsWith('/paid-history')) {
//         if (!userCookie || !userCookie.value) {
//             return NextResponse.redirect(new URL('/', request.url));
//         }

//         try {
//             const userData = JSON.parse(userCookie.value);
//             const role = userData?.role;

//             // যদি রোল admin বা accounts না হয়
//             if (role !== 'admin' && role !== 'accounts') {
//                 return NextResponse.redirect(new URL('/', request.url));
//             }
//         } catch (error) {
//             return NextResponse.redirect(new URL('/', request.url));
//         }
//     }

//     return NextResponse.next();
// }

// export const config = {
//     matcher: ['/client-info/:path*', '/paid-history/:path*'],
// };