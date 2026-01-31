"use client";

const features = [
  {
    title: 'Post a request',
    desc: 'Describe what you need help with and set your budget.',
    icon: '📝',
  },
  {
    title: 'Get matched',
    desc: 'Verified tutors respond with availability and rates.',
    icon: '🎯',
  },
  {
    title: 'Start learning',
    desc: 'Pick your tutor and schedule your session.',
    icon: '🚀',
  },
];

export default function FeatureCards() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section header - clean, centered */}
        <div className="text-center mb-16 lg:mb-20">
          <p className="text-sm font-medium text-[var(--primary)] uppercase tracking-widest mb-4">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--text)] tracking-tight">
            Three simple steps
          </h2>
        </div>

        {/* Feature cards - generous whitespace, subtle shadows */}
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-8 lg:p-10 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all duration-500 hover:-translate-y-1"
            >
              {/* Step number - subtle */}
              <div className="absolute top-6 right-6 text-7xl font-bold text-[var(--text)]/[0.03]">
                {index + 1}
              </div>
              
              {/* Icon */}
              <div className="text-4xl mb-6">
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-[var(--text)] mb-3">
                {feature.title}
              </h3>
              <p className="text-[var(--text)]/60 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
