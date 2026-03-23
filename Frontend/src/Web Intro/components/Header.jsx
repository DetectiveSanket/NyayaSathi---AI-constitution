import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import ThemeSelector from './ThemeSelector';
import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import logo from '../../assets/Logo/logo 1.png';

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
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--ip-border)' : '1px solid transparent',
        backgroundColor: scrolled ? 'var(--ip-surface-primary)' : 'transparent',
      }}>
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            {/* White rounded container so the gray logo bg looks clean in all themes */}
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white p-0.5 shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all duration-300 flex-shrink-0">
              <img
                src={logo}
                alt="NyayaSathi Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--ip-text-primary)' }}>
              Nyaya<span style={{ color: 'var(--ip-accent)' }}>Sathi</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {['Home', 'Features', 'About', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-sm font-medium transition-colors duration-200"
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
          <div className="md:hidden mt-4 rounded-2xl"
            style={{
              background: 'var(--ip-surface-secondary)',
              border: '1px solid var(--ip-border)',
              padding: '1rem 1.5rem',
            }}>
            <nav className="flex flex-col gap-4 mb-4">
              {['Home', 'Features', 'About', 'Contact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium"
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