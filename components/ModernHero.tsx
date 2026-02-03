'use client';

import Link from 'next/link';
import { useI18n } from './I18nProvider';

type HeroProps = {
  loggedIn?: boolean;
};

export default function ModernHero({ loggedIn }: HeroProps) {
  const { t } = useI18n();

  const stats = [
    { value: '1,200+', label: t.hero.statSessions },
    { value: '340', label: t.hero.statTutors },
    { value: '~12m', label: t.hero.statResponse },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--bg)]">
      {/* THI Royal Blue gradient background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full opacity-40 blur-[120px]"
          style={{ background: 'linear-gradient(135deg, #003366 0%, #0052a5 50%, transparent 70%)' }}
        />
        <div 
          className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] rounded-full opacity-30 blur-[100px]"
          style={{ background: 'linear-gradient(135deg, #0077cc 0%, #003366 50%, transparent 70%)' }}
        />
      </div>

      {/* Subtle grid pattern - more visible */}
      <div 
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#003366 1px, transparent 1px), linear-gradient(90deg, #003366 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center text-center">
          
          {/* THI Badge - glassmorphism with THI blue accent */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#003366]/5 dark:bg-white/[0.05] backdrop-blur-xl border border-[#003366]/15 dark:border-white/[0.08] shadow-lg shadow-[#003366]/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#003366] dark:bg-[#60a5fa] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#003366] dark:bg-[#60a5fa]"></span>
              </span>
              <span className="text-sm font-medium text-[var(--text)]/80">{t.hero.badge}</span>
              <span className="text-[var(--text)]/40">•</span>
              <span className="text-sm text-[var(--text)]/60">500+ {t.hero.students}</span>
            </div>
          </div>

          {/* Main headline - big, clean typography */}
          <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-semibold leading-[1.05] tracking-tight text-[var(--text)] mb-8">
            {t.hero.title}
            <br />
            <span className="text-[var(--primary)]">{t.hero.titleHighlight}</span>
          </h1>

          {/* Subheadline - lighter, more breathing room */}
          <p className="text-[clamp(1.1rem,2.5vw,1.35rem)] leading-relaxed text-[var(--text)]/60 max-w-xl mb-14 font-normal">
            {t.hero.subtitle}
          </p>

          {/* CTA Buttons - THI Royal Blue theme */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
            {loggedIn ? (
              <>
                <Link 
                  href="/request/new" 
                  className="group px-8 py-4 rounded-2xl bg-[#003366] dark:bg-[#60a5fa] text-white dark:text-[#0a0f1a] font-medium text-base transition-all duration-300 hover:shadow-xl hover:shadow-[#003366]/20 hover:-translate-y-0.5"
                >
                  {t.hero.ctaPost}
                </Link>
                <Link 
                  href="/tutors" 
                  className="px-8 py-4 rounded-2xl bg-[#003366]/5 dark:bg-white/[0.05] backdrop-blur-sm border border-[#003366]/20 dark:border-white/[0.1] text-[var(--text)] font-medium text-base transition-all duration-300 hover:bg-[#003366]/10 dark:hover:bg-white/[0.08]"
                >
                  {t.hero.ctaBrowse}
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/signup" 
                  className="group px-8 py-4 rounded-2xl bg-[#003366] dark:bg-[#60a5fa] text-white dark:text-[#0a0f1a] font-medium text-base transition-all duration-300 hover:shadow-xl hover:shadow-[#003366]/20 hover:-translate-y-0.5"
                >
                  {t.hero.ctaStart}
                </Link>
                <Link 
                  href="/signin" 
                  className="px-8 py-4 rounded-2xl bg-[#003366]/5 dark:bg-white/[0.05] backdrop-blur-sm border border-[#003366]/20 dark:border-white/[0.1] text-[var(--text)] font-medium text-base transition-all duration-300 hover:bg-[#003366]/10 dark:hover:bg-white/[0.08]"
                >
                  {t.hero.ctaSignIn}
                </Link>
              </>
            )}
          </div>

          {/* Stats - minimal, subtle */}
          <div className="flex items-center justify-center gap-12 sm:gap-16">
            {stats.map((stat, i) => (
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
