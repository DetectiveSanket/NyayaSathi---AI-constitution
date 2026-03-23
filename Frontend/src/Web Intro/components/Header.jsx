import React, { useState, useEffect } from 'react';
import { Menu, X, Zap } from 'lucide-react';
import ThemeSelector from './ThemeSelector';
import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(var(--ip-surface-primary-rgb, 16,19,42), 0.92)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--ip-border)' : '1px solid transparent',
        backgroundColor: scrolled ? 'var(--ip-surface-primary)' : 'transparent',
        opacity: 0.98,
      }}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, var(--ip-accent), var(--ip-accent-secondary))' }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: 'var(--ip-text-primary)' }}>
              Nyayasathi
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {['Home', 'Features', 'About', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-sm font-medium transition-colors duration-200 hover:opacity-80"
                style={{ color: 'var(--ip-text-secondary)' }}
                onMouseEnter={e => e.target.style.color = 'var(--ip-accent)'}
                onMouseLeave={e => e.target.style.color = 'var(--ip-text-secondary)'}>
                {item}
              </a>
            ))}
            <NavLink to="/doc"
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--ip-text-secondary)' }}
              onMouseEnter={e => e.target.style.color = 'var(--ip-accent)'}
              onMouseLeave={e => e.target.style.color = 'var(--ip-text-secondary)'}>
              Docs
            </NavLink>
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeSelector />
            {token ? (
              <Link to="/chatbot"
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, var(--ip-accent), var(--ip-accent-secondary))' }}>
                Go to Chatbot
              </Link>
            ) : (
              <Link to="/login"
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, var(--ip-accent), var(--ip-accent-secondary))' }}>
                Sign In / Up
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden transition-colors duration-200" onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ color: 'var(--ip-text-primary)' }}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 rounded-2xl"
            style={{
              background: 'var(--ip-surface-secondary)',
              border: '1px solid var(--ip-border)',
              padding: '1rem 1.5rem',
            }}>
            <nav className="flex flex-col gap-4 mb-4">
              {['Home', 'Features', 'About', 'Contact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium transition-colors duration-200"
                  style={{ color: 'var(--ip-text-secondary)' }}
                  onClick={() => setIsMenuOpen(false)}>
                  {item}
                </a>
              ))}
            </nav>
            {token ? (
              <Link to="/chatbot" onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, var(--ip-accent), var(--ip-accent-secondary))' }}>
                Go to Chatbot
              </Link>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, var(--ip-accent), var(--ip-accent-secondary))' }}>
                Sign In / Up
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;