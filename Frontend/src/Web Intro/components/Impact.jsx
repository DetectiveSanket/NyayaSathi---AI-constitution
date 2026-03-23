import React from 'react';
import { Users, GraduationCap, Scale, Heart } from 'lucide-react';
import ShinyCard from '../../../components/nurui/shiny-card';

const impactGroups = [
  {
    icon: Users,
    gradient: 'from-violet-500 to-purple-700',
    title: 'Citizens',
    description: 'Empowering everyday people with the legal knowledge they deserve.',
  },
  {
    icon: GraduationCap,
    gradient: 'from-indigo-500 to-blue-700',
    title: 'Students',
    description: 'Making legal education accessible, clear, and approachable for all.',
  },
  {
    icon: Scale,
    gradient: 'from-purple-500 to-pink-600',
    title: 'Lawyers',
    description: 'Streamlining legal research and simplifying client communication.',
  },
  {
    icon: Heart,
    gradient: 'from-blue-500 to-indigo-600',
    title: 'NGOs',
    description: 'Supporting social justice initiatives with accurate legal guidance.',
  },
];

const Impact = () => {
  return (
    <section id="impact" className="py-24 relative overflow-hidden" style={{ background: 'var(--ip-bg-primary)' }}>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(129,140,248,0.07) 0%, transparent 70%)',
      }} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ip-accent)' }}>
            Who We Serve
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight" style={{ color: 'var(--ip-text-primary)' }}>
            Helping everyone access{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--ip-accent), var(--ip-accent-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              justice
            </span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--ip-text-secondary)' }}>
            Simple, fast, and inclusive for citizens, students, lawyers, and NGOs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {impactGroups.map((group, index) => {
            const Icon = group.icon;
            return (
              <div key={index} className="group rounded-2xl p-7 text-center transition-all duration-500 hover:scale-[1.04] hover:-translate-y-2 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, var(--ip-surface-secondary), var(--ip-surface-primary))',
                  border: '1px solid var(--ip-border)',
                }}>
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 20%, rgba(129,140,248,0.07), transparent)' }} />

                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${group.gradient} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 relative" style={{ color: 'var(--ip-text-primary)' }}>
                  {group.title}
                </h3>
                <p className="text-sm leading-relaxed relative" style={{ color: 'var(--ip-text-secondary)' }}>
                  {group.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Impact;