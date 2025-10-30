import React from 'react';
import { Zap, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-purple-500/20">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">NexFlow</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Transform your workflow with our cutting-edge platform designed for modern teams. 
              Experience the future of productivity today.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/Sanketniza" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-200">
                <Github className="w-5 h-5" />
              </a>

              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-200">
                <Twitter className="w-5 h-5" />
              </a>

              <a href="https://www.linkedin.com/in/sanket-talekar-94087a263" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-200">
                <Linkedin className="w-5 h-5" />
              </a>

              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-200">
                <Mail className="w-5 h-5" />
              </a>
              
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li><a href="#features" className="text-gray-400 hover:text-purple-400 transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Dashboard</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Analytics</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Integrations</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">API</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="#about" className="text-gray-400 hover:text-purple-400 transition-colors">About</a></li>
              <li><a href="#Blog" className="text-gray-400 hover:text-purple-400 transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Press</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Partners</a></li>
                    
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2025 Nyayasathi. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;