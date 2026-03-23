import React from 'react';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import AINetwork3D from './AINetwork3D';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import logo from '../../assets/Logo/logo 1.png';

const Hero = () => {
  const { token } = useSelector((state) => state.auth);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: 'var(--ip-bg-primary)' }}>

      {/* Deep layered background */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(129,140,248,0.18) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(167,139,250,0.10) 0%, transparent 60%)',
      }} />

      {/* AI Network Background */}
      <AINetwork3D className="opacity-20" />

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)', animationDelay: '1.5s' }} />
        <div className="absolute top-2/3 left-1/6 w-48 h-48 rounded-full blur-2xl animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', animationDelay: '3s' }} />
      </div>

      <div className="container mx-auto px-6 py-32 relative z-10">
        <div className="text-center max-w-5xl mx-auto">

          {/* Logo mark — white container isolates the gray logo bg from any theme */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white shadow-xl p-1 hover:scale-105 transition-all duration-300"
              style={{ boxShadow: '0 0 32px rgba(129,140,248,0.25)' }}>
              <img src={logo} alt="NyayaSathi" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 rounded-full text-sm font-medium"
            style={{
              background: 'linear-gradient(135deg, rgba(129,140,248,0.15), rgba(167,139,250,0.08))',
              border: '1px solid rgba(129,140,248,0.3)',
              color: 'var(--ip-accent)',
              backdropFilter: 'blur(8px)',
            }}>
            <Sparkles className="w-4 h-4 animate-pulse" />
            AI-Powered Legal Assistant
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight" style={{ color: 'var(--ip-text-primary)' }}>
            Understand Your{' '}
            <span className="block mt-1" style={{
              background: 'linear-gradient(135deg, var(--ip-accent) 0%, var(--ip-accent-secondary) 50%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Rights, Anytime.
            </span>
            <span style={{
              background: 'linear-gradient(135deg, #c084fc 0%, var(--ip-accent-secondary) 50%, var(--ip-accent) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Anywhere.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-10 leading-relaxed max-w-3xl mx-auto" style={{ color: 'var(--ip-text-secondary)' }}>
            NyayaSathi is an AI-powered legal assistant that makes law easy to{' '}
            <span style={{ color: 'var(--ip-text-primary)', fontWeight: 600 }}>understand</span>{' '}
            in any language
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {token ? (
              <Link to="/chatbot"
                className="group flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, var(--ip-accent), var(--ip-accent-secondary))',
                  boxShadow: '0 4px 24px rgba(129,140,248,0.3)',
                }}>
                Try Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link to="/login"
                className="group flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, var(--ip-accent), var(--ip-accent-secondary))',
                  boxShadow: '0 4px 24px rgba(129,140,248,0.3)',
                }}>
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            <button className="group flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              style={{
                border: '1px solid rgba(129,140,248,0.4)',
                color: 'var(--ip-accent)',
                background: 'rgba(129,140,248,0.05)',
                backdropFilter: 'blur(8px)',
              }}>
              <Play className="w-5 h-5" />
              Learn More
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { emoji: '📄', value: '40k+', label: 'Docs Simplified' },
              { emoji: '🌍', value: '3+', label: 'Languages' },
              { emoji: '⚖️', value: '99%', label: 'Accuracy' },
              { emoji: '⚡', value: '24/7', label: 'Available' },
            ].map((stat, i) => (
              <div key={i} className="text-center rounded-2xl p-4 transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(129,140,248,0.06), rgba(167,139,250,0.03))',
                  border: '1px solid rgba(129,140,248,0.12)',
                }}>
                <div className="text-2xl font-bold mb-1 flex items-center justify-center gap-1" style={{ color: 'var(--ip-text-primary)' }}>
                  {stat.emoji} {stat.value}
                </div>
                <div className="text-sm" style={{ color: 'var(--ip-text-tertiary)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;