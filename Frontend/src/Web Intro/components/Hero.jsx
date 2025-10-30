import React from 'react';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import AINetwork3D from './AINetwork3D';
import AI3DElements from './AI3DElements';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Hero = () => {

    const {token} = useSelector((state) => state.auth);



  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-accent/10 to-bg-secondary"></div>
      
      {/* AI Network Background */}
      <AINetwork3D className="opacity-30" />
      
      {/* AI 3D Elements */}
      <AI3DElements variant="default" />
      
      {/* Enhanced 3D Floating Elements */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse transform-gpu"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-secondary/20 rounded-full blur-3xl animate-pulse delay-1000 transform-gpu"></div>
      </div>

      <div className="container mx-auto px-6 py-32 relative z-10">
        <div className="text-center max-w-4xl mx-auto transform-gpu">
          {/* 3D Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent/20 to-accent-secondary/20 backdrop-blur-md border border-accent/30 rounded-full px-6 py-3 mb-8 transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-accent/25">
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-accent text-sm font-medium">AI-Powered Legal Assistant</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-text-primary mb-6 leading-tight">
            Understand Your {' '}
            <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300 inline-block font-extrabold">
              <span className="text-teal-500">Rights, Anytime. Anywhere.</span>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-text-secondary mb-8 leading-relaxed font-medium">
            NyayaSathi is an AI-powered legal assistant that makes law easy to <span className="text-text-primary font-semibold">understand</span> in any language
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            {
                token ? (
                    <Link to="/chatbot" className="group px-8 py-4 bg-gradient-to-r from-accent to-accent-secondary text-surface-primary rounded-lg font-semibold hover:from-accent/80 hover:to-accent-secondary/80 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent/50 flex items-center gap-2">
                        Try Demo
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                ) : (
                    <Link to="/login" className="group px-8 py-4 bg-gradient-to-r from-accent to-accent-secondary text-surface-primary rounded-lg font-semibold hover:from-accent/80 hover:to-accent-secondary/80 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent/50 flex items-center gap-2">
                        Get Started
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                )
            }
            
            <button className="group px-8 py-4 border border-accent/50 text-accent rounded-lg font-semibold hover:bg-accent/10 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/25 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto transform-gpu">
            <div className="text-center">
              <div className="text-3xl font-bold text-text-primary mb-2 transform hover:scale-110 transition-transform duration-300 flex items-center justify-center gap-2">
                📄 40k+
              </div>
              <div className="text-text-tertiary text-sm">Docs Simplified</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-text-primary mb-2 transform hover:scale-110 transition-transform duration-300 flex items-center justify-center gap-2">
                🌍 3+
              </div>
              <div className="text-text-tertiary text-sm">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-text-primary mb-2 transform hover:scale-110 transition-transform duration-300 flex items-center justify-center gap-2">
                ⚖️ 99%
              </div>
              <div className="text-text-tertiary text-sm">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-text-primary mb-2 transform hover:scale-110 transition-transform duration-300 flex items-center justify-center gap-2">
                ⚡ 24/7
              </div>
              <div className="text-text-tertiary text-sm">Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;