'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';

type HeroProps = {
  loggedIn?: boolean;
};

// Floating shapes for anti-gravity effect
interface FloatingShape {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  type: 'circle' | 'square' | 'triangle' | 'ring' | 'plus' | 'dot';
  color: string;
  opacity: number;
}

const COLORS = [
  'rgba(74, 143, 255, 0.6)',   // blue
  'rgba(0, 245, 200, 0.6)',    // teal
  'rgba(255, 107, 107, 0.5)',  // coral
  'rgba(255, 184, 112, 0.5)',  // orange
  'rgba(184, 129, 255, 0.5)',  // purple
  'rgba(255, 214, 0, 0.5)',    // yellow
];

const STATS = [
  { value: '1,200+', label: 'Sessions completed', delay: '0s' },
  { value: '340+', label: 'Verified tutors', delay: '0.1s' },
  { value: '12 min', label: 'Average response', delay: '0.2s' },
];

export default function SophisticatedHero({ loggedIn }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapesRef = useRef<FloatingShape[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // Initialize shapes
  const initShapes = useCallback((width: number, height: number) => {
    const shapes: FloatingShape[] = [];
    const shapeCount = Math.min(35, Math.floor((width * height) / 25000));
    
    for (let i = 0; i < shapeCount; i++) {
      shapes.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 40 + 15,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        type: ['circle', 'square', 'triangle', 'ring', 'plus', 'dot'][Math.floor(Math.random() * 6)] as FloatingShape['type'],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: Math.random() * 0.4 + 0.2,
      });
    }
    return shapes;
  }, []);

  // Draw shape
  const drawShape = useCallback((ctx: CanvasRenderingContext2D, shape: FloatingShape) => {
    ctx.save();
    ctx.translate(shape.x, shape.y);
    ctx.rotate(shape.rotation);
    ctx.globalAlpha = shape.opacity;
    ctx.fillStyle = shape.color;
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = 2;

    const s = shape.size;
    
    switch (shape.type) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'square':
        ctx.fillRect(-s / 2, -s / 2, s, s);
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -s / 2);
        ctx.lineTo(s / 2, s / 2);
        ctx.lineTo(-s / 2, s / 2);
        ctx.closePath();
        ctx.fill();
        break;
      case 'ring':
        ctx.beginPath();
        ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'plus':
        ctx.fillRect(-s / 6, -s / 2, s / 3, s);
        ctx.fillRect(-s / 2, -s / 6, s, s / 3);
        break;
      case 'dot':
        ctx.beginPath();
        ctx.arc(0, 0, s / 4, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
    
    ctx.restore();
  }, []);

  // Animation loop
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      if (shapesRef.current.length === 0) {
        shapesRef.current = initShapes(rect.width, rect.height);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      shapesRef.current.forEach(shape => {
        // Mouse repulsion
        const dx = shape.x - mouseRef.current.x;
        const dy = shape.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150 && dist > 0) {
          const force = (150 - dist) / 150;
          shape.vx += (dx / dist) * force * 0.3;
          shape.vy += (dy / dist) * force * 0.3;
        }

        // Update position
        shape.x += shape.vx;
        shape.y += shape.vy;
        shape.rotation += shape.rotationSpeed;

        // Friction
        shape.vx *= 0.99;
        shape.vy *= 0.99;

        // Boundary bounce
        if (shape.x < 0 || shape.x > rect.width) shape.vx *= -1;
        if (shape.y < 0 || shape.y > rect.height) shape.vy *= -1;

        // Keep in bounds
        shape.x = Math.max(0, Math.min(rect.width, shape.x));
        shape.y = Math.max(0, Math.min(rect.height, shape.y));

        drawShape(ctx, shape);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mounted, initShapes, drawShape]);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Canvas for floating shapes */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{ touchAction: 'none' }}
      />

      {/* Subtle gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)]/30 via-transparent to-[var(--bg)]/50 pointer-events-none" />

      {/* Content */}
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--surface)] border border-[var(--border)] backdrop-blur-sm mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-[var(--text)]">Now live at THI — 500+ students active</span>
          </div>

          {/* Main heading - clean, spaced, readable */}
          <h1 className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[var(--text)] leading-[1.1]">
              Find your
            </span>
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] mt-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)] bg-[length:200%_auto] animate-gradient">
                perfect tutor
              </span>
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-2xl text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Connect with verified campus tutors instantly.<br className="hidden sm:block" />
            Post requests, browse availability, book in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {loggedIn ? (
              <>
                <Link 
                  href="/request/new" 
                  className="group relative px-8 py-4 rounded-full bg-[var(--text)] text-[var(--bg)] font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <span className="relative z-10">Post a Request</span>
                </Link>
                <Link 
                  href="/tutors" 
                  className="px-8 py-4 rounded-full border-2 border-[var(--border)] text-[var(--text)] font-semibold text-lg transition-all duration-300 hover:bg-[var(--surface)] hover:border-[var(--primary)]"
                >
                  Browse Tutors
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/signup" 
                  className="group relative px-8 py-4 rounded-full bg-[var(--text)] text-[var(--bg)] font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <span className="relative z-10">Get Started — It&apos;s Free</span>
                </Link>
                <Link 
                  href="/signin" 
                  className="px-8 py-4 rounded-full border-2 border-[var(--border)] text-[var(--text)] font-semibold text-lg transition-all duration-300 hover:bg-[var(--surface)] hover:border-[var(--primary)]"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text)] mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-[var(--muted)]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="flex flex-col items-center gap-2 text-[var(--muted)]">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-5 h-8 rounded-full border-2 border-current flex justify-center pt-2">
            <div className="w-1 h-2 bg-current rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
