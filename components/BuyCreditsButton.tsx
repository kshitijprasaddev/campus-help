// components/BuyCreditsButton.tsx
'use client';
export default function BuyCreditsButton() {
  return (
    <a className="btn bg-[var(--primary)] hover:bg-[var(--primary-600)]" href="https://your-checkout-link.example" target="_blank" rel="noreferrer">
      Buy 5 credits (€10)
    </a>
  );
}