"use client";

const features = [
  {
    title: 'Post requests in seconds',
    desc: 'Pick your course, describe what you need, and set the minimum offer you\'re comfortable with.',
    icon: '📝',
  },
  {
    title: 'Collect transparent bids',
    desc: 'Tutors pitch availability, a proposed rate, and notes. Profiles stay verified.',
    icon: '🎯',
  },
  {
    title: 'Decide & collaborate',
    desc: 'Compare offers, close your request when ready, and move the conversation to direct payment on your terms.',
    icon: '🤝',
  },
];

export default function FeatureCards() {
  return (
    <section className="container mt-16 space-y-12">
      <div className="max-w-2xl space-y-4 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-thi-blue/5 dark:bg-[var(--primary)]/10 border border-thi-blue/20 dark:border-[var(--primary)]/20 text-xs font-medium uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-thi-blue dark:bg-[var(--primary)] animate-pulse" />
          How it works
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Match with the right tutor
          <span className="block text-thi-blue dark:text-[var(--primary)]">
            in minutes, not days.
          </span>
        </h2>
        <p className="text-base text-[var(--text-muted)] leading-relaxed max-w-xl">
          Post what you need, set your budget, and pick from verified tutors who respond instantly. No credits, no clutter—just direct collaboration.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="card group relative overflow-hidden p-8 hover:border-thi-blue/30 dark:hover:border-[var(--primary)]/30 transition-all duration-300 hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Step number with glow */}
            <div className="relative mb-6">
              <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-thi-blue/10 dark:bg-[var(--primary)]/10 border border-thi-blue/20 dark:border-[var(--primary)]/20 text-2xl group-hover:scale-110 transition-all duration-300">
                {feature.icon}
              </div>
            </div>

            {/* Content */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-thi-blue dark:text-[var(--primary)] uppercase tracking-wider">Step {index + 1}</span>
                <span className="flex-1 h-px bg-thi-blue/20 dark:bg-[var(--primary)]/30" />
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-thi-blue dark:group-hover:text-[var(--primary)] transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                {feature.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
