"use client";

const features = [
  {
    title: 'Post requests in seconds',
    desc: 'Pick your course, describe what you need, and set the minimum offer you\'re comfortable with.',
    icon: '📝',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    title: 'Collect transparent bids',
    desc: 'Tutors pitch availability, a proposed rate, and notes. Profiles stay campus-verified by uni email.',
    icon: '🎯',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    title: 'Decide & collaborate',
    desc: 'Compare offers, close your request when ready, and move the conversation to direct payment on your terms.',
    icon: '🤝',
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
];

export default function FeatureCards() {
  return (
    <section className="container mt-16 space-y-12">
      <div className="max-w-2xl space-y-4 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          How it works
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          Match with the right tutor
          <span className="block bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
            in minutes, not days.
          </span>
        </h2>
        <p className="text-base text-white/60 leading-relaxed max-w-xl">
          Post what you need, set your budget, and pick from verified tutors who respond instantly. No credits, no clutter—just direct collaboration.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 stagger-children">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8 hover-lift hover-glow"
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            {/* Animated corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" />
            
            {/* Step number with glow */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[var(--primary)]/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 text-2xl group-hover:scale-110 group-hover:border-[var(--primary)]/30 transition-all duration-300">
                {feature.icon}
              </div>
            </div>

            {/* Content */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-[var(--primary)]/70 uppercase tracking-wider">Step {index + 1}</span>
                <span className="flex-1 h-px bg-gradient-to-r from-[var(--primary)]/30 to-transparent" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-[var(--primary)] transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/55 group-hover:text-white/70 transition-colors duration-300">
                {feature.desc}
              </p>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)] opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-full group-hover:translate-y-0" />
          </div>
        ))}
      </div>
    </section>
  );
}
