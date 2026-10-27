'use client';

import React, { useState, useEffect } from 'react';

export default function GlobalLoader() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Page fully load hole loader hide hoye jabe
        const handleLoad = () => {
            setIsLoading(false);
        };

        if (document.readyState === 'complete') {
            setIsLoading(false);
        } else {
            window.addEventListener('load', handleLoad);
            return () => window.removeEventListener('load', handleLoad);
        }
    }, []);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-950 transition-opacity duration-300">
            <div className="relative flex items-center justify-center">
                {/* Outer glowing pulse ring */}
                <div className="absolute h-16 w-16 rounded-2xl bg-teal-500/20 animate-ping" />
                
                {/* Logo Container */}
                <div className="relative h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex items-center justify-center p-2.5">
                    <img
                        src="/fnf-logo.png"
                        alt="Loading..."
                        className="h-full w-full object-contain animate-pulse"
                    />
                </div>
            </div>
            
            <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400 mt-1">
                FNF Travelpay
            </p>
        </div>
    );
}