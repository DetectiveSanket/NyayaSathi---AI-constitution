import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Scale,
  Home,
  MessageSquare,
  FileText,
  Brain,
  Code,
  Newspaper,
  Phone,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export function Navbar({ searchQuery, onSearchChange, isSidebarOpen, onToggleSidebar }) {

    const { theme, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { icon: Home, label: 'Home', to: '/' },
        { icon: MessageSquare, label: 'Chatbot', to: '/chatbot' },
        // { icon: FileText, label: 'Documentation', to: '/docs' },
        { icon: Brain, label: 'AI Architecture', to: '/architecture' },
        { icon: Code, label: 'Developer API', to: '/api' },
        // { icon: Newspaper, label: 'Blog', to: '/blog' },
        // { icon: Phone, label: 'Contact', to: '/contact' },
    ];

  return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-30 shadow-sm">
            <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4 max-w-screen-2xl mx-auto">
                {/* Left Side: Logo and Navigation */}
                <div className="flex items-center gap-6">
                {/* Mobile Sidebar Toggle */}
                <button
                    onClick={onToggleSidebar}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Toggle sidebar"
                >
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
                    <Scale size={20} className="text-white" />
                    </div>
                    <div className="hidden md:flex flex-col">
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                        NyayaSathi
                    </h1>
                    <span className="text-xs text-gray-500 dark:text-gray-400">AI Legal Assistant</span>
                    </div>
                </Link>

                {/* Desktop Navigation Links */}
                <nav className="hidden xl:flex items-center gap-1">
                    {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                        <NavLink
                        key={link.label}
                        to={link.to}
                        className={({ isActive }) => `
                            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                            ${isActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                            }
                        `}
                        >
                        <Icon size={16} />
                        <span>{link.label}</span>
                        </NavLink>
                    );
                    })}
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="xl:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Toggle menu"
                >
                    <Menu size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
                </div>

                {/* Right Side: Search, Theme Toggle, CTA Button */}
                <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative hidden md:block">
                    <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    />
                    <input
                    type="text"
                    placeholder="Search docs..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="
                        pl-10 pr-4 py-2 w-48 lg:w-64 rounded-lg
                        bg-gray-100 dark:bg-gray-800
                        border border-gray-200 dark:border-gray-700
                        text-gray-900 dark:text-white text-sm
                        placeholder-gray-500 dark:placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600
                        transition-all
                    "
                    />
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="
                        p-2 rounded-lg
                        bg-gray-100 dark:bg-gray-800
                        hover:bg-gray-200 dark:hover:bg-gray-700
                        transition-colors
                    "
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? (
                    <Moon size={20} className="text-gray-700 dark:text-gray-300" />
                    ) : (
                        <Sun size={20} className="text-gray-700 dark:text-gray-300" />
                    )}
                </button>

                {/* Visit NyayaSathi Button */}
                {/* <a
                    href="https://nyayasathi.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                    hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg
                    bg-blue-600 hover:bg-blue-700 text-white
                    font-medium text-sm transition-colors
                    shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50
                    "
                >
                    <span>Visit NyayaSathi</span>
                    <ExternalLink size={16} />
                </a> */}
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="xl:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg">
                <nav className="px-4 py-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
                    {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                        <NavLink
                        key={link.label}
                        to={link.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                            ${isActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                            }
                        `}
                        >
                        <Icon size={20} />
                        <span>{link.label}</span>
                        </NavLink>
                    );
                    })}

                    {/* Mobile Search */}
                    <div className="md:hidden pt-3 pb-2">
                    <div className="relative">
                        <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                        />
                        <input
                        type="text"
                        placeholder="Search documentation..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="
                            w-full pl-10 pr-4 py-3 rounded-lg
                            bg-gray-100 dark:bg-gray-800
                            border border-gray-200 dark:border-gray-700
                            text-gray-900 dark:text-white text-sm
                            placeholder-gray-500 dark:placeholder-gray-400
                            focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600
                        "
                        />
                    </div>
                    </div>

                    {/* Mobile CTA Button */}
                    <a
                    href="https://nyayasathi.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                        sm:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                        bg-blue-600 hover:bg-blue-700 text-white
                        font-medium text-sm transition-colors mt-2
                    "
                    >
                    <span>Visit NyayaSathi</span>
                    <ExternalLink size={16} />
                    </a>
                </nav>
                </div>
            )}

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                className="fixed inset-0 bg-black/30 z-[-1] xl:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </header>
    );
}
