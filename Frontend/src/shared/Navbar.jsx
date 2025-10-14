import React, { useState } from 'react'
import { NavLink } from 'react-router-dom';

function Navbar() {
  const [open, setOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-transparent backdrop-blur-md">
            <nav className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
                <NavLink to="/" className="text-white text-xl sm:text-2xl font-bold">NyayaSathi</NavLink>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-6">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `transition ${isActive ? 'text-orange-500 hover:text-white' : 'text-white/90 hover:text-cyan-600'}`
                        }
                        end
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/login"
                        
                        className={({ isActive }) =>
                        `transition ${isActive ? 'text-orange-500 hover:text-white' : 'text-white/90 hover:text-cyan-600'}`
                        }
                    >
                        Log In
                    </NavLink>

                    <NavLink
                        to="/register"
                        className={({ isActive }) =>
                            `transition ${isActive ? 'text-orange-500 hover:text-white' : 'text-white/90 hover:text-cyan-600'}`
                        }
                    >
                        Register
                    </NavLink>
                </div>

                {/* Mobile menu button */}
                <button
                    type="button"
                    aria-label="Toggle menu"
                    aria-expanded={open}
                    className="md:hidden inline-flex items-center justify-center rounded-md border border-white/10 px-3 py-2 text-white/90 hover:text-white hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
                    onClick={() => setOpen((v) => !v)}
                >
                    <span className="sr-only">Open main menu</span>

                    {/* Simple hamburger icon using spans */}
                    <span className="block w-5 h-0.5 bg-white mb-1"></span>
                    <span className="block w-5 h-0.5 bg-white mb-1"></span>
                    <span className="block w-5 h-0.5 bg-white"></span>

                </button>
            </nav>

        {/* Mobile dropdown */}
            {open && (
                <div className="md:hidden border-t border-white/10 bg-black/50 backdrop-blur-md">
                    <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-3">
                        <NavLink
                            onClick={() => setOpen(false)}
                            to="/"
                            className={({ isActive }) => `transition ${isActive ? 'text-orange-400' : 'text-white/90 hover:text-white'}`}
                            end
                        >
                            Home
                        </NavLink>

                        <NavLink
                            onClick={() => setOpen(false)}
                            to="/login"
                            className={({ isActive }) => `transition ${isActive ? 'text-orange-400' : 'text-white/90 hover:text-white'}`}
                        >
                            Log In
                        </NavLink>

                        <NavLink
                            onClick={() => setOpen(false)}
                            to="/register"
                            className={({ isActive }) => `transition ${isActive ? 'text-orange-400' : 'text-white/90 hover:text-white'}`}
                        >
                            Register
                        </NavLink>
                        
                    </div>
                </div>
            )}
        </header>
    )
}

export default Navbar;