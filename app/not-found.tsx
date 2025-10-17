'use client';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container py-20 text-center space-y-4 anim-fade-up">
      <h1 className="text-4xl font-semibold">Page not found</h1>
      <p className="text-[color:var(--muted)]">The page you are looking for doesn’t exist.</p>
      <div className="flex gap-3 justify-center">
        <Link href="/" className="btn-ghost">Go home</Link>
        <Link href="/dashboard" className="btn">Open dashboard</Link>
      </div>
    </div>
  );
}
