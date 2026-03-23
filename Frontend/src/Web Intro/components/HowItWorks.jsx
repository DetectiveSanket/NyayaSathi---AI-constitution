import React from 'react';
import { Upload, Brain, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload or Ask',
    description: 'Upload any legal document or type your question in plain language.',
    gradient: 'from-violet-500 to-purple-700',
    number: '01',
  },
  {
    icon: Brain,
    title: 'AI Simplifies & Translates',
    description: 'Our AI processes the text and translates complex legal language into simple terms.',
    gradient: 'from-indigo-500 to-blue-600',
    number: '02',
  },
  {
    icon: CheckCircle,
    title: 'Get Clear Answers',
    description: 'Receive simplified explanations with precise legal references and citations.',
    gradient: 'from-purple-500 to-pink-500',
    number: '03',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden" style={{ background: 'var(--ip-bg-secondary)' }}>

      {/* Top + bottom fade */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 40% at 50% 50%, rgba(129,140,248,0.05) 0%, transparent 70%)',
      }} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ip-accent)' }}>
            Simple Process
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight" style={{ color: 'var(--ip-text-primary)' }}>
            How{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--ip-accent), var(--ip-accent-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              It Works
            </span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--ip-text-secondary)' }}>
            Three simple steps to get legal clarity in minutes.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">

            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-px" style={{
              background: 'linear-gradient(90deg, transparent, var(--ip-accent), transparent)',
              opacity: 0.3,
            }} />

            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="group relative rounded-2xl p-8 text-center transition-all duration-500 hover:scale-[1.04] hover:-translate-y-2"
                  style={{
                    background: 'linear-gradient(145deg, var(--ip-surface-secondary), var(--ip-surface-primary))',
                    border: '1px solid var(--ip-border)',
                  }}>

                  {/* Step number badge */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, var(--ip-accent), var(--ip-accent-secondary))' }}>
                    {step.number}
                  </div>

                  {/* Card glow on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 20%, rgba(129,140,248,0.07), transparent)' }} />

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 mx-auto shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-400 relative`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-lg font-bold mb-3 relative" style={{ color: 'var(--ip-text-primary)' }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed relative" style={{ color: 'var(--ip-text-secondary)' }}>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;