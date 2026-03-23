import React from 'react';
import { Brain, Search, Mic } from 'lucide-react';

const technologies = [
  {
    icon: Brain,
    title: 'LLM + NLP',
    subtitle: 'Simplification Engine',
    description: 'Advanced language models turn dense legal text into crystal-clear explanations.',
    gradient: 'from-violet-500 to-purple-700',
    bgGlow: 'rgba(139,92,246,0.15)',
  },
  {
    icon: Search,
    title: 'RAG Pipeline',
    subtitle: 'Smart Document Search',
    description: 'Retrieval-augmented generation grounds every answer in your actual documents.',
    gradient: 'from-indigo-500 to-blue-700',
    bgGlow: 'rgba(99,102,241,0.15)',
  },
  {
    icon: Mic,
    title: 'Voice + Text',
    subtitle: 'Universal Accessibility',
    description: 'Multi-modal interaction so everyone can access legal guidance, spoken or typed.',
    gradient: 'from-purple-500 to-pink-600',
    bgGlow: 'rgba(168,85,247,0.15)',
  },
];

const Technology = () => {
  return (
    <section id="technology" className="py-24 relative overflow-hidden" style={{ background: 'var(--ip-bg-primary)' }}>

      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `linear-gradient(var(--ip-accent) 1px, transparent 1px), linear-gradient(90deg, var(--ip-accent) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(129,140,248,0.07) 0%, transparent 70%)',
      }} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ip-accent)' }}>
            Under the Hood
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight" style={{ color: 'var(--ip-text-primary)' }}>
            Powered by{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--ip-accent), var(--ip-accent-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Advanced AI
            </span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--ip-text-secondary)' }}>
            Cutting-edge technology stack designed specifically for legal intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {technologies.map((tech, index) => {
            const Icon = tech.icon;
            return (
              <div key={index} className="group relative rounded-2xl p-8 transition-all duration-500 hover:scale-[1.04] hover:-translate-y-2"
                style={{
                  background: `linear-gradient(145deg, var(--ip-surface-secondary), var(--ip-surface-primary))`,
                  border: '1px solid var(--ip-border)',
                  boxShadow: `0 0 0 0 ${tech.bgGlow}`,
                  transition: 'all 0.4s ease, box-shadow 0.4s ease',
                }}>
                {/* Hover glow backdrop */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse 60% 60% at 30% 30%, ${tech.bgGlow}, transparent)` }} />

                {/* Icon */}
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${tech.gradient} flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-400`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold mb-1 relative" style={{ color: 'var(--ip-text-primary)' }}>
                  {tech.title}
                </h3>
                <p className="text-sm font-semibold mb-3 relative" style={{ color: 'var(--ip-accent)' }}>
                  {tech.subtitle}
                </p>
                <p className="text-sm leading-relaxed relative" style={{ color: 'var(--ip-text-secondary)' }}>
                  {tech.description}
                </p>

                {/* Pulse dots */}
                <div className="flex gap-1.5 mt-6 relative">
                  {[0, 150, 300].map((delay) => (
                    <div key={delay} className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: 'var(--ip-accent)', animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Technology;