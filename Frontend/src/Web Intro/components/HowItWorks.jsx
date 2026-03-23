import React from 'react';
import { Upload, Brain, CheckCircle, ArrowRight } from 'lucide-react';
import AI3DElements from './AI3DElements';

const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: 'Upload or Ask',
      description: 'Upload documents or ask questions directly',
      color: 'from-[var(--ip-accent)] to-[var(--ip-accent-secondary)]'
    },
    {
      icon: Brain,
      title: 'AI Simplifies & Translates',
      description: 'AI processes and translates complex legal text',
      color: 'from-[var(--ip-accent-secondary)] to-[var(--ip-accent)]'
    },
    {
      icon: CheckCircle,
      title: 'Get Clear Answers',
      description: 'Simplified explanations with legal references',
      color: 'from-[var(--ip-accent)] to-[var(--ip-accent-secondary)]'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-[var(--ip-bg-secondary)] to-[var(--ip-bg-tertiary)] relative overflow-hidden">
      {/* AI 3D Elements */}
      <AI3DElements variant="neural" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold ip-text-primary mb-6">
            How{' '}
            <span className="bg-gradient-to-r from-[var(--ip-accent)] to-[var(--ip-accent-secondary)] bg-clip-text text-transparent font-extrabold">
              <span className="ip-text-primary">It Works</span>
            </span>
          </h2>
          <p className="text-xl ip-text-secondary max-w-2xl mx-auto font-medium">
            <span className="ip-text-primary font-semibold">Simple steps to get legal clarity in minutes</span>
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Connecting line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-[var(--ip-accent)] to-transparent animate-pulse z-10">
                      <ArrowRight className="absolute -right-2 -top-2 w-4 h-4 ip-text-accent" />
                    </div>
                  )}
                  
                  <div className="ip-bg-surface-secondary/80 backdrop-blur-md rounded-2xl border ip-border p-8 text-center transform hover:scale-105 hover:-translate-y-4 transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--ip-accent)]/25 hover:border-[var(--ip-accent)]/40 group"
                       style={{
                         transform: `perspective(1000px) rotateX(${Math.sin(index * 0.5) * 2}deg) rotateY(${Math.cos(index * 0.3) * 2}deg)`,
                         animationDelay: `${index * 200}ms`
                       }}>
                    
                    {/* Step number */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className={`w-8 h-8 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center ip-text-surface-primary font-bold text-sm group-hover:scale-125 transition-transform duration-300`}>
                        {index + 1}
                      </div>
                    </div>

                    <div className="mt-4 mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-[var(--ip-accent)]/50`}>
                        <Icon className="w-8 h-8 ip-text-surface-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0073ff] mb-3 group-hover:ip-text-accent transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="ip-text-secondary leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;