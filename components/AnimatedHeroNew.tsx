'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type AnimatedHeroProps = {
  loggedIn?: boolean;
};

export default function AnimatedHero({ loggedIn }: AnimatedHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const mousePos = useRef({ x: -1000, y: -1000 });
  
  const words = ['tutor', 'mentor', 'study partner', 'expert'];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [words.length]);

  // Subtle grid that appears near cursor
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const dpr = window.devicePixelRatio || 1;
    
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleMouseLeave = () => {
      mousePos.current = { x: -1000, y: -1000 };
    };
    window.addEventListener('mouseleave', handleMouseLeave);

    // Professional formulas and code snippets to show subtly
    const codeSnippets = [
      'f(x) = ∫ dx',
      'O(n log n)',
      'λx.x',
      '∂y/∂x',
      'Σ(n)',
      'async/await',
      'SELECT *',
      '∇f',
      'P(A|B)',
      'e^iπ + 1',
    ];

    const particles: Array<{
      x: number;
      y: number;
      text: string;
      alpha: number;
      size: number;
    }> = [];

    // Create sparse particles with code/math
    const spacing = 200;
    for (let x = 0; x < window.innerWidth; x += spacing) {
      for (let y = 0; y < window.innerHeight; y += spacing) {
        particles.push({
          x: x + Math.random() * 100 - 50,
          y: y + Math.random() * 100 - 50,
          text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
          alpha: 0,
          size: 10 + Math.random() * 4,
        });
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      
      const isDark = document.documentElement.classList.contains('dark');
      const textColor = isDark ? '255, 255, 255' : '0, 51, 102';
      
      particles.forEach(p => {
        const dx = mousePos.current.x - p.x;
        const dy = mousePos.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Only show within 250px of cursor
        const targetAlpha = dist < 250 ? Math.max(0, 0.15 * (1 - dist / 250)) : 0;
        p.alpha += (targetAlpha - p.alpha) * 0.08;
        
        if (p.alpha > 0.01) {
          ctx.font = `${p.size}px "SF Mono", Monaco, "Cascadia Code", monospace`;
          ctx.fillStyle = `rgba(${textColor}, ${p.alpha})`;
          ctx.textAlign = 'center';
          ctx.fillText(p.text, p.x, p.y);
        }
      });
      
      // Draw subtle grid lines near cursor
      const gridSize = 60;
      const gridRadius = 200;
      
      ctx.strokeStyle = `rgba(${textColor}, 0.04)`;
      ctx.lineWidth = 1;
      
      for (let x = 0; x < window.innerWidth; x += gridSize) {
        const dx = Math.abs(mousePos.current.x - x);
        if (dx < gridRadius) {
          const alpha = 0.08 * (1 - dx / gridRadius);
          ctx.strokeStyle = `rgba(${textColor}, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, window.innerHeight);
          ctx.stroke();
        }
      }
      
      for (let y = 0; y < window.innerHeight; y += gridSize) {
        const dy = Math.abs(mousePos.current.y - y);
        if (dy < gridRadius) {
          const alpha = 0.08 * (1 - dy / gridRadius);
          ctx.strokeStyle = `rgba(${textColor}, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(window.innerWidth, y);
          ctx.stroke();
        }
      }

      animationId = requestAnimationFrame(render);
    };
    
    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative overflow-hidden py-24 md:py-32 lg:py-40"
    >
      {/* Subtle background canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.8 }}
      />

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main Headline */}
          <div className="space-y-2 animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              <span className="text-gray-900 dark:text-white">Find your perfect</span>
              <br />
              <span className="relative inline-block h-[1.2em] min-w-[200px] sm:min-w-[280px] overflow-hidden">
                <span 
                  key={currentWord}
                  className="absolute inset-0 flex items-center justify-center text-thi-blue dark:text-[var(--primary)] animate-word-slide"
                >
                  {words[currentWord]}
                </span>
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-white/70 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Connect with verified campus tutors instantly. Post requests, browse availability, and book sessions—all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {loggedIn ? (
              <>
                <Link href="/request/new" className="btn px-8 py-4 text-lg">
                  Post a Request
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link href="/tutors" className="btn-ghost px-8 py-4 text-lg border-2">
                  Browse Tutors
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup" className="btn px-8 py-4 text-lg">
                  Get Started
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link href="/signin" className="btn-ghost px-8 py-4 text-lg border-2">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Trust indicators - no emojis, just clean text */}
          {mounted && (
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 pt-8 text-sm text-gray-500 dark:text-white/50 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Verified Students Only
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Instant Matching
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure Platform
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
