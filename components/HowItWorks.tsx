"use client";

import { useEffect, useRef, useState } from 'react';
import { useI18n } from './I18nProvider';

export default function HowItWorks() {
  const { t } = useI18n();
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const steps = [
    {
      title: t.features.step1Title,
      desc: t.features.step1Desc,
      gradient: 'from-blue-500 to-cyan-400',
      iconPath: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    },
    {
      title: t.features.step2Title,
      desc: t.features.step2Desc,
      gradient: 'from-violet-500 to-purple-400',
      iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    },
    {
      title: t.features.step3Title,
      desc: t.features.step3Desc,
      gradient: 'from-emerald-500 to-teal-400',
      iconPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    },
  ];

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-advance steps
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isVisible, steps.length]);

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 sm:py-28 lg:py-36 overflow-hidden bg-[var(--bg)]"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 blur-[120px] transition-all duration-1000"
          style={{
            background: `radial-gradient(circle, ${
              activeStep === 0 ? '#0ea5e9' : activeStep === 1 ? '#8b5cf6' : '#10b981'
            } 0%, transparent 70%)`
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Section header */}
        <div 
          className={`text-center mb-12 sm:mb-16 lg:mb-20 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-xs sm:text-sm font-semibold text-[var(--primary)] uppercase tracking-[0.2em] mb-3 sm:mb-4">
            {t.features.eyebrow}
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text)] tracking-tight">
            {t.features.title}
          </h2>
        </div>

        {/* Steps Container */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* Left: Step Cards */}
          <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
            {steps.map((step, index) => (
              <div
                key={index}
                onClick={() => setActiveStep(index)}
                className={`group relative p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl cursor-pointer transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                } ${
                  activeStep === index 
                    ? 'bg-[var(--card)] shadow-2xl shadow-black/10 scale-[1.02]' 
                    : 'bg-transparent hover:bg-[var(--card)]/50'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Progress bar for active step */}
                {activeStep === index && (
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${step.gradient} animate-progress`}
                    />
                  </div>
                )}

                <div className="flex items-start gap-4 sm:gap-5">
                  {/* Step number with icon */}
                  <div className={`relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    activeStep === index 
                      ? `bg-gradient-to-br ${step.gradient} shadow-lg` 
                      : 'bg-[var(--border)]'
                  }`}>
                    <svg 
                      className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${
                        activeStep === index ? 'text-white' : 'text-[var(--text)]/40'
                      }`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={step.iconPath} />
                    </svg>
                    
                    {/* Step number badge */}
                    <span className={`absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-300 ${
                      activeStep === index 
                        ? 'bg-white text-gray-900 shadow-md' 
                        : 'bg-[var(--bg)] text-[var(--text)]/40 border border-[var(--border)]'
                    }`}>
                      {index + 1}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base sm:text-lg lg:text-xl font-semibold mb-1.5 sm:mb-2 transition-colors duration-300 ${
                      activeStep === index ? 'text-[var(--text)]' : 'text-[var(--text)]/60'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm sm:text-base leading-relaxed transition-colors duration-300 ${
                      activeStep === index ? 'text-[var(--text)]/70' : 'text-[var(--text)]/40'
                    }`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Visual illustration */}
          <div 
            className={`relative order-1 lg:order-2 transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            <div className="relative aspect-square max-w-[280px] sm:max-w-[350px] lg:max-w-[450px] mx-auto">
              {/* Floating rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`absolute w-full h-full rounded-full border-2 border-dashed transition-all duration-1000 ${
                  activeStep === 0 ? 'border-blue-500/30 scale-100' : 'border-transparent scale-90'
                }`} style={{ animation: 'spin 30s linear infinite' }} />
                <div className={`absolute w-[85%] h-[85%] rounded-full border-2 border-dashed transition-all duration-1000 ${
                  activeStep === 1 ? 'border-violet-500/30 scale-100' : 'border-transparent scale-90'
                }`} style={{ animation: 'spin 25s linear infinite reverse' }} />
                <div className={`absolute w-[70%] h-[70%] rounded-full border-2 border-dashed transition-all duration-1000 ${
                  activeStep === 2 ? 'border-emerald-500/30 scale-100' : 'border-transparent scale-90'
                }`} style={{ animation: 'spin 20s linear infinite' }} />
              </div>

              {/* Center element */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-3xl bg-gradient-to-br ${steps[activeStep].gradient} shadow-2xl transition-all duration-500 flex items-center justify-center`}>
                  <svg 
                    className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-white transition-transform duration-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={steps[activeStep].iconPath} />
                  </svg>
                  
                  {/* Pulse effect */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${steps[activeStep].gradient} animate-ping opacity-20`} />
                </div>
              </div>

              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br ${steps[activeStep].gradient} opacity-60 transition-all duration-700`}
                  style={{
                    top: `${20 + Math.sin(i * 1.2) * 30}%`,
                    left: `${20 + Math.cos(i * 1.2) * 30}%`,
                    animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
            </div>
          </div>

        </div>

        {/* Step indicators for mobile */}
        <div className="flex justify-center gap-2 mt-8 lg:hidden">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeStep === index 
                  ? 'w-8 bg-[var(--primary)]' 
                  : 'bg-[var(--text)]/20'
              }`}
            />
          ))}
        </div>

      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 4s linear;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
