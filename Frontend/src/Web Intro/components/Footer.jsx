import React from 'react';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import logo from '../../assets/Logo/logo 1.png';

const Footer = () => {
  return (
    <footer className="relative border-t overflow-hidden" style={{ background: 'var(--ip-bg-primary)', borderColor: 'var(--ip-border)' }}>

      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(90deg, transparent, var(--ip-accent), transparent)',
        opacity: 0.3,
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(129,140,248,0.05) 0%, transparent 60%)',
      }} />

      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              {/* Logo in white container */}
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-white p-0.5 shadow-md flex-shrink-0">
                <img src={logo} alt="NyayaSathi Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold" style={{ color: 'var(--ip-text-primary)' }}>
                Nyaya<span style={{ color: 'var(--ip-accent)' }}>Sathi</span>
              </span>
            </div>

            <p className="text-sm leading-relaxed mb-6 max-w-sm" style={{ color: 'var(--ip-text-secondary)' }}>
              NyayaSathi is an AI-powered legal assistant that makes law accessible to everyone — in their own language, anytime.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                { href: 'https://github.com/Sanketniza', Icon: Github },
                { href: '#', Icon: Twitter },
                { href: 'https://www.linkedin.com/in/sanket-talekar-94087a263', Icon: Linkedin },
                { href: '#', Icon: Mail },
              ].map(({ href, Icon }, i) => (
                <a key={i} href={href} target={href !== '#' ? '_blank' : undefined} rel="noreferrer"
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ background: 'var(--ip-surface-secondary)', color: 'var(--ip-text-tertiary)', border: '1px solid var(--ip-border)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--ip-accent)'; e.currentTarget.style.borderColor = 'var(--ip-accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--ip-text-tertiary)'; e.currentTarget.style.borderColor = 'var(--ip-border)'; }}>
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--ip-text-primary)' }}>
              Product
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Dashboard', href: '#' },
                { label: 'Analytics', href: '#' },
                { label: 'Integrations', href: '#' },
                { label: 'API', href: '#' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm transition-colors duration-200"
                    style={{ color: 'var(--ip-text-secondary)' }}
                    onMouseEnter={e => e.target.style.color = 'var(--ip-accent)'}
                    onMouseLeave={e => e.target.style.color = 'var(--ip-text-secondary)'}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--ip-text-primary)' }}>
              Company
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'About', href: '#about' },
                { label: 'Blog', href: '#' },
                { label: 'Careers', href: '#' },
                { label: 'Press', href: '#' },
                { label: 'Partners', href: '#' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm transition-colors duration-200"
                    style={{ color: 'var(--ip-text-secondary)' }}
                    onMouseEnter={e => e.target.style.color = 'var(--ip-accent)'}
                    onMouseLeave={e => e.target.style.color = 'var(--ip-text-secondary)'}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--ip-border)' }}>
          <p className="text-sm" style={{ color: 'var(--ip-text-tertiary)' }}>
            © 2025 NyayaSathi. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Support'].map((label) => (
              <a key={label} href="#" className="text-sm transition-colors duration-200"
                style={{ color: 'var(--ip-text-tertiary)' }}
                onMouseEnter={e => e.target.style.color = 'var(--ip-accent)'}
                onMouseLeave={e => e.target.style.color = 'var(--ip-text-tertiary)'}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;