import React from 'react';
import { Brain, Search, Mic } from 'lucide-react';
import AI3DElements from './AI3DElements';

const Technology = () => {
  const technologies = [
    {
      icon: Brain,
      title: 'LLM + NLP',
      subtitle: 'Simplification',
      description: 'Advanced language models for legal text processing',
      color: 'from-accent to-accent-secondary'
    },
    {
      icon: Search,
      title: 'RAG Pipeline',
      subtitle: 'Smart document search',
      description: 'Retrieval-augmented generation for accurate legal information',
      color: 'from-accent-secondary to-accent'
    },
    {
      icon: Mic,
      title: 'Voice + Text',
      subtitle: 'Accessible to all',
      description: 'Multi-modal interaction for universal accessibility',
      color: 'from-accent to-accent-secondary'
    }
  ];

  return (
        <section id="technology" className="py-20 bg-bg-primary relative overflow-hidden">
        {/* 3D Background Grid */}
        <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
            backgroundImage: `
                linear-gradient(var(--accent) 1px, transparent 1px),
                linear-gradient(90deg, var(--accent) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            // animation: 'grid-move 20s linear infinite'
            }}></div>
        </div>

        {/* AI 3D Elements */}
        <AI3DElements variant="quantum" />

        <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
                    Powered by{' '}
                    <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent font-extrabold">
                        Advanced AI
                    </span>
                </h2>
                <p className="text-xl text-text-secondary max-w-2xl mx-auto font-medium">
                    Cutting-edge technology stack designed for legal intelligence
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {technologies.map((tech, index) => {
                const Icon = tech.icon;
                return (
                <div key={index} className="group relative">
                    <div className="bg-surface-secondary/80 backdrop-blur-md rounded-2xl border border-border p-8 text-center transform hover:scale-105 hover:-translate-y-6 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/25 hover:border-accent/40 group-hover:rotate-1"
                        style={{
                            transform: `perspective(1000px) rotateX(${Math.sin(index * 0.7) * 3}deg) rotateY(${Math.cos(index * 0.5) * 3}deg)`,
                            animationDelay: `${index * 150}ms`
                        }}>
                    
                    <div className="mb-6">
                        <div className={`w-20 h-20 bg-gradient-to-br ${tech.color} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-accent/50`}>
                            <Icon className="w-10 h-10 text-surface-primary" />
                        </div>
                        <h3 className="text-2xl font-bold text-text-primary mb-2 group-hover:text-accent transition-colors duration-300">
                        {tech.title}
                        </h3>
                        <div className="text-accent font-semibold mb-3 text-lg">
                        {tech.subtitle}
                        </div>
                        <p className="text-text-secondary leading-relaxed">
                        {tech.description}
                        </p>
                    </div>

                    {/* Tech indicator */}
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-accent-secondary rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-200"></div>
                    </div>
                    </div>
                </div>
                );
            })}
            </div>

        </div>
        </section>
    );
};

export default Technology;