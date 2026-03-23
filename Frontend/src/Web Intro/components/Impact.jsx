import React from 'react';
import { Users, GraduationCap, Scale, Heart } from 'lucide-react';
import AI3DElements from './AI3DElements';
import ShinyCard from '../../../components/nurui/shiny-card';

const Impact = () => {
  const impactGroups = [
    {
      icon: <Users className="w-8 h-8 ip-text-accent transition-transform duration-300 group-hover:scale-125" />,
      title: 'Citizens',
      description: 'Empowering everyday people with legal knowledge',
    },
    {
      icon: <GraduationCap className="w-8 h-8 ip-text-accent-secondary transition-transform duration-300 group-hover:scale-125" />,
      title: 'Students',
      description: 'Making legal education accessible and understandable',
    },
    {
      icon: <Scale className="w-8 h-8 ip-text-accent transition-transform duration-300 group-hover:scale-125" />,
      title: 'Lawyers',
      description: 'Streamlining legal research and client communication',
    },
    {
      icon: <Heart className="w-8 h-8 ip-text-accent-secondary transition-transform duration-300 group-hover:scale-125" />,
      title: 'NGOs',
      description: 'Supporting social justice initiatives with legal clarity',
    }
  ];

  return (
    <section id="impact" className="py-20 bg-gradient-to-b from-[var(--ip-bg-primary)] to-[var(--ip-bg-secondary)] relative overflow-hidden">
      {/* AI 3D Elements */}
      <AI3DElements variant="quantum" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold ip-text-primary mb-6">
            Helping citizens, students, lawyers, NGOs access justice —{' '}
            <span className="bg-gradient-to-r from-[var(--ip-accent)] to-[var(--ip-accent-secondary)] bg-clip-text text-transparent font-extrabold">
              <span className="ip-text-primary">simple, fast, and inclusive</span>
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          {impactGroups.map((group, index) => (
            <ShinyCard
              key={index}
              icon={group.icon}
              featureName={group.title}
              featureDescription={group.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Impact;