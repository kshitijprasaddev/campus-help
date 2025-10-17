'use client';

export default function UnlocksPage() {
  return (
    <div className="container space-y-6">
      <div className="space-y-2">
        <div className="tag">Legacy area</div>
        <h1 className="text-3xl font-semibold text-white">Unlocks are retired</h1>
        <p className="text-sm text-white/60">
          We no longer manage tutor contacts through unlock credits. Compare bids on each request and coordinate payment and
          contact details directly with the tutor you choose.
        </p>
      </div>

      <div className="card space-y-4 p-6 md:p-8">
        <h2 className="text-lg font-semibold text-white">Need past contact info?</h2>
        <p className="text-sm text-white/60">
          If you previously unlocked a tutor and need their contact again, reach out to support and we’ll manually fetch it for
          you while we finish migrating historic data.
        </p>
        <a href="mailto:support@campus-help.example" className="btn w-max">Contact support</a>
      </div>
    </div>
  );
}
