'use client';
import Link from 'next/link';
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
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? 'backdrop-blur-2xl bg-[rgba(5,8,14,0.85)] border-b border-white/5 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.8)]' : 'bg-transparent'}`}>
      <div className="container flex h-[72px] items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3 font-semibold tracking-tight">
          <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/10 text-[var(--primary)] border border-[var(--primary)]/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px_-5px_var(--primary)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M4 9.5L12 4L20 9.5V19.5C20 20.0523 19.5523 20.5 19 20.5H5C4.44772 20.5 4 20.0523 4 19.5V9.5Z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M9 20.5V13.5H15V20.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-white font-bold text-lg group-hover:text-[var(--primary)] transition-colors duration-300">Campus Help</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          {filteredLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-4 py-2 rounded-full transition-all duration-300 ${isActive(link.href) ? 'bg-white/10 text-white border border-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--primary)]" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4 text-sm">
          <RoleModeSwitcher />
          {displayName && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-[10px] font-bold text-white">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-white/70 text-xs">{displayName.split(' ')[0]}</span>
            </div>
          )}
          {email ? (
            <button onClick={signOut} className="px-4 py-2 rounded-full text-white/70 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-300">Sign out</button>
          ) : (
            <>
              <Link href="/signin" className="px-4 py-2 rounded-full text-white/70 hover:text-white transition-colors duration-300">Sign in</Link>
              <Link href="/signup" className="group relative px-5 py-2.5 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-semibold overflow-hidden transition-all duration-300 hover:shadow-[0_10px_40px_-10px_var(--primary)] hover:scale-105">
                <span className="relative z-10">Join free</span>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition-all duration-300 hover:bg-white/10 hover:scale-105"
          onClick={() => setMenuOpen(v => !v)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className={`transition-transform duration-300 ${menuOpen ? 'rotate-90' : ''}`}>
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
        <div className="lg:hidden border-t border-white/5 bg-[rgba(4,6,12,0.98)] backdrop-blur-2xl">
          <div className="container py-6 space-y-4 anim-slide-down">
            <nav className="grid gap-2 text-sm">
              {filteredLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 rounded-xl transition-all duration-300 ${isActive(link.href) ? 'bg-white/10 text-white border border-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                  {link.label}
                </Link>
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
                  <Link href="/signin" className="btn-ghost">Sign in</Link>
                  <Link href="/signup" className="btn">Create free account</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}