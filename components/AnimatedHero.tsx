'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type AnimatedHeroProps = {
  loggedIn?: boolean;
};

// Floating element data
const FLOATING_ELEMENTS = [
  { icon: '📚', label: 'Study', delay: 0 },
  { icon: '💡', label: 'Ideas', delay: 0.5 },
  { icon: '🎯', label: 'Goals', delay: 1 },
  { icon: '⚡', label: 'Quick', delay: 1.5 },
  { icon: '🚀', label: 'Launch', delay: 2 },
  { icon: '✨', label: 'Success', delay: 2.5 },
];

const STATS = [
  { value: '1,200+', label: 'Sessions Matched', icon: '🎯' },
  { value: '340+', label: 'Verified Tutors', icon: '👨‍🏫' },
  { value: '~12min', label: 'Avg Response', icon: '⚡' },
];

export default function AnimatedHero({ loggedIn }: AnimatedHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!heroRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = heroRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePos({ x, y });
    };

    const hero = heroRef.current;
    hero.addEventListener('mousemove', handleMouseMove);
    
    return () => hero.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative overflow-hidden py-16 md:py-24 lg:py-32"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Animated background layers */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary gradient orb - follows mouse */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[120px] transition-all duration-1000 ease-out"
          style={{
            background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
            left: `${mousePos.x * 60 - 20}%`,
            top: `${mousePos.y * 60 - 30}%`,
            transform: `scale(${isHovering ? 1.2 : 1})`,
          }}
        />
        
        {/* Secondary accent orb */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-25 blur-[100px] transition-all duration-1500 ease-out"
          style={{
            background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
            right: `${(1 - mousePos.x) * 40}%`,
            bottom: `${(1 - mousePos.y) * 40}%`,
          }}
        />

        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating particles */}
        {mounted && (
          <div className="absolute inset-0">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full animate-float-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${8 + Math.random() * 7}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating emoji elements - anti-gravity style */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {FLOATING_ELEMENTS.map((el, i) => (
            <div
              key={i}
              className="absolute animate-float-element"
              style={{
                left: `${15 + (i * 14)}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${el.delay}s`,
              }}
            >
              <div className="relative group">
                <div className="text-4xl md:text-5xl filter drop-shadow-lg animate-bounce-gentle">
                  {el.icon}
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-white/40 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {el.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="container relative z-10">
        {/* Main hero card */}
        <div className="relative">
          {/* Glow effect behind card */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-[48px] blur-2xl opacity-50 animate-pulse-slow" />
          
          <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl shadow-2xl">
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            
            {/* Animated border gradient */}
            <div className="absolute inset-0 rounded-[40px] p-[1px] overflow-hidden">
              <div className="absolute inset-0 animate-border-rotate">
                <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent,var(--primary),transparent,var(--accent),transparent)] opacity-30" />
              </div>
            </div>

            <div className="relative z-10 px-8 py-12 md:px-16 md:py-16 lg:px-20 lg:py-20">
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                {/* Left content */}
                <div className="space-y-8">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-fade-in-up">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Live at THI</span>
                  </div>

                  {/* Headline */}
                  <div className="space-y-4 animate-fade-in-up animation-delay-100">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                      <span className="text-white">Find your</span>
                      <br />
                      <span className="relative">
                        <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent">
                          perfect tutor
                        </span>
                        <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                          <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="currentColor" strokeWidth="3" className="animate-draw-line" />
                        </svg>
                      </span>
                      <br />
                      <span className="text-white">in minutes.</span>
                    </h1>
                    
                    <p className="text-lg text-white/60 max-w-lg leading-relaxed animate-fade-in-up animation-delay-200">
                      Connect with verified campus tutors instantly. Post a request, browse availability, and book sessions—all without the awkward DMs.
                    </p>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-4 animate-fade-in-up animation-delay-300">
                    {loggedIn ? (
                      <>
                        <Link href="/request/new" className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-primary-600 text-white font-semibold overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_-15px_var(--primary)] hover:scale-105">
                          <span className="relative z-10">Post a Request</span>
                          <svg className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <Link href="/tutors" className="group inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white font-semibold backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-105">
                          Browse Tutors
                          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/signup" className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-white font-semibold overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_-15px_var(--primary)] hover:scale-105">
                          <span className="relative z-10">Get Started Free</span>
                          <svg className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <Link href="/signin" className="group inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white font-semibold backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-105">
                          Sign In
                          <svg className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Trust indicators */}
                  <div className="flex items-center gap-6 pt-4 animate-fade-in-up animation-delay-400">
                    <div className="flex -space-x-3">
                      {['🧑‍🎓', '👨‍💻', '👩‍🔬', '🧑‍🏫'].map((emoji, i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 border-2 border-[var(--bg)] flex items-center justify-center text-lg">
                          {emoji}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm">
                      <div className="text-white font-medium">500+ students active</div>
                      <div className="text-white/50">this semester at THI</div>
                    </div>
                  </div>
                </div>

                {/* Right side - Stats cards with 3D effect */}
                <div className="relative">
                  {/* Decorative rings */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full animate-spin-slow" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white/5 rounded-full animate-spin-slow-reverse" />
                  
                  <div className="relative grid gap-4">
                    {STATS.map((stat, i) => (
                      <div
                        key={i}
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 transition-all duration-500 hover:border-primary/30 hover:bg-white/[0.06] hover:scale-[1.02] hover:-translate-y-1 animate-fade-in-right"
                        style={{ animationDelay: `${0.2 + i * 0.15}s` }}
                      >
                        {/* Hover glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="relative flex items-center gap-4">
                          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                            {stat.icon}
                          </div>
                          <div>
                            <div className="text-3xl font-bold text-white group-hover:text-primary transition-colors duration-300">
                              {stat.value}
                            </div>
                            <div className="text-sm text-white/50">{stat.label}</div>
                          </div>
                        </div>

                        {/* Animated corner accent */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom scroll indicator */}
        <div className="flex justify-center mt-12 animate-fade-in-up animation-delay-500">
          <div className="flex flex-col items-center gap-2 text-white/30 hover:text-white/50 transition-colors cursor-pointer group">
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
