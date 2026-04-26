import React from 'react';
import { BarChart3, TrendingUp, Users, Zap, Layers, Activity } from 'lucide-react';

const Dashboard = () => {
  return (
    <section id="dashboard" className="py-20 bg-black/50 overflow-x-hidden">
      {/* 3D Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 right-20 w-32 h-32 bg-gradient-to-br from-purple-500/30 to-violet-600/30 rounded-2xl transform rotate-12 animate-float-slow"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-br from-violet-500/30 to-purple-600/30 rounded-full animate-float-medium"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-gradient-to-br from-purple-400/40 to-violet-500/40 transform rotate-45 animate-float-fast"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            A new way to manage{' '}
            <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300 inline-block">
              everything
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Streamline your workflow with our intuitive dashboard that brings all your tools together
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-md rounded-2xl p-4 sm:p-8 shadow-2xl transform hover:scale-[1.02] transition-all duration-500 hover:shadow-purple-500/20 hover:-translate-y-2 subtle-glow-border">
            {/* Dashboard header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Project Overview</h3>
                <p className="text-gray-400">Monitor your progress and performance</p>
              </div>
              <div className="flex items-center gap-3 transform hover:scale-110 transition-transform duration-300">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse delay-100"></div>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse delay-200"></div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:border-purple-500/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-green-400 text-sm font-semibold">+12.5%</span>
                </div>
                <div className="text-2xl font-bold text-white mb-2">2,847</div>
                <div className="text-gray-400 text-sm">Total Projects</div>
              </div>

              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-6 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/25 hover:border-violet-500/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-violet-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-violet-400" />
                  </div>
                  <span className="text-green-400 text-sm font-semibold">+8.2%</span>
                </div>
                <div className="text-2xl font-bold text-white mb-2">1,429</div>
                <div className="text-gray-400 text-sm">Active Users</div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:border-blue-500/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-green-400 text-sm font-semibold">+24.7%</span>
                </div>
                <div className="text-2xl font-bold text-white mb-2">94.2%</div>
                <div className="text-gray-400 text-sm">Success Rate</div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 hover:border-emerald-500/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Zap className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-green-400 text-sm font-semibold">+15.3%</span>
                </div>
                <div className="text-2xl font-bold text-white mb-2">847ms</div>
                <div className="text-gray-400 text-sm">Avg Response</div>
              </div>
            </div>

            {/* Chart area */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50 transform hover:scale-[1.01] transition-all duration-300 hover:border-purple-500/30">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                <h4 className="text-base sm:text-lg font-semibold text-white">Performance Analytics</h4>
                <select className="bg-gray-800 text-white text-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-600 hover:border-purple-500/50 transition-colors duration-300 max-w-[140px] sm:max-w-none">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
              </div>
              
              {/* Simulated chart */}
              <div className="h-40 sm:h-64 flex items-end justify-between gap-1 sm:gap-2">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-purple-500 to-violet-400 rounded-t-lg transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50"
                      style={{ height: `${Math.random() * 180 + 20}px` }}
                    ></div>
                    <span className="text-xs text-gray-500">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;