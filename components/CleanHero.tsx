'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type HeroProps = {
  loggedIn?: boolean;
};

// Simple floating dot
interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

export default function CleanHero({ loggedIn }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let dots: Dot[] = [];
    const mouse = { x: -1000, y: -1000 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDots();
    };

    const initDots = () => {
      dots = [];
      const count = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < Math.min(count, 80); i++) {
        dots.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 3 + 1,
          opacity: Math.random() * 0.3 + 0.1,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get computed style for primary color
      const computedStyle = getComputedStyle(document.documentElement);
      const primaryColor = computedStyle.getPropertyValue('--primary').trim() || '#003366';

      dots.forEach(dot => {
        // Mouse repulsion
        const dx = dot.x - mouse.x;
        const dy = dot.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120;
          dot.vx += (dx / dist) * force * 0.2;
          dot.vy += (dy / dist) * force * 0.2;
        }

        // Update position
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Damping
        dot.vx *= 0.98;
        dot.vy *= 0.98;

        // Wrap around edges
        if (dot.x < 0) dot.x = canvas.width;
        if (dot.x > canvas.width) dot.x = 0;
        if (dot.y < 0) dot.y = canvas.height;
        if (dot.y > canvas.height) dot.y = 0;

        // Draw
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${primaryColor}`;
        ctx.globalAlpha = dot.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw connections between nearby dots
      dots.forEach((dot, i) => {
        dots.slice(i + 1).forEach(other => {
          const dx = dot.x - other.x;
          const dy = dot.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = primaryColor;
            ctx.globalAlpha = (1 - dist / 100) * 0.1;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [mounted]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg)]" />

      {/* Content */}
      <div className="relative z-10 container">
        <div className="max-w-3xl mx-auto text-center px-4">
          {/* Simple badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-[var(--text)]">Live at THI</span>
          </div>

          {/* Main heading - clean and spaced */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--text)] leading-tight mb-6">
            Find your{' '}
            <span className="text-[var(--primary)]">perfect tutor</span>
          </h1>

          {/* Simple subtitle */}
          <p className="text-lg md:text-xl text-[var(--muted)] mb-10 max-w-xl mx-auto">
            Connect with verified campus tutors. Post requests, browse availability, book in seconds.
          </p>

          {/* Clean CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {loggedIn ? (
              <>
                <Link href="/request/new" className="btn text-lg px-8 py-4">
                  Post a Request
                </Link>
                <Link href="/tutors" className="btn-ghost text-lg px-8 py-4">
                  Browse Tutors
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup" className="btn text-lg px-8 py-4">
                  Get Started Free
                </Link>
                <Link href="/signin" className="btn-ghost text-lg px-8 py-4">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-6 h-10 rounded-full border-2 border-[var(--border)] flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-[var(--muted)] rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
