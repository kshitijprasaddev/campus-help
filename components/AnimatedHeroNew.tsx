'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type AnimatedHeroProps = {
  loggedIn?: boolean;
};

export default function AnimatedHero({ loggedIn }: AnimatedHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  
  const words = ['tutor', 'mentor', 'study buddy', 'expert'];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <section 
      ref={heroRef}
      className="relative overflow-hidden py-20 md:py-32 lg:py-40"
    >
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 dark:bg-white/5 border border-thi-blue/20 backdrop-blur-sm animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-white/80">Campus Help for THI Students</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              <span className="text-gray-900 dark:text-white">Find your perfect</span>
              <br />
              <span className="relative inline-block min-w-[280px]">
                <span 
                  key={currentWord}
                  className="bg-gradient-to-r from-thi-blue via-thi-blue-light to-thi-blue bg-clip-text text-transparent animate-word-slide"
                >
                  {words[currentWord]}
                </span>
                <svg className="absolute -bottom-2 left-0 w-full h-4 text-thi-blue/40" viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="currentColor" strokeWidth="3" className="animate-draw-line" />
                </svg>
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">in minutes.</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-white/60 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Connect with verified campus tutors instantly. Post a request, browse availability, and book sessions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {loggedIn ? (
              <>
                <Link href="/request/new" className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-thi-blue text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_-15px_rgba(0,51,102,0.5)] hover:scale-105">
                  <span className="relative z-10">Post a Request</span>
                  <svg className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div className="absolute inset-0 bg-thi-blue-dark opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link href="/tutors" className="group inline-flex items-center gap-3 px-8 py-4 rounded-full border-2 border-thi-blue text-thi-blue dark:text-white dark:border-white/30 font-semibold text-lg transition-all duration-300 hover:bg-thi-blue/10 dark:hover:bg-white/10 hover:scale-105">
                  Browse Tutors
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup" className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-thi-blue text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_-15px_rgba(0,51,102,0.5)] hover:scale-105">
                  <span className="relative z-10">Get Started Free</span>
                  <svg className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div className="absolute inset-0 bg-thi-blue-dark opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link href="/signin" className="group inline-flex items-center gap-3 px-8 py-4 rounded-full border-2 border-thi-blue text-thi-blue dark:text-white dark:border-white/30 font-semibold text-lg transition-all duration-300 hover:bg-thi-blue/10 dark:hover:bg-white/10 hover:scale-105">
                  Sign In
                  <svg className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </Link>
              </>
            )}
          </div>

          {/* Feature Pills */}
          {mounted && (
            <div className="flex flex-wrap justify-center gap-3 pt-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              {[
                { icon: '🎓', text: 'Verified Students' },
                { icon: '⚡', text: 'Instant Matching' },
                { icon: '🔒', text: 'Secure Platform' },
                { icon: '💬', text: 'Direct Chat' },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/10 text-sm text-gray-700 dark:text-white/70 backdrop-blur-sm hover:scale-105 transition-transform cursor-default"
                >
                  <span>{feature.icon}</span>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Elements */}
        {mounted && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[
              { emoji: '📚', x: '10%', y: '20%', delay: 0 },
              { emoji: '💡', x: '85%', y: '15%', delay: 0.5 },
              { emoji: '🎯', x: '5%', y: '70%', delay: 1 },
              { emoji: '⭐', x: '90%', y: '65%', delay: 1.5 },
              { emoji: '🚀', x: '15%', y: '45%', delay: 2 },
              { emoji: '✨', x: '80%', y: '40%', delay: 2.5 },
            ].map((item, i) => (
              <div
                key={i}
                className="absolute text-4xl md:text-5xl animate-float-gentle opacity-60"
                style={{
                  left: item.x,
                  top: item.y,
                  animationDelay: `${item.delay}s`,
                }}
              >
                {item.emoji}
              </div>
            ))}
          </div>
        )}

        {/* Scroll indicator */}
        <div className="flex justify-center mt-16 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/50 transition-colors cursor-pointer">
            <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
            <div className="w-6 h-10 rounded-full border-2 border-current p-1">
              <div className="w-1.5 h-1.5 bg-current rounded-full animate-scroll-indicator mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
