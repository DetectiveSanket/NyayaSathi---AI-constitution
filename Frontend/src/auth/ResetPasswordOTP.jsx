import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, resendOtp } from '../features/auth/authThunks';
import { clearMessage, clearError } from '../store/authSlice';
import useAutoDismiss from '../hooks/useAutoDismiss';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import AuthLoadingOverlay from '../shared/AuthLoadingOverlay';

import OTP from '../assets/Icon/otp.png';
import Password from '../assets/Icon/pass.png';

function ResetPasswordOTP() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { loading, error, message } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [localError, setLocalError] = useState('');
    const [email, setEmail] = useState('');
    const [countdown, setCountdown] = useState(0);

    // Auto-dismiss success and error messages
    useAutoDismiss(message, clearMessage, 3000);
    useAutoDismiss(error, clearError, 4000);

    // Auto-dismiss local errors after 4 seconds
    useEffect(() => {
        if (localError) {
            const timer = setTimeout(() => {
                setLocalError('');
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [localError]);

    useEffect(() => {
        // Get email from location state or localStorage
        const emailFromState = location.state?.email;
        const emailFromStorage = localStorage.getItem('pendingResetEmail');
        
        if (emailFromState) {
            setEmail(emailFromState);
        } else if (emailFromStorage) {
            setEmail(emailFromStorage);
        } else {
            // No email found, redirect back to forgot password
            navigate('/forgot-password');
        }
    }, [location.state, navigate]);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setLocalError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        // Validation
        if (!formData.otp) {
            setLocalError('OTP is required');
            return;
        }
        if (!formData.newPassword) {
            setLocalError('New password is required');
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }
        if (formData.newPassword.length < 6) {
            setLocalError('Password must be at least 6 characters long');
            return;
        }

        try {
            const result = await dispatch(resetPassword({
                email,
                otp: formData.otp,
                newPassword: formData.newPassword
            })).unwrap();
            
            // console.log('Reset password result:', result);
            
            // Clear stored email
            localStorage.removeItem('pendingResetEmail');
            
            // Navigate to login with success message
            navigate('/login', { 
                state: { 
                    message: 'Password reset successfully! Please login with your new password.' 
                } 
            });
        } catch (error) {
            console.error('Failed to reset password:', error);
            setLocalError(error || 'Failed to reset password');
        }
    };

    const handleResendOTP = async () => {
        if (countdown > 0) return;
        
        try {
            await dispatch(resendOtp({ email })).unwrap();
            setCountdown(60); // Start 60 second countdown
        } catch (error) {
            console.error('Failed to resend OTP:', error);
            setLocalError('Failed to resend OTP');
        }
    };

    return (
        <>
            <AuthLoadingOverlay
                isLoading={loading}
                message="Resetting your password..."
                timeoutMs={25000}
                onTimeout={() => {}}
            />
            <div className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col">
                {/* Cyan Spotlight Background overlay */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background: 'radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.18) 0%, rgba(6, 182, 212, 0.10) 22%, rgba(0, 0, 0, 0) 60%)'
                    }}
                />

                <Navbar />

                {/* Page content */}
                <main className="relative mx-auto mt-16 max-w-6xl px-4 flex-1 w-full flex items-center justify-center">
                    <section className="w-full max-w-xl">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
                            Reset Password
                        </h1>
                        <p className="text-sm sm:text-base text-white/70 mb-6 sm:mb-8">
                            Enter the OTP sent to your email and your new password.
                        </p>

                        <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-6 sm:mb-8">
                            <div className="flex items-center text-blue-300 text-sm">
                                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                                </svg>
                                <span>💡 <strong>Tip:</strong> OTP sent to {email}. Check your spam folder if you don't see it.</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="w-full space-y-6 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-[#011f24] shadow-2xl">
                            
                            <div className="flex items-center justify-center my-4">
                                <hr className="w-8 h-px bg-[#4A4C51]"/>
                                <p className="px-4 text-sm text-[#4A4C51]">Enter OTP and New Password</p>
                                <hr className="w-8 h-px bg-[#4A4C51]"/>
                            </div>

                            {/* Display errors */}
                            {(error || localError) && (
                                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-4">
                                    <div className="flex items-center text-red-300 text-sm">
                                        <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                        </svg>
                                        <span>{localError || error}</span>
                                    </div>
                                </div>
                            )}

                            {/* Display success message */}
                            {message && (
                                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-4">
                                    <div className="flex items-center text-green-300 text-sm">
                                        <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                        </svg>
                                        <span>{message}</span>
                                    </div>
                                </div>
                            )}

                            {/* OTP Input */}
                            <div className="space-y-2">
                                <label className="text-white font-medium text-sm tracking-wide">Enter OTP</label>
                                <div className="relative">
                                    <img src={OTP} className="absolute w-5 h-5 left-4 top-1/2 transform -translate-y-1/2 opacity-70" alt="otp" />
                                    <input 
                                        type="text" 
                                        name="otp"
                                        value={formData.otp}
                                        onChange={handleInputChange}
                                        placeholder="Enter 6-digit OTP" 
                                        maxLength="6"
                                        className="w-full p-4 pl-12 text-white bg-white/10 border-2 border-white/20 rounded-full placeholder:text-white/60 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all outline-none" 
                                        required
                                    />
                                </div>
                            </div>

                            {/* New Password Input */}
                            <div className="space-y-2">
                                <label className="text-white font-medium text-sm tracking-wide">New Password</label>
                                <div className="relative">
                                    <img src={Password} className="absolute w-5 h-5 left-4 top-1/2 transform -translate-y-1/2 opacity-70" alt="password" />
                                    <input 
                                        type="password" 
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        placeholder="Enter new password" 
                                        className="w-full p-4 pl-12 text-white bg-white/10 border-2 border-white/20 rounded-full placeholder:text-white/60 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all outline-none" 
                                        required
                                    />
                                </div>
                            </div>

                            {/* Confirm Password Input */}
                            <div className="space-y-2">
                                <label className="text-white font-medium text-sm tracking-wide">Confirm Password</label>
                                <div className="relative">
                                    <img src={Password} className="absolute w-5 h-5 left-4 top-1/2 transform -translate-y-1/2 opacity-70" alt="password" />
                                    <input 
                                        type="password" 
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Confirm new password" 
                                        className="w-full p-4 pl-12 text-white bg-white/10 border-2 border-white/20 rounded-full placeholder:text-white/60 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all outline-none" 
                                        required
                                    />
                                </div>
                            </div>

                            {/* Resend OTP */}
                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={countdown > 0 || loading}
                                    className="text-sm text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                                >
                                    {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                                </button>
                            </div>

                            <div className="flex justify-end mr-5">
                                <Link to="/forgot-password" className='text-white hover:underline hover:text-blue-600 text-xs'>
                                    back to forgot password
                                </Link>
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full p-4 mt-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? 'Resetting Password...' : 'Reset Password'}
                            </button>

                            <p className="my-2 text-xs text-center text-white">
                                Remember your password? 
                                <Link to='/login' className="text-base text-blue-900 hover:underline ml-1">Login</Link> 
                            </p>
                            
                        </form>
                    </section>
                </main>

                <Footer />               
            </div>
        </>
    );
}

export default ResetPasswordOTP;