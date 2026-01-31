'use client';

import Link from 'next/link';

type HeroProps = {
  loggedIn?: boolean;
};

export default function SimpleHero({ loggedIn }: HeroProps) {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-[var(--accent)]/5" />
      
      {/* Animated circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--primary)]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] mb-8 anim-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-[var(--text)]">Live at THI — 500+ students</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--text)] leading-[1.1] mb-6 anim-fade-up" style={{ animationDelay: '0.1s' }}>
            Find your{' '}
            <span className="text-[var(--primary)]">perfect tutor</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10 anim-fade-up" style={{ animationDelay: '0.2s' }}>
            Post what you need, set your budget, and connect with verified campus tutors who respond instantly.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 anim-fade-up" style={{ animationDelay: '0.3s' }}>
            {loggedIn ? (
              <>
                <Link href="/request/new" className="btn px-8 py-4 text-lg">
                  Post a Request
                </Link>
                <Link href="/tutors" className="btn-ghost px-8 py-4 text-lg">
                  Browse Tutors
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup" className="btn px-8 py-4 text-lg">
                  Get Started Free
                </Link>
                <Link href="/signin" className="btn-ghost px-8 py-4 text-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto anim-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[var(--text)]">1,200+</div>
              <div className="text-xs sm:text-sm text-[var(--text-muted)]">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[var(--text)]">340+</div>
              <div className="text-xs sm:text-sm text-[var(--text-muted)]">Tutors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[var(--text)]">12min</div>
              <div className="text-xs sm:text-sm text-[var(--text-muted)]">Avg Reply</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 anim-fade-up" style={{ animationDelay: '0.5s' }}>
        <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 rounded-full border-2 border-current flex justify-center pt-2">
            <div className="w-1.5 h-2.5 bg-current rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
