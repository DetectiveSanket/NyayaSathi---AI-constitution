import React from 'react';

const Stats = () => {
  const stats = [
    { value: '40.8k', label: 'Active Users', change: '+12.5%' },
    { value: '21.4%', label: 'Growth Rate', change: '+3.2%' },
    { value: '19.7k', label: 'Projects Created', change: '+8.7%' },
    { value: '99.9%', label: 'Uptime', change: '+0.1%' }
  ];

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Thousand users in{' '}
            <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              one work week
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            See how our platform is growing and helping teams worldwide
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group transform-gpu">
              <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-purple-500/20 rounded-2xl p-8 group-hover:border-purple-500/40 transition-all duration-500 transform group-hover:scale-110 group-hover:-translate-y-4 group-hover:shadow-2xl group-hover:shadow-purple-500/25"
                   style={{
                     transform: `perspective(1000px) rotateX(${Math.sin(index * 0.8) * 3}deg) rotateY(${Math.cos(index * 0.6) * 3}deg)`,
                     animationDelay: `${index * 150}ms`
                   }}>
                <div className="text-4xl md:text-5xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="text-gray-400 mb-2">{stat.label}</div>
                <div className="text-green-400 text-sm font-semibold group-hover:scale-110 transition-transform duration-300">
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional visual elements */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-violet-500/20 blur-3xl animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-md rounded-3xl p-6 sm:p-12 max-w-4xl mx-auto transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/25 subtle-glow-border">
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6">
                Join the revolution
              </h3>
              <p className="text-gray-400 mb-6 sm:mb-8 text-base sm:text-lg">
                Be part of the next generation of productivity tools
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
                <div className="text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mb-3 mx-auto transform hover:scale-125 hover:rotate-12 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <p className="text-gray-400 text-sm sm:text-base">Upload / Ask</p>
                </div>
                {/* Connector — horizontal on sm+, vertical dot on xs */}
                <div className="hidden sm:block w-8 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse"></div>
                <div className="block sm:hidden w-px h-4 bg-gradient-to-b from-transparent via-purple-500 to-transparent animate-pulse"></div>
                <div className="text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mb-3 mx-auto transform hover:scale-125 hover:rotate-12 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <p className="text-gray-400 text-sm sm:text-base">AI Simplifies &amp; Translates</p>
                </div>
                {/* Connector */}
                <div className="hidden sm:block w-8 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse"></div>
                <div className="block sm:hidden w-px h-4 bg-gradient-to-b from-transparent via-purple-500 to-transparent animate-pulse"></div>
                <div className="text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mb-3 mx-auto transform hover:scale-125 hover:rotate-12 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50">
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <p className="text-gray-400 text-sm sm:text-base">Get Answers with References</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;