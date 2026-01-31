'use client';

import Link from 'next/link';

type HeroProps = {
  loggedIn?: boolean;
};

export default function ModernHero({ loggedIn }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--bg)]">
      {/* Subtle gradient background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full opacity-30 blur-[120px]"
          style={{ background: 'linear-gradient(135deg, var(--primary) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] rounded-full opacity-20 blur-[100px]"
          style={{ background: 'linear-gradient(135deg, #06b6d4 0%, transparent 70%)' }}
        />
      </div>

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center text-center">
          
          {/* Small pill badge - glassmorphism */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.08] dark:bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium text-[var(--text)]/80">Live at THI</span>
              <span className="text-[var(--text)]/40">•</span>
              <span className="text-sm text-[var(--text)]/60">500+ students</span>
            </div>
          </div>

          {/* Main headline - big, clean typography */}
          <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-semibold leading-[1.05] tracking-tight text-[var(--text)] mb-8">
            Find your perfect
            <br />
            <span className="text-[var(--primary)]">campus tutor</span>
          </h1>

          {/* Subheadline - lighter, more breathing room */}
          <p className="text-[clamp(1.1rem,2.5vw,1.35rem)] leading-relaxed text-[var(--text)]/60 max-w-xl mb-14 font-normal">
            Post what you need. Connect with verified tutors who respond in minutes—not days.
          </p>

          {/* CTA Buttons - clean, generous padding */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
            {loggedIn ? (
              <>
                <Link 
                  href="/request/new" 
                  className="group px-8 py-4 rounded-2xl bg-[var(--text)] text-[var(--bg)] font-medium text-base transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-0.5"
                >
                  Post a Request
                </Link>
                <Link 
                  href="/tutors" 
                  className="px-8 py-4 rounded-2xl bg-white/[0.05] backdrop-blur-sm border border-white/[0.1] text-[var(--text)] font-medium text-base transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.15]"
                >
                  Browse Tutors
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/signup" 
                  className="group px-8 py-4 rounded-2xl bg-[var(--text)] text-[var(--bg)] font-medium text-base transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-0.5"
                >
                  Get Started — Free
                </Link>
                <Link 
                  href="/signin" 
                  className="px-8 py-4 rounded-2xl bg-white/[0.05] backdrop-blur-sm border border-white/[0.1] text-[var(--text)] font-medium text-base transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.15]"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Stats - minimal, subtle */}
          <div className="flex items-center justify-center gap-12 sm:gap-16">
            {[
              { value: '1,200+', label: 'Sessions' },
              { value: '340', label: 'Tutors' },
              { value: '~12m', label: 'Response' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-semibold text-[var(--text)] mb-1 tabular-nums">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-[var(--text)]/40 uppercase tracking-wider font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg)] to-transparent pointer-events-none" />
    </section>
  );
}
