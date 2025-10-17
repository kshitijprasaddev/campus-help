'use client';

export default function CreditsPage() {
  return (
    <div className="container space-y-6">
      <div className="space-y-2">
        <div className="tag">Direct payments</div>
        <h1 className="text-3xl font-semibold text-white">No more credits</h1>
        <p className="text-sm text-white/60">
          We’ve retired the credit wallet. Tutors now submit bids with their own rates, and you decide how to handle payment
          once you pick the right match.
        </p>
      </div>

      <div className="card space-y-4 p-6 md:p-8">
        <h2 className="text-lg font-semibold text-white">How to proceed</h2>
        <ul className="space-y-3 text-sm text-white/65">
          <li>Post a request with the minimum offer you’re comfortable with.</li>
          <li>Review incoming bids and close the request when you’ve chosen your tutor.</li>
          <li>Handle payment directly with the tutor using your preferred method (bank transfer, PayPal, etc.).</li>
        </ul>
        <p className="text-xs uppercase tracking-[0.3em] text-white/35">
          Need automated payments later? Let us know from your dashboard feedback link.
        </p>
      </div>
    </div>
  );
}
