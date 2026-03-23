import React from 'react';
import { FileText, Globe, Upload, Scale, ArrowBigRight } from 'lucide-react';
import AI3DElements from './AI3DElements';
import SpotlightCard from '../../../components/nurui/SpotlightCard';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Features = () => {

  const { token } = useSelector((state) => state.auth);
  const features = [
    {
      icon: FileText,
      title: 'Plain Language Law',
      description: 'Legal jargon turned into simple words.',
      color: 'ip-text-accent',
      glow: 'purple',
    },
    {
      icon: Globe,
      title: 'Multilingual Support',
      description: 'English, Hindi, Marathi (text & voice).',
      color: 'ip-text-accent-secondary',
      glow: 'purple',
    },
    {
      icon: Upload,
      title: 'Upload & Query',
      description: 'Ask questions directly from documents.',
      color: 'ip-text-accent',
      glow: 'purple',
    },
    {
      icon: Scale,
      title: 'Incident Guide',
      description: 'Get IPC sections & punishments for real-life cases.',
      color: 'ip-text-accent-secondary',
      glow: 'purple',
    }
  ];

  return (
        <section id="features" className="py-20 bg-gradient-to-b from-[var(--ip-bg-primary)] to-[var(--ip-bg-secondary)] relative overflow-hidden">
        {/* AI 3D Elements */}
        <AI3DElements variant="cubes" />
        
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold ip-text-primary mb-6">
                        Everything you need to{' '}
                        <span className="bg-gradient-to-r from-[var(--ip-accent)] to-[var(--ip-accent-secondary)] bg-clip-text text-transparent font-extrabold">
                        <span className="ip-text-primary">understand the law</span>
                        </span>
                    </h2>
                    <p className="text-xl ip-text-secondary max-w-2xl mx-auto font-medium">
                        <span className="ip-text-primary font-semibold">Clearly and quickly</span>
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                        <SpotlightCard key={index} glowColor={feature.glow} size="md" className="rounded-2xl border ip-border p-8 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-[var(--ip-accent)]/20 to-[var(--ip-accent-secondary)]/20 rounded-xl flex items-center justify-center mb-6 mx-auto group">
                                <Icon className={`w-8 h-8 ${feature.color} transition-transform duration-300 group-hover:scale-125 group-hover:ip-text-accent`} />
                            </div>
                            
                            <h3 className="text-xl font-bold ip-text-primary mb-4">
                                {feature.title}
                            </h3>
                                <p className="ip-text-secondary leading-relaxed">
                                {feature.description}
                            </p>
                        </SpotlightCard>
                        );
                    })}
                </div>

                {/* CTA Section */}
                <div className="text-center mt-16">

                <div className="bg-gradient-to-r from-[var(--ip-accent)]/10 to-[var(--ip-accent-secondary)]/10 border border-[#123156] rounded-2xl p-12 max-w-4xl mx-auto transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--ip-accent)]/25 hover:border-[var(--ip-accent)]/40">
                    <h3 className="text-3xl font-bold ip-text-primary mb-4">
                        Ready to simplify legal complexity?
                    </h3>

                    <p className="ip-text-secondary mb-8 text-lg">
                        Join thousands already using NyayaSathi for legal clarity
                    </p>
                    
                    {
                        token ? (
                            <button className="px-8 py-4 text-amber-700 bg-gradient-to-r from-[var(--ip-accent)] to-[var(--ip-accent-secondary)] ip-text-surface-primary rounded-lg font-semibold hover:opacity-80 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[var(--ip-accent)]/50">
                                Try NyayaSathi Now
                                <ArrowBigRight className="w-5 h-5 inline-block ml-2 -rotate-90" />
                            </button>
                        ) : (
                            <Link to="/login" className="px-8 py-4 text-orange-600 bg-gradient-to-r from-[var(--ip-accent)] to-[var(--ip-accent-secondary)] ip-text-surface-primary rounded-lg font-semibold hover:opacity-80 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[var(--ip-accent)]/50">
                                Get Started
                                <ArrowBigRight className="w-5 h-5 inline-block ml-2 -rotate-90" />
                            </Link>
                        )
                    }
                </div>

                </div>
            </div>
        </section>
    );
};

export default Features;