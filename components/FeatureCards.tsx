"use client";

const features = [
  {
    title: 'Post requests in seconds',
    desc: 'Pick your course, describe what you need, and set the minimum offer you’re comfortable with.',
  },
  {
    title: 'Collect transparent bids',
    desc: 'Tutors pitch availability, a proposed rate, and notes. Profiles stay campus-verified by uni email.',
  },
  {
    title: 'Decide & collaborate',
    desc: 'Compare offers, close your request when ready, and move the conversation to direct payment on your terms.',
  },
];

export default function FeatureCards() {
  return (
    <section className="container mt-16 space-y-10">
      <div className="max-w-2xl space-y-3">
        <h2 className="text-3xl font-semibold tracking-tight text-white">Minimal tools to match with the right tutor in minutes.</h2>
        <p className="text-sm text-white/65 md:text-base">
          Post what you need, set the price you can offer, and pick from verified tutors who respond instantly. No credits, no clutter just direct collaboration.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="card lift h-full p-6 text-left anim-fade-up"
            style={{ animationDelay: `${0.1 * index}s` }}
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)]/60 bg-white/5 text-white/80">
              {index + 1}
            </div>
            <div className="text-lg font-semibold tracking-tight text-white">{feature.title}</div>
            <p className="mt-3 text-sm leading-relaxed text-white/65">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
