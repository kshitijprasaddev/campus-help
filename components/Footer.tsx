'use client';

import Link from 'next/link';

const FOOTER_LINKS = {
  Platform: [
    { label: 'Find Tutors', href: '/tutors' },
    { label: 'Post Request', href: '/request/new' },
    { label: 'Programs', href: '/programs' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
  Account: [
    { label: 'Sign In', href: '/signin' },
    { label: 'Create Account', href: '/signup' },
    { label: 'My Profile', href: '/profile' },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-32 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand section */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-thi-blue/10 dark:bg-[var(--primary)]/10 text-thi-blue dark:text-[var(--primary)] border border-thi-blue/20 dark:border-[var(--primary)]/20 transition-all duration-300 group-hover:scale-110">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M4 9.5L12 4L20 9.5V19.5C20 20.0523 19.5523 20.5 19 20.5H5C4.44772 20.5 4 20.0523 4 19.5V9.5Z" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M9 20.5V13.5H15V20.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
              <span className="text-xl font-bold">Campus Help</span>
            </Link>
            
            <p className="text-sm text-[var(--text-muted)] max-w-sm leading-relaxed">
              Connecting students with verified tutors. Post requests, browse availability, and book sessions instantly.
            </p>
          </div>

          {/* Links sections */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider">{title}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--text-muted)]">
            © {currentYear} Campus Help. Built for students.
          </p>
          
          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
