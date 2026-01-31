import './globals.css';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import ClientOnly from '../components/ClientOnly';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import AuthGate from '../components/AuthGate';
import { RoleThemeProvider } from '../components/RoleThemeProvider';

export const metadata: Metadata = { 
  title: 'Campus Help | Find Your Perfect Tutor',
  description: 'Connect with verified campus tutors instantly. Post requests, browse availability, and book sessions.' 
};

type RootLayoutProps = { children: ReactNode };

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (stored === 'dark' || (!stored && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <RoleThemeProvider>
          <div className="relative min-h-dvh flex flex-col">
            <ClientOnly><AuthGate /></ClientOnly>
            <ClientOnly><NavBar /></ClientOnly>
            <main className="flex-1 pt-24 pb-20">{children}</main>
            <ClientOnly><Footer /></ClientOnly>
          </div>
        </RoleThemeProvider>
      </body>
    </html>
  );
}