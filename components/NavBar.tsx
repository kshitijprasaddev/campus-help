'use client';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import RoleModeSwitcher from './RoleModeSwitcher';
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
  { href: '/rules', label: 'Rules' }
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
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
        setDisplayName((profile as any)?.full_name || user.email || null);
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
    <header className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? 'backdrop-blur-xl bg-[rgba(5,8,14,0.88)] border-b border-[var(--border)]/60 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.65)]' : 'bg-transparent'}`}>
      <div className="container flex h-[68px] items-center justify-between gap-4">
        <a href="/" className="group flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)]/12 text-[var(--primary)] ring-1 ring-[var(--primary)]/30 transition-transform group-hover:scale-105">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M4 9.5L12 4L20 9.5V19.5C20 20.0523 19.5523 20.5 19 20.5H5C4.44772 20.5 4 20.0523 4 19.5V9.5Z" stroke="currentColor" strokeWidth="1.4" />
              <path d="M9 20.5V13.5H15V20.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
          <span>Campus Help</span>
        </a>

        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          {filteredLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={`nav-link ${isActive(link.href) ? 'bg-white/10 text-white border border-[var(--border)]/50' : 'text-white/75'}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3 text-sm">
          <RoleModeSwitcher />
          {displayName && <span className="text-white/65">Hi, {displayName.split(' ')[0]}</span>}
          {email ? (
            <button onClick={signOut} className="nav-link text-white/80 border border-[var(--border)]/70 bg-white/5">Sign out</button>
          ) : (
            <>
              <a href="/signin" className="nav-link text-white/80 border border-[var(--border)]/70">Sign in</a>
              <a href="/signup" className="btn text-sm">Join now</a>
            </>
          )}
        </div>

        <button
          type="button"
          className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)]/70 bg-[var(--surface)] text-white/80 transition hover:bg-white/5"
          onClick={() => setMenuOpen(v => !v)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M4 6H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M4 12H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M4 18H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-[var(--border)]/60 bg-[rgba(4,6,12,0.94)] backdrop-blur-xl">
          <div className="container py-4 space-y-3 anim-slide-down">
            <nav className="grid gap-2 text-sm">
              {filteredLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`nav-link justify-start ${isActive(link.href) ? 'bg-white/10 text-white border border-[var(--border)]/50' : 'text-white/75 border border-transparent'}`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <RoleModeSwitcher />
              {displayName && <span className="text-white/65">Hi, {displayName}</span>}
            </div>
            <div className="flex flex-col gap-2">
              {email ? (
                <button onClick={signOut} className="btn-ghost">Sign out</button>
              ) : (
                <>
                  <a href="/signin" className="btn-ghost">Sign in</a>
                  <a href="/signup" className="btn">Create free account</a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}