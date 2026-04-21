import React, { useState } from 'react';
import { Mail, Github, Linkedin, Send, MapPin, Phone, Instagram, Twitter, CheckCircle, AlertCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [status, setStatus] = useState({
    loading: false,
    success: '',
    error: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: '', error: '' });

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api/v1/' : '/api/v1/');
      const response = await fetch(`${API_BASE}contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      setStatus({ 
        loading: false, 
        success: data.message || 'Message sent successfully! We\'ll get back to you within 24 hours.', 
        error: '' 
      });
      
      // Clear form
      setFormData({ name: '', email: '', message: '' });

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: '' }));
      }, 5000);

    } catch (error) {
      // console.error('Contact form error:', error);
      setStatus({ 
        loading: false, 
        success: '', 
        error: error.message || 'Something went wrong. Please try again later.' 
      });

      // Auto-hide error message after 6 seconds
      setTimeout(() => {
        setStatus(prev => ({ ...prev, error: '' }));
      }, 6000);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (status.error) {
      setStatus(prev => ({ ...prev, error: '' }));
    }
  };

  return (
        <section id="contact" className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        Get In Touch
                    </h2>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Have questions about NyayaSathi? We'd love to hear from you.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
             {/* Contact Info */}
                <div className="space-y-8">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                    <h3 className="text-2xl font-bold mb-6 text-white">Contact Information</h3>
                    
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Mail className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Email</p>
                            <p className="text-white font-medium">nyayasathi.team@gmail.com</p>
                        </div>
                        </div>

                        <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Location</p>
                            <p className="text-white font-medium">D.Y. Patil College Of Eng & Tech , Kolhapur </p>
                        </div>
                        </div>

                        <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <Phone className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Response Time</p>
                            <p className="text-white font-medium">Within 24 hours</p>
                        </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/10">
                        <p className="text-gray-400 mb-4">Follow us on social media</p>
                        <div className="flex space-x-4">
                        <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                            <Github className="w-5 h-5 text-gray-400 hover:text-white" />
                        </a>

                        <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                            <Linkedin className="w-5 h-5 text-gray-400 hover:text-white" />
                        </a>

                        <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                            <Instagram className="w-5 h-5 text-gray-400 hover:text-white" />
                        </a>

                        <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                            <Twitter className="w-5 h-5 text-gray-400 hover:text-white" />
                        </a>
                        </div>
                    </div>
                    </div>
                </div>

          {/* Contact Form */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold mb-6 text-white">Send us a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
                  placeholder="Tell us about your question or feedback..."
                  required
                ></textarea>
              </div>

              {/* Success Message */}
              {status.success && (
                <div className="flex items-start space-x-3 p-4 bg-green-500/20 border border-green-500/30 rounded-lg animate-fadeIn">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-green-300 text-sm">{status.success}</p>
                </div>
              )}

              {/* Error Message */}
              {status.error && (
                <div className="flex items-start space-x-3 p-4 bg-red-500/20 border border-red-500/30 rounded-lg animate-fadeIn">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{status.error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status.loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group"
              >
                {status.loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;