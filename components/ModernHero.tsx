'use client';

import Link from 'next/link';
import { useI18n } from './I18nProvider';

type HeroProps = {
  loggedIn?: boolean;
};

export default function ModernHero({ loggedIn }: HeroProps) {
  const { t } = useI18n();

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-[var(--bg)] pt-20 pb-12 sm:pt-0 sm:pb-0">
      {/* THI Royal Blue gradient background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full opacity-30 sm:opacity-40 blur-[80px] sm:blur-[120px]"
          style={{ background: 'linear-gradient(135deg, #003366 0%, #0052a5 50%, transparent 70%)' }}
        />
        <div 
          className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] rounded-full opacity-20 sm:opacity-30 blur-[60px] sm:blur-[100px]"
          style={{ background: 'linear-gradient(135deg, #0077cc 0%, #003366 50%, transparent 70%)' }}
        />
      </div>

      {/* Subtle grid pattern - hidden on mobile for performance */}
      <div 
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03] hidden sm:block"
        style={{
          backgroundImage: `linear-gradient(#003366 1px, transparent 1px), linear-gradient(90deg, #003366 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col items-center text-center">
          
          {/* THI Badge - glassmorphism with THI blue accent */}
          <div className="mb-6 sm:mb-12">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#003366]/5 dark:bg-white/[0.05] backdrop-blur-xl border border-[#003366]/15 dark:border-white/[0.08] shadow-lg shadow-[#003366]/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#003366] dark:bg-[#60a5fa] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#003366] dark:bg-[#60a5fa]"></span>
              </span>
              <span className="text-xs sm:text-sm font-medium text-[var(--text)]/80">{t.hero.badge}</span>
            </div>
          </div>

          {/* Main headline - responsive typography */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight text-[var(--text)] mb-4 sm:mb-8 px-2">
            {t.hero.title}
            <br />
            <span className="text-[var(--primary)]">{t.hero.titleHighlight}</span>
          </h1>

          {/* Subheadline - lighter, more breathing room */}
          <p className="text-base sm:text-lg md:text-xl leading-relaxed text-[var(--text)]/60 max-w-md sm:max-w-xl mb-8 sm:mb-14 font-normal px-4 sm:px-0">
            {t.hero.subtitle}
          </p>

          {/* CTA Buttons - THI Royal Blue theme */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
            {loggedIn ? (
              <>
                <Link 
                  href="/request/new" 
                  className="group w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-[#003366] dark:bg-[#60a5fa] text-white dark:text-[#0a0f1a] font-medium text-sm sm:text-base transition-all duration-300 hover:shadow-xl hover:shadow-[#003366]/20 hover:-translate-y-0.5 text-center"
                >
                  {t.hero.ctaPost}
                </Link>
                <Link 
                  href="/tutors" 
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-[#003366]/5 dark:bg-white/[0.05] backdrop-blur-sm border border-[#003366]/20 dark:border-white/[0.1] text-[var(--text)] font-medium text-sm sm:text-base transition-all duration-300 hover:bg-[#003366]/10 dark:hover:bg-white/[0.08] text-center"
                >
                  {t.hero.ctaBrowse}
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/signup" 
                  className="group w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-[#003366] dark:bg-[#60a5fa] text-white dark:text-[#0a0f1a] font-medium text-sm sm:text-base transition-all duration-300 hover:shadow-xl hover:shadow-[#003366]/20 hover:-translate-y-0.5 text-center"
                >
                  {t.hero.ctaStart}
                </Link>
                <Link 
                  href="/signin" 
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-[#003366]/5 dark:bg-white/[0.05] backdrop-blur-sm border border-[#003366]/20 dark:border-white/[0.1] text-[var(--text)] font-medium text-sm sm:text-base transition-all duration-300 hover:bg-[#003366]/10 dark:hover:bg-white/[0.08] text-center"
                >
                  {t.hero.ctaSignIn}
                </Link>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg)] to-transparent pointer-events-none" />
    </section>
  );
}
