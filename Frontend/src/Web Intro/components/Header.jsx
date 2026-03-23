import React, { useState } from 'react';
import { Menu, X, Zap } from 'lucide-react';
import ThemeSelector from './ThemeSelector';
import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const { token } = useSelector((state) => state.auth);

  return (
        <header className="fixed top-0 left-0 right-0 z-50 ip-bg-surface-primary/80 backdrop-blur-md border-b ip-border transform-gpu">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 transform hover:scale-105 transition-transform duration-300">
                    <div className="w-8 h-8 bg-gradient-to-r from-[var(--ip-accent)] to-[var(--ip-accent-secondary)] rounded-lg flex items-center justify-center transform hover:rotate-12 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--ip-accent)]/50">
                    <Zap className="w-5 h-5 ip-text-surface-primary" />
                    </div>
                    <span className="text-xl font-bold ip-text-primary">Nyayasathi</span>
                </div>

                <nav className="hidden md:flex items-center space-x-8">
                    <a href="#home" className="ip-text-secondary hover:ip-text-accent transition-all duration-300 transform hover:translate-x-2">Home</a>
                    <a href="#features" className="ip-text-secondary hover:ip-text-accent transition-all duration-300 transform hover:translate-x-2">Features</a>
                    <NavLink to="/doc" className="ip-text-secondary hover:ip-text-accent transition-all duration-300 transform hover:scale-110 hover:-translate-y-1">Doc</NavLink>
                    <a href="#about" className="ip-text-secondary hover:ip-text-accent transition-all duration-300 transform hover:translate-x-2">About</a>
                    <a href="#contact" className="ip-text-secondary hover:ip-text-accent transition-all duration-300 transform hover:translate-x-2">Contact</a>
                </nav>

                <div className="hidden md:flex items-center space-x-4">
                    <ThemeSelector />

                    { token ? (
                        <button className="px-6 py-2 bg-gradient-to-r from-[var(--ip-accent)] to-[var(--ip-accent-secondary)] ip-text-surface-primary rounded-lg hover:opacity-80 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-lg">
                            <Link to="/chatbot" className="ip-text-surface-primary"> Go to Chatbot </Link>
                        </button>
                        ) : (
                            <button className="px-6 py-2 bg-gradient-to-r from-[var(--ip-accent)] to-[var(--ip-accent-secondary)] ip-text-surface-primary rounded-lg hover:opacity-80 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-lg">
                                <Link to="/login" className="ip-text-surface-primary"> SignIn/Up </Link>
                            </button>
                        )
                    }
                </div>

                <button
                    className="md:hidden ip-text-primary transform hover:scale-110 transition-transform duration-300"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                </div>

                {isMenuOpen && (
                <div className="md:hidden mt-4 py-4 border-t ip-border transform animate-fade-in">
                    <nav className="flex flex-col space-y-4">
                    <a href="#home" className="ip-text-secondary hover:ip-text-accent transition-all duration-300 transform hover:translate-x-2">Home</a>
                    <a href="#features" className="ip-text-secondary hover:ip-text-accent transition-all duration-300 transform hover:translate-x-2">Features</a>
                    <a href="#how-it-works" className="ip-text-secondary hover:ip-text-accent transition-all duration-300 transform hover:translate-x-2">How It Works</a>
                    <a href="#technology" className="ip-text-secondary hover:ip-text-accent transition-all duration-300 transform hover:translate-x-2">Technology</a>
                    <a href="#impact" className="ip-text-secondary hover:ip-text-accent transition-all duration-300 transform hover:translate-x-2">Impact</a>
                    <a href="#about" className="ip-text-secondary hover:ip-text-accent transition-all duration-300 transform hover:translate-x-2">About</a>
                    <a href="#contact" className="ip-text-secondary hover:ip-text-accent transition-all duration-300 transform hover:translate-x-2">Contact</a>
                    </nav>
                    <div className="flex flex-col space-y-2 mt-4">
                        {
                            token ? (
                                <button className="px-6 py-2 bg-gradient-to-r from-[var(--ip-accent)] to-[var(--ip-accent-secondary)] ip-text-surface-primary rounded-lg hover:opacity-80 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                                    <Link to="/chatbot" className="ip-text-surface-primary"> Go to Chatbot </Link>
                                </button>
                            ) : (
                                <button className="px-6 py-2 bg-gradient-to-r from-[var(--ip-accent)] to-[var(--ip-accent-secondary)] ip-text-surface-primary rounded-lg hover:opacity-80 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                                    <Link to="/login" className="ip-text-surface-primary"> SignIn/Up </Link>
                                </button>
                            )
                        }
                    </div>
                </div>
                )}
            </div>
        </header>
    );
};

export default Header;