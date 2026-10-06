'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const user = sessionStorage.getItem('netbill_session_user');
        if (!user) {
            router.replace('/');
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    if (!isAuthorized) {
        return null; // অথবা লোডিং স্পিনার দিতে পারেন
    }

    return <>{children}</>;
}