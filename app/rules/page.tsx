'use client';

const RULES = [
  'Only students from your university may join (uni email required).',
  'No cheating or graded work. Use the platform for tutoring, explanations, and practice only.',
  'Keep a respectful tone. Spam or abuse leads to removal without refunds.',
  'Payments happen off-platform between students—agree upfront and keep receipts.',
  'Report suspicious requests or users using the report button wherever you see it.',
];

export default function RulesPage() {
  return (
    <div className="container">
      <div className="mx-auto max-w-3xl space-y-6 rounded-[32px] border border-[var(--border)]/60 bg-[rgba(12,19,38,0.85)] p-8 shadow-[0_35px_120px_-70px_rgba(80,105,255,0.6)]">
        <div className="space-y-3">
          <div className="tag">House rules</div>
          <h1 className="text-3xl font-semibold text-white">How we keep Campus Help safe</h1>
          <p className="text-sm text-white/60">Break these and you lose access without refunds. Follow them and the whole community wins.</p>
        </div>

        <ol className="space-y-4 text-sm text-white/70">
          {RULES.map((rule, index) => (
            <li key={rule} className="flex gap-4">
              <span className="mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[var(--border)]/60 bg-white/10 text-xs font-semibold text-white/70">
                {index + 1}
              </span>
              <span>{rule}</span>
            </li>
          ))}
        </ol>

        <div className="rounded-2xl border border-[var(--border)]/50 bg-white/5 px-4 py-3 text-xs text-white/45">
          Need to report something urgent? Email moderation@campushelp.example and include screenshots.
        </div>
      </div>
    </div>
  );
}
