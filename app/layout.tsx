import './globals.css';
import NavBar from '../components/NavBar';
import ClientOnly from '../components/ClientOnly';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import AuthGate from '../components/AuthGate';
import { RoleThemeProvider } from '../components/RoleThemeProvider';

export const metadata: Metadata = { title: 'Campus Help', description: 'Uni-only help marketplace' };

type RootLayoutProps = { children: ReactNode };

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className="antialiased text-[var(--text)]">
        <RoleThemeProvider>
          <div className="grain" aria-hidden />
          <div className="relative min-h-dvh flex flex-col">
            <ClientOnly><AuthGate /></ClientOnly>
            <ClientOnly><NavBar /></ClientOnly>
            <main className="flex-1 pt-24 pb-20">{children}</main>
            <footer className="relative z-10 border-t border-[var(--border)]/60 py-8 text-center text-xs text-[color:var(--muted)]">
              © {new Date().getFullYear()} Campus Help. Built by students, for students.
            </footer>
          </div>
        </RoleThemeProvider>
      </body>
    </html>
  );
}