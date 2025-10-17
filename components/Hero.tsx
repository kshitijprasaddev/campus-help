"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

type HeroProps = {
  loggedIn?: boolean;
};

const HERO_STATS = [
  { label: 'Requests matched', value: '1,200+' },
  { label: 'Tutors verified', value: '340' },
  { label: 'Avg. reply time', value: '~12 min' },
];

const HERO_VIDEO_SRC = '/media/hero-demo.mp4';
const MIN_BUDGET = 25;
const MAX_BUDGET = 120;

export function Hero({ loggedIn }: HeroProps) {
  const [budgetPreview, setBudgetPreview] = useState(60);
  const [videoAvailable, setVideoAvailable] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const progress = ((budgetPreview - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100;
  const sliderStyle: CSSProperties = {
    background: `linear-gradient(90deg, var(--primary) ${progress}%, rgba(255,255,255,0.14) ${progress}%)`,
  };

  const sampleBid = Math.max(budgetPreview + 7, MIN_BUDGET + 10);

  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      <div className="absolute inset-x-0 -top-48 h-[420px] bg-[radial-gradient(circle_at_top,rgba(74,143,255,0.28),transparent_70%)] blur-3xl" aria-hidden />
      <div className="container">
        <div className="relative overflow-hidden rounded-[40px] border border-[var(--border)]/60 bg-[rgba(8,12,22,0.92)] px-6 py-10 md:px-12 md:py-12 lg:px-16 lg:py-14 shadow-[0_45px_160px_-110px_rgba(4,12,28,1)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_-15%,rgba(74,143,255,0.32),transparent_55%),radial-gradient(circle_at_95%_0%,rgba(0,245,200,0.18),transparent_45%)] opacity-90" aria-hidden />
          <div className="relative z-10 grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="space-y-6 lg:col-span-7">
              <div className="relative overflow-hidden rounded-[32px] border border-[var(--border)]/70 bg-black/40 shadow-[0_32px_120px_-95px_rgba(4,12,28,0.9)]">
                {videoAvailable ? (
                  <video
                    className="aspect-[16/9] w-full object-cover"
                    src={HERO_VIDEO_SRC}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    onError={() => setVideoAvailable(false)}
                  />
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center bg-[rgba(6,10,18,0.92)] px-6 text-center text-sm text-white/55">
                    Add hero-demo.mp4 under /public/media to show the walkthrough.
                  </div>
                )}
                <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/55 px-4 py-1 text-[10px] uppercase tracking-[0.32em] text-white/70 backdrop-blur">
                  Live walkthrough
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4 text-xs text-white/70">
                  <div>
                    <div className="text-white">See it from post to payout</div>
                    <p className="text-white/55">Real screens from the production app, no mockups.</p>
                  </div>
                  <div className="flex items-center gap-2 text-white/55">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20">▶</span>
                    <span className="tracking-[0.3em]">00:40</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                <div className="device-shell w-36 flex-1 min-w-[9rem]">
                  <div className="device-screen">
                    <div className="device-notch" aria-hidden />
                    <div className="absolute inset-0 rounded-[22px] bg-[rgba(8,12,22,0.95)] p-4 text-white/75">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Requests</div>
                      <div className="mt-3 space-y-3 text-[11px]">
                        <div className="rounded-2xl border border-white/12 bg-white/8 p-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-white">Calculus crash</span>
                            <span className="rounded-full bg-[var(--primary)]/18 px-2 py-0.5 text-[var(--primary)]">€45</span>
                          </div>
                          <p className="mt-2 text-white/55">Need prep before quiz · online</p>
                        </div>
                        <div className="rounded-2xl border border-white/12 bg-white/6 p-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-white">Design feedback</span>
                            <span className="rounded-full bg-[var(--accent)]/22 px-2 py-0.5 text-[var(--accent)]">Bid €52</span>
                          </div>
                          <p className="mt-2 text-white/55">Need polish on slides · tonight</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="device-shell w-36 flex-1 min-w-[9rem]">
                  <div className="device-screen">
                    <div className="device-notch" aria-hidden />
                    <div className="absolute inset-0 rounded-[22px] bg-[rgba(6,10,20,0.96)] p-4 text-white/75">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Tutor bid</div>
                      <div className="mt-3 space-y-3 text-[11px]">
                        <div className="rounded-2xl border border-white/12 bg-white/8 p-3">
                          <p className="text-white">“Happy to cover topics 7-10 and share annotated slides.”</p>
                          <div className="mt-3 flex items-center justify-between text-white/60">
                            <span>€{sampleBid}</span>
                            <span>Tonight · Online</span>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white/12 bg-white/6 p-3">
                          <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Your floor</div>
                          <div className="mt-2 text-3xl font-semibold text-white">€{budgetPreview}</div>
                          <p className="mt-2 text-white/55">Only bids above this appear.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8 text-right lg:col-span-5">
              <div className="space-y-5 text-right">
                <div className="ml-auto inline-flex items-center gap-2 rounded-full border border-[var(--border)]/60 bg-white/5 px-4 py-1 text-[10px] uppercase tracking-[0.32em] text-white/60">
                  Refined for campus teams
                </div>
                <h1 className="text-4xl font-semibold tracking-tight leading-tight md:text-6xl lg:text-[4rem]">
                  Minimal tools to match with the right tutor in minutes.
                </h1>
                <p className="ml-auto max-w-xl text-base text-white/70 md:text-lg">
                  Post what you need, set the price you can offer, and pick from verified tutors who respond instantly. No credits, no clutter—just direct collaboration.
                </p>
                {loggedIn ? (
                  <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
                    <Link href="/dashboard" className="btn text-sm md:text-base">Go to dashboard</Link>
                    <Link href="/request/new" className="btn-ghost text-sm md:text-base">Post a request</Link>
                    <span className="text-[10px] uppercase tracking-[0.32em] text-white/38">Signed in with your uni email.</span>
                  </div>
                ) : (
                  <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
                    <Link href="/signup" className="btn text-sm md:text-base">Create your account</Link>
                    <Link href="/signin" className="btn-ghost text-sm md:text-base">I already have access</Link>
                    <span className="text-[10px] uppercase tracking-[0.32em] text-white/38">Uni email required · no spam</span>
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {HERO_STATS.map((stat, idx) => (
                  <div
                    key={stat.label}
                    className={`rounded-2xl border border-[var(--border)]/60 bg-white/[0.04] px-4 py-5 text-left ${mounted ? 'anim-fade-up' : ''}`}
                    style={{ animationDelay: `${0.18 + idx * 0.1}s` }}
                  >
                    <div className="text-2xl font-semibold text-white">{stat.value}</div>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.32em] text-white/35">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-[var(--border)]/60 bg-white/[0.05] p-6 shadow-[0_30px_110px_-90px_rgba(4,12,28,1)]">
                <div className="flex items-center justify-between text-xs text-white/55">
                  <span className="uppercase tracking-[0.3em] text-white/40">Set minimum offer</span>
                  <span className="rounded-full border border-white/15 px-3 py-0.5">Interactive</span>
                </div>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div className="text-sm text-white/45">Tutors only see bids at or above this floor.</div>
                  <div className="flex items-baseline gap-2 text-white">
                    <span className="text-4xl font-semibold">€{budgetPreview}</span>
                    <span className="pb-1 text-sm text-white/45">per session</span>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <input
                    type="range"
                    min={MIN_BUDGET}
                    max={MAX_BUDGET}
                    step={5}
                    value={budgetPreview}
                    onChange={event => setBudgetPreview(Number(event.target.value))}
                    style={sliderStyle}
                  />
                  <div className="flex justify-between text-[10px] uppercase tracking-[0.3em] text-white/35">
                    <span>€{MIN_BUDGET}</span>
                    <span>€{MAX_BUDGET}</span>
                  </div>
                </div>
                <div className="mt-5 rounded-2xl border border-white/12 bg-white/[0.05] p-4 text-sm text-white/70">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Amelia in Data Science</span>
                    <span className="rounded-full bg-[var(--primary)]/18 px-3 py-0.5 text-[var(--primary)]">Bid €{sampleBid}</span>
                  </div>
                  <p className="mt-3 text-white/55">“Available tonight. I’ll bring annotated slides plus quickfire questions.”</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
