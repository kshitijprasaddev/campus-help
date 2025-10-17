'use client';
import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', duration = 2500 }: { message: string; type?: 'success'|'error'; duration?: number }) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(t);
  }, [duration]);
  if (!show) return null;
  const cls = type === 'success' ? 'bg-green-500/90' : 'bg-red-500/90';
  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 text-white px-4 py-2 rounded shadow ${cls} anim-fade-up`}>{message}</div>
  );
}
