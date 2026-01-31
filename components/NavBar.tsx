'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import RoleModeSwitcher from './RoleModeSwitcher';
import ThemeToggle from './ThemeToggle';
import { useRoleTheme } from './RoleThemeProvider';

type Role = 'learner' | 'tutor';

type NavigationLink = { href: string; label: string; auth?: 'protected' | 'public'; roles?: Role[] };

const NAV_LINKS: NavigationLink[] = [
  { href: '/programs', label: 'Programs' },
  { href: '/tutors', label: 'Tutors' },
  { href: '/request/new', label: 'Post', auth: 'protected', roles: ['learner'] },
  { href: '/dashboard', label: 'Dashboard', auth: 'protected' },
  { href: '/my', label: 'My items', auth: 'protected' },
  { href: '/profile', label: 'Profile', auth: 'protected' },
];

export default function NavBar() {
  const pathname = usePathname();
  const { role } = useRoleTheme();
  const [email, setEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sync = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      setEmail(user?.email ?? null);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle<{ full_name: string | null }>();
        setDisplayName(profile?.full_name ?? user.email ?? null);
      } else {
        setDisplayName(null);
      }
    };

    const { data: subscription } = supabase.auth.onAuthStateChange(() => sync());
    sync();
    return () => subscription?.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function signOut() {
    await supabase.auth.signOut();
    location.href = '/';
  }

  const filteredLinks = useMemo(() => {
    return NAV_LINKS.filter(link => {
      if (link.roles && role && !link.roles.includes(role)) return false;
      if (!link.auth) return true;
      if (link.auth === 'protected') return !!email;
      if (link.auth === 'public') return !email;
      return true;
    });
  }, [email, role]);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  }

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[var(--bg)]/90 backdrop-blur-xl border-b border-[var(--border)] shadow-sm' : 'bg-transparent'}`}>
      <div className="container flex h-[72px] items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3 font-semibold tracking-tight">
          <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-thi-blue/10 dark:bg-[var(--primary)]/20 text-thi-blue dark:text-[var(--primary)] border border-thi-blue/20 dark:border-[var(--primary)]/20 transition-all duration-300 group-hover:scale-110">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 9.5L12 4L20 9.5V19.5C20 20.0523 19.5523 20.5 19 20.5H5C4.44772 20.5 4 20.0523 4 19.5V9.5Z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M9 20.5V13.5H15V20.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          <span className="font-bold text-lg transition-colors duration-300">Campus Help</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          {filteredLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${isActive(link.href) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3 text-sm">
          <ThemeToggle />
          {email && <RoleModeSwitcher />}
          {displayName && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)]">
              <div className="w-6 h-6 rounded-full bg-thi-blue dark:bg-[var(--primary)] flex items-center justify-center text-[10px] font-bold text-white">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-[var(--text-muted)] text-xs">{displayName.split(' ')[0]}</span>
            </div>
          )}
          {email ? (
            <button onClick={signOut} className="btn-ghost">Sign out</button>
          ) : (
            <>
              <Link href="/signin" className="btn-ghost">Sign in</Link>
              <Link href="/signup" className="btn">Get Started</Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] transition-all"
          onClick={() => setMenuOpen(v => !v)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className={`transition-transform duration-300 ${menuOpen ? 'rotate-90' : ''}`}>
            {menuOpen ? (
              <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            ) : (
              <>
                <path d="M4 6H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                <path d="M4 12H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                <path d="M4 18H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-[var(--border)] bg-[var(--bg)]/98 backdrop-blur-xl">
          <div className="container py-6 space-y-4">
            <nav className="grid gap-2 text-sm">
              {filteredLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${isActive(link.href) ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <ThemeToggle />
              {email && <RoleModeSwitcher />}
              {displayName && <span className="text-[var(--text-muted)]">Hi, {displayName}</span>}
            </div>
            <div className="flex flex-col gap-2">
              {email ? (
                <button onClick={signOut} className="btn-ghost">Sign out</button>
              ) : (
                <>
                  <Link href="/signin" className="btn-ghost">Sign in</Link>
                  <Link href="/signup" className="btn">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}