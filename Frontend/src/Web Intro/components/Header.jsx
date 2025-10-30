import React, { useState } from 'react';
import { Menu, X, Zap } from 'lucide-react';
import ThemeSelector from './ThemeSelector';
import { Link , NavLink} from 'react-router-dom';
import { useSelector } from 'react-redux';


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const {token} = useSelector((state) => state.auth);
 

//   if(loginUser){
//     return null; // Don't render header if user is logged in
//   }

  return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-surface-primary/80 backdrop-blur-md border-b border-border transform-gpu">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 transform hover:scale-105 transition-transform duration-300">
                    <div className="w-8 h-8 bg-gradient-to-r from-accent to-accent-secondary rounded-lg flex items-center justify-center transform hover:rotate-12 transition-all duration-300 hover:shadow-lg hover:shadow-accent/50">
                    <Zap className="w-5 h-5 text-surface-primary" />
                        {/* <img src="./src/assets/logo1.png" alt="Logo" className="w-5 h-5" /> */}
                    </div>
                    <span className="text-xl font-bold text-text-primary">Nyayasathi</span>
                </div>

                <nav className="hidden md:flex items-center space-x-8">

                    <a href="#home" className="text-text-secondary hover:text-accent transition-all duration-300 transform hover:translate-x-2">Home</a>
                    <a href="#features" className="text-text-secondary hover:text-accent transition-all duration-300 transform hover:translate-x-2">Features</a>
                    
                    <NavLink to="/doc" className="text-text-secondary hover:text-accent transition-all duration-300 transform hover:scale-110 hover:-translate-y-1">Doc</NavLink>
                    <a href="#about" className="text-text-secondary hover:text-accent transition-all duration-300 transform hover:translate-x-2">About</a>
                    <a href="#contact" className="text-text-secondary hover:text-accent transition-all duration-300 transform hover:translate-x-2">Contact</a>
                    
                </nav>

                <div className="hidden md:flex items-center space-x-4">
                    <ThemeSelector />

                    { token ? (
                        <button className="px-6 py-2 bg-gradient-to-r from-accent to-accent-secondary text-surface-primary rounded-lg hover:from-accent/80 hover:to-accent-secondary/80 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/50">
                            <Link to="/chatbot" className="text-text-secondary"> Go to Chatbot </Link>
                        </button>
                        ) : (
                            <button className="px-6 py-2 bg-gradient-to-r from-accent to-accent-secondary text-surface-primary rounded-lg hover:from-accent/80 hover:to-accent-secondary/80 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/50">
                                <Link to="/login" className="text-text-secondary"> SignIn/Up </Link>
                            </button>
                        )
                    }
                </div>

                <button 
                    className="md:hidden text-text-primary transform hover:scale-110 transition-transform duration-300"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                </div>

                {isMenuOpen && (
                <div className="md:hidden mt-4 py-4 border-t border-border transform animate-fade-in">
                    <nav className="flex flex-col space-y-4">
                    <a href="#home" className="text-text-secondary hover:text-accent transition-all duration-300 transform hover:translate-x-2">Home</a>
                    <a href="#features" className="text-text-secondary hover:text-accent transition-all duration-300 transform hover:translate-x-2">Features</a>
                    <a href="#how-it-works" className="text-text-secondary hover:text-accent transition-all duration-300 transform hover:translate-x-2">How It Works</a>
                    <a href="#technology" className="text-text-secondary hover:text-accent transition-all duration-300 transform hover:translate-x-2">Technology</a>
                    <a href="#impact" className="text-text-secondary hover:text-accent transition-all duration-300 transform hover:translate-x-2">Impact</a>
                    <a href="#about" className="text-text-secondary hover:text-accent transition-all duration-300 transform hover:translate-x-2">About</a>
                    <a href="#contact" className="text-text-secondary hover:text-accent transition-all duration-300 transform hover:translate-x-2">Contact</a>
                    </nav>
                    <div className="flex flex-col space-y-2 mt-4">
                        {
                            token ? (
                                <button className="px-6 py-2 bg-gradient-to-r from-accent to-accent-secondary text-surface-primary rounded-lg hover:from-accent/80 hover:to-accent-secondary/80 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-accent/50">
                                    <Link to="/chatbot" className="text-text-secondary"> Go to Chatbot </Link>
                                </button>
                            ) : (
                                <button className="px-6 py-2 bg-gradient-to-r from-accent to-accent-secondary text-surface-primary rounded-lg hover:from-accent/80 hover:to-accent-secondary/80 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-accent/50">
                                    <Link to="/login" className="text-text-secondary"> SignIn/Up </Link>
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