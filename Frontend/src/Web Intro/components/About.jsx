import {lazy , Suspense} from 'react';
import React from 'react';
import { Award } from 'lucide-react';

// import AI3DElements from './AI3DElements';
const AI3DElements = lazy(() => import('./AI3DElements'));
import Loading from '../../shared/Loading';

const About = () => {
    return (
        <section id="about" className="py-20 bg-gradient-to-b from-bg-secondary to-bg-tertiary relative overflow-hidden">
            {/* AI 3D Elements */}
            {/* <AI3DElements variant="brain" /> */}

            <Suspense fallback={<Loading />}>
                <AI3DElements variant="brain" />
            </Suspense>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                <h2 className=" text-4xl md:text-5xl font-bold text-text-primary mb-6">
                    About{' '}
                    <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent font-extrabold">
                    <span className="text-text-primary">NyayaSathi</span>
                    </span>
                </h2>
                </div>

                {/* Team Story */}
                <div className="max-w-4xl mx-auto mb-16">
                <div className="bg-surface-secondary/80 backdrop-blur-md rounded-3xl border border-border p-12 transform hover:scale-[1.02] hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/25 subtle-running-border">
                    <div className="flex items-center justify-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent-secondary rounded-2xl flex items-center justify-center transform hover:scale-125 hover:rotate-12 transition-all duration-300 hover:shadow-lg hover:shadow-accent/50">
                        <Award className="w-10 h-10 text-surface-primary" />
                    </div>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-bold  text-center mb-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 bg-clip-text text-transparent">
                    We are a team of engineers from D.Y. Patil College
                    </h3>
                    
                    <p className="text-text-secondary text-lg leading-relaxed text-center max-w-2xl mx-auto">
                    Building NyayaSathi to bring "Justice for All" with AI
                    </p>
                </div>
                </div>
            </div>
        </section>
    );
};

export default About;