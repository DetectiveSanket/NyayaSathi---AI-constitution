import { lazy, Suspense } from 'react';
import React from 'react';
import { Award, Users, Zap, Github, Twitter, Linkedin } from 'lucide-react';
import Loading from '../../shared/Loading';

const AI3DElements = lazy(() => import('./AI3DElements'));

const teamMembers = [
  { name: 'Sanket Talekar', role: 'Full-Stack Dev', avatar: 'ST' },
  { name: 'Siddhi Patil', role: 'AI Engineer', avatar: 'SP' },
  { name: 'Ganesh More', role: 'Backend Dev', avatar: 'GM' },
];

const About = () => {
  return (
    <section id="about" className="py-24 relative overflow-hidden" style={{ background: 'var(--ip-bg-secondary)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(129,140,248,0.05) 0%, transparent 70%)',
      }} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ip-accent)' }}>
            Our Story
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight" style={{ color: 'var(--ip-text-primary)' }}>
            About{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--ip-accent), var(--ip-accent-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              NyayaSathi
            </span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--ip-text-secondary)' }}>
            Built by passionate engineers with a mission to democratize legal access.
          </p>
        </div>

        {/* Story card */}
        <div className="max-w-4xl mx-auto mb-14 rounded-3xl p-12 relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
          style={{
            background: 'linear-gradient(145deg, var(--ip-surface-secondary), var(--ip-surface-primary))',
            border: '1px solid var(--ip-border)',
          }}>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{
            background: 'radial-gradient(circle, rgba(129,140,248,0.08), transparent)',
          }} />

          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl"
              style={{ background: 'linear-gradient(135deg, var(--ip-accent), var(--ip-accent-secondary))' }}>
              <Award className="w-10 h-10 text-white" />
            </div>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-center mb-5"
            style={{
              background: 'linear-gradient(135deg, var(--ip-accent), var(--ip-accent-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
            Engineers from D.Y. Patil College of Engineering & Technology, Kolhapur
          </h3>

          <p className="text-lg leading-relaxed text-center max-w-2xl mx-auto" style={{ color: 'var(--ip-text-secondary)' }}>
            We started NyayaSathi with a single belief: <span style={{ color: 'var(--ip-text-primary)', fontWeight: 600 }}>every person deserves to understand the law</span> — regardless of language, education, or background. We're making that a reality with AI.
          </p>

          {/* Value pills */}
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            {['Justice for All', 'AI-First', 'Multilingual', 'Open Access'].map((tag) => (
              <span key={tag} className="px-4 py-1.5 rounded-full text-sm font-medium"
                style={{
                  background: 'rgba(129,140,248,0.12)',
                  border: '1px solid rgba(129,140,248,0.25)',
                  color: 'var(--ip-accent)',
                }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;