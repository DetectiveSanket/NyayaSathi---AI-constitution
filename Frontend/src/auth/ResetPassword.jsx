import React, { useState } from 'react'
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import Password from '../assets/Icon/pass.png';

import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

function ResetPassword() {

    const [showPassword, setShowPassword] = useState(false);
    return (
        <>
            <div className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col">
            {/* Cyan Spotlight Background overlay shared by navbar and content */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.18) 0%, rgba(6, 182, 212, 0.10) 22%, rgba(0, 0, 0, 0) 60%)'
                }}
            />

            {/* Navbar sits on top of the same background */}
            <Navbar />

            {/* Page content fills available space */}
            <main className="relative mx-auto mt-16 max-w-6xl px-4 flex-1 w-full flex items-center justify-center">
                <section className="w-full max-w-xl">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">Reset your password</h1>
                    <p className="text-sm sm:text-base text-white/70 mb-6 sm:mb-8">Start exploring the platform in seconds.</p>
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-6 sm:mb-8">
                        <div className="flex items-center text-blue-300 text-sm">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                            </svg>
                            <span>💡 <strong>Pro Tip:</strong> Use a strong password with a mix of letters, numbers, and symbols. Never reuse old passwords for better security!</span>
                        </div>
                    </div>
                    <form className="w-full space-y-6 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-[#011f24] shadow-2xl">

                            
                            
                            <div className="flex items-center justify-center my-4">
                                <hr className="w-8 h-px bg-[#4A4C51]"/>
                                <p className="px-4 text-sm text-[#4A4C51]">Reset your password</p>
                                <hr className="w-8 h-px bg-[#4A4C51]"/>
                            </div>                        
                        
                        

                        
                        <div className="space-y-2">
                            <label className="text-white font-medium text-sm tracking-wide">New Password</label>
                            <div className="relative">
                                <img src={Password} className="absolute w-5 h-5 left-4 top-1/2 transform -translate-y-1/2 opacity-70" alt="password" />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your New Password" 
                                    className="w-full p-4 pl-12 pr-14 text-white bg-white/10 border-2 border-white/20 rounded-full placeholder:text-white/60 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all outline-none" 
                                />
                                <button 
                                    type="button"
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-all"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? 
                                        <EyeOff className="w-5 h-5 text-white/60 hover:text-white/80 transition-colors" /> : 
                                        <Eye className="w-5 h-5 text-white/60 hover:text-white/80 transition-colors" />
                                    }
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-white font-medium text-sm tracking-wide">Confirm Password</label>
                            <div className="relative">
                                <img src={Password} className="absolute w-5 h-5 left-4 top-1/2 transform -translate-y-1/2 opacity-70" alt="password" />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your Confirm Password" 
                                    className="w-full p-4 pl-12 pr-14 text-white bg-white/10 border-2 border-white/20 rounded-full placeholder:text-white/60 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all outline-none" 
                                />
                                <button 
                                    type="button"
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-all"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? 
                                        <EyeOff className="w-5 h-5 text-white/60 hover:text-white/80 transition-colors" /> : 
                                        <Eye className="w-5 h-5 text-white/60 hover:text-white/80 transition-colors" />
                                    }
                                </button>
                            </div>
                        </div>

                       <div className="flex justify-end mr-5">
                            <Link to="/otpverification" className='text-white hover:underline hover:text-blue-600 text-xs'>back to login</Link>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="w-full p-4 mt-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02]"
                        >
                            Reset Password
                        </button>

                        <p className="my-2 text-xs text-center text-white">Do not have an account?  <Link to='/register' className="text-base text-blue-900 hover:underline">Register</Link> </p>
                        
                    </form>
                </section>
            </main>

            <Footer />
        </div>
        </>
        
    )
}

export default ResetPassword;