import { lazy, Suspense } from 'react';
import React from 'react';
import { Award } from 'lucide-react';
import Loading from '../../shared/Loading';

const AI3DElements = lazy(() => import('./AI3DElements'));

const About = () => {
    return (
        <section id="about" className="py-20 bg-gradient-to-b from-[var(--ip-bg-secondary)] to-[var(--ip-bg-tertiary)] relative overflow-hidden">
            <Suspense fallback={<Loading />}>
                <AI3DElements variant="brain" />
            </Suspense>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold ip-text-primary mb-6">
                    About{' '}
                    <span className="bg-gradient-to-r from-[var(--ip-accent)] to-[var(--ip-accent-secondary)] bg-clip-text text-transparent font-extrabold">
                    <span className="ip-text-primary">NyayaSathi</span>
                    </span>
                </h2>
                </div>

                {/* Team Story */}
                <div className="max-w-4xl mx-auto mb-16">
                <div className="ip-bg-surface-secondary/80 backdrop-blur-md rounded-3xl border ip-border p-12 transform hover:scale-[1.02] hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--ip-accent)]/25 subtle-running-border">
                    <div className="flex items-center justify-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-[var(--ip-accent)] to-[var(--ip-accent-secondary)] rounded-2xl flex items-center justify-center transform hover:scale-125 hover:rotate-12 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--ip-accent)]/50">
                        <Award className="w-10 h-10 ip-text-surface-primary" />
                    </div>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 bg-clip-text text-transparent">
                    We are a team of engineers from D.Y. Patil College
                    </h3>
                    
                    <p className="ip-text-secondary text-lg leading-relaxed text-center max-w-2xl mx-auto">
                    Building NyayaSathi to bring "Justice for All" with AI
                    </p>
                </div>
                </div>
            </div>
        </section>
    );
};

export default About;