import React, { useRef } from 'react';
import { FileText, Globe, Upload, Scale, ArrowRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: FileText,
    title: 'Plain Language Law',
    description: 'Complex legal jargon decoded into clear, simple words anyone can understand.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Globe,
    title: 'Multilingual Support',
    description: 'Full English, Hindi & Marathi support — text and voice, for everyone.',
    gradient: 'from-indigo-500 to-blue-600',
  },
  {
    icon: Upload,
    title: 'Upload & Query',
    description: 'Drop any legal document and ask questions directly about its content.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Scale,
    title: 'Incident Guide',
    description: 'Real-life cases mapped to IPC sections and applicable punishments.',
    gradient: 'from-blue-500 to-indigo-600',
  },
];

/**
 * GlowCard — custom mouse-tracking spotlight card.
 * The glow layer sits INSIDE the card (absolute inset) and is
 * clipped by overflow:hidden + border-radius on the wrapper,
 * so it never bleaks outside or breaks at edges/corners.
 */
const GlowCard = ({ children, className = '' }) => {
  const cardRef = useRef(null);
  const glowRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(220px circle at ${x}px ${y}px, rgba(129,140,248,0.22), transparent 70%)`;
      glowRef.current.style.opacity = '1';
    }
  };

  const handleMouseLeave = () => {
    if (glowRef.current) {
      glowRef.current.style.opacity = '0';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative rounded-2xl p-7 overflow-hidden cursor-default transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 ${className}`}
      style={{
        background: 'linear-gradient(145deg, var(--ip-surface-secondary), var(--ip-surface-primary))',
        border: '1px solid var(--ip-border)',
      }}
    >
      {/* Glow layer — clipped perfectly by overflow:hidden above */}
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-200"
        style={{ opacity: 0 }}
      />
      {/* Content always sits above glow */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

const Features = () => {
  const { token } = useSelector((state) => state.auth);

  return (
    <section id="features" className="py-24 relative overflow-hidden" style={{ background: 'var(--ip-bg-secondary)' }}>

      {/* Section background accent */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(129,140,248,0.08) 0%, transparent 70%)',
      }} />

      <div className="container mx-auto px-6 relative z-10">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ip-accent)' }}>
            Core Features
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight" style={{ color: 'var(--ip-text-primary)' }}>
            Everything you need to{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--ip-accent), var(--ip-accent-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              understand the law
            </span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--ip-text-secondary)' }}>
            Clearly, quickly and in your own language.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <GlowCard key={index}>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--ip-text-primary)' }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ip-text-secondary)' }}>
                  {feature.description}
                </p>
              </GlowCard>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="mt-16 rounded-3xl p-12 text-center max-w-4xl mx-auto relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(129,140,248,0.1), rgba(167,139,250,0.06))',
            border: '1px solid rgba(129,140,248,0.2)',
          }}>
          <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
            background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(129,140,248,0.08), transparent)',
          }} />
          <h3 className="text-2xl md:text-3xl font-bold mb-3 relative" style={{ color: 'var(--ip-text-primary)' }}>
            Ready to simplify legal complexity?
          </h3>
          <p className="mb-8 text-lg relative" style={{ color: 'var(--ip-text-secondary)' }}>
            Join thousands already using NyayaSathi for legal clarity
          </p>
          {token ? (
            <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative"
              style={{ background: 'linear-gradient(135deg, var(--ip-accent), var(--ip-accent-secondary))', boxShadow: '0 8px 32px rgba(129,140,248,0.35)' }}>
              Try NyayaSathi Now <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <Link to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative"
              style={{ background: 'linear-gradient(135deg, var(--ip-accent), var(--ip-accent-secondary))', boxShadow: '0 8px 32px rgba(129,140,248,0.35)' }}>
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default Features;