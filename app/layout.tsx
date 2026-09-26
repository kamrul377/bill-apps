import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'FnF Online Ops - ISP Bill Management',
  description: 'Internal ISP bill management system for Support bill creation, Manager approvals, Accounts reconciliation, and Admin governance.',
  openGraph: {
    title: 'FnF Online Ops - ISP Bill Management',
    description: 'Internal ISP bill management system for Support bill creation, Manager approvals, Accounts reconciliation, and Admin governance.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FnF Online Ops - ISP Bill Management',
    description: 'Internal ISP bill management system for Support bill creation, Manager approvals, Accounts reconciliation, and Admin governance.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface font-body-md text-on-surface antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
