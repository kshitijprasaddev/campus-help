'use client';
import { useEffect, useMemo, useState } from 'react';

type Program = { name: string; faculty?: string; degree?: string; duration?: string; start?: string; language?: string; dual?: string };

function degreeColor(deg?: string) {
  if (!deg) return 'bg-gray-600';
  if (/B\./i.test(deg) || /Bachelor/i.test(deg)) return 'bg-blue-600';
  if (/M\.|MBA/i.test(deg) || /Master/i.test(deg)) return 'bg-purple-600';
  return 'bg-gray-600';
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/thi-programs-static.json', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          setPrograms(Array.isArray(json?.programs) ? json.programs : []);
        }
      } catch {}
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return programs;
    return programs.filter(p => p.name.toLowerCase().includes(s) || (p.faculty||'').toLowerCase().includes(s) || (p.degree||'').toLowerCase().includes(s));
  }, [programs, q]);

  return (
    <div className="container space-y-4">
      <h1 className="text-2xl font-semibold">Programs catalogue</h1>
      <div className="card p-4 grid md:grid-cols-3 gap-3">
        <input className="input md:col-span-2" placeholder="Search programs or faculty…" value={q} onChange={e=>setQ(e.target.value)} />
        <div className="text-sm text-[color:var(--muted)] self-center">Total: {programs.length}</div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map(p => {
          const key = `${p.name}__${p.degree}`;
          const isOpen = !!open[key];
          return (
            <div key={key} className="card p-4 lift">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-[color:var(--muted)]">{p.faculty || ''}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded text-white ${degreeColor(p.degree)}`}>{p.degree || ''}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="btn-ghost text-xs px-2 py-1" onClick={()=>setOpen(o=>({ ...o, [key]: !isOpen }))}>{isOpen ? 'Hide details' : 'Show details'}</button>
                <a className="btn" href={`/request/new?program=${encodeURIComponent(p.name)}`}>Use this program</a>
              </div>
              {isOpen && (
                <div className="mt-3 text-sm">
                  {p.faculty && <div><span className="text-[color:var(--muted)]">Faculty:</span> {p.faculty}</div>}
                  {p.duration && <div><span className="text-[color:var(--muted)]">Duration:</span> {p.duration}</div>}
                  {p.language && <div><span className="text-[color:var(--muted)]">Language:</span> {p.language}</div>}
                  {p.start && <div><span className="text-[color:var(--muted)]">Start:</span> {p.start}</div>}
                  {p.dual && <div><span className="text-[color:var(--muted)]">Dual:</span> {p.dual}</div>}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-sm text-[color:var(--muted)]">No programs found.</div>}
      </div>
      <div className="text-xs text-[color:var(--muted)]">
        Source: THI Degree Programmes — <a className="underline" href="https://www.thi.de/en/studies/degree-programmes/" target="_blank" rel="noreferrer">overview</a>
      </div>
    </div>
  );
}