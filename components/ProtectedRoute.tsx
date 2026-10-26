// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';

// export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
//     const router = useRouter();
//     const [isAuthorized, setIsAuthorized] = useState(false);

//     useEffect(() => {
//         const user = sessionStorage.getItem('netbill_session_user');
//         if (!user) {
//             router.replace('/');
//         } else {
//             setIsAuthorized(true);
//         }
//     }, [router]);

//     if (!isAuthorized) {
//         return null; // অথবা লোডিং স্পিনার দিতে পারেন
//     }

//     return <>{children}</>;
// }





'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        let active = true;

        async function verifySession() {
            try {
                const response = await fetch('/api/auth/session', {
                    method: 'GET',
                    credentials: 'same-origin',
                    cache: 'no-store',
                });

                if (!response.ok) {
                    if (active) {
                        router.replace('/');
                    }
                    return;
                }

                const data = await response.json();

                if (active && data.user) {
                    setIsAuthorized(true);
                } else if (active) {
                    router.replace('/');
                }
            } catch (error) {
                console.error('Session verification failed:', error);
                // Network error হলে user-কে সঙ্গে সঙ্গে logout না করে
                // access বন্ধ রাখবে।
            }
        }

        verifySession();

        return () => {
            active = false;
        };
    }, [router]);

    if (!isAuthorized) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                    <p className="text-sm text-gray-500">
                        Verifying session...
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
