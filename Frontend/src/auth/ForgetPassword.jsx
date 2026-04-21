import React from 'react'
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';

import Email from '../assets/Icon/email (1).png';

import {forgotPassword} from '../features/auth/authThunks';
import { clearMessage, clearError } from '../store/authSlice';
import useAutoDismiss from '../hooks/useAutoDismiss';
import AutoDismissNotification from '../ProtectionRoutes/AutoDismissNotification';
import AuthLoadingOverlay from '../shared/AuthLoadingOverlay';

import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';


function ForgetPassword() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, message } = useSelector((state) => state.auth);

    const [email , setEmail] = React.useState('');
    const [localError, setLocalError] = React.useState('');

    // Auto-dismiss success and error messages after 3 seconds
    const messageState = useAutoDismiss(message, clearMessage, 3000, true);
    const errorState = useAutoDismiss(error, clearError, 4000, true);

    // Auto-dismiss local errors after 4 seconds
    React.useEffect(() => {
        if (localError) {
            const timer = setTimeout(() => {
                setLocalError('');
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [localError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        
        // Basic validation
        if (!email) {
            setLocalError('Email is required');
            return;
        }
        
        try {
             await dispatch(forgotPassword({ email })).unwrap();
            // console.log('Forgot password result:', result);
            // Store email for next step
            localStorage.setItem('pendingResetEmail', email);
            // On success, navigate to OTP verification page
            navigate('/reset-password-otp', { state: { email, fromForgotPassword: true } });
        } catch (error) {
            console.error('Failed to send reset OTP:', error);
            setLocalError(error || 'Failed to send reset email');
        }
    }

    return (
        <>
            <AuthLoadingOverlay
                isLoading={loading}
                message="Sending reset OTP to your email..."
                timeoutMs={25000}
                onTimeout={() => {}}
            />
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
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight"> Forget Password</h1>
                    <p className="text-sm sm:text-base text-white/70 mb-6 sm:mb-8">Enter your registered email to reset your password.</p>
                        <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-6 sm:mb-8">
                            <div className="flex items-center text-blue-300 text-sm">
                                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                                </svg>
                                <span>💡 <strong>Pro Tip:</strong> Check your spam folder if you don't receive the password reset email. Make sure to create a strong password that includes numbers, symbols, and mixed case letters.</span>
                            </div>
                        </div>
                    <form onSubmit={handleSubmit} className="w-full space-y-6 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-[#011f24] shadow-2xl">

                           
                            
                        <div className="flex items-center justify-center my-4">
                            <hr className="w-8 h-px bg-[#4A4C51]"/>
                            <p className="px-4 text-sm text-[#4A4C51]">Reset your password</p>
                            <hr className="w-8 h-px bg-[#4A4C51]"/>
                        </div>                        
                        
                        {/* Auto-dismissing notifications */}
                        <AutoDismissNotification
                            message={error || localError}
                            type="error"
                            isVisible={errorState.isVisible}
                            progress={errorState.progress}
                            showProgress={true}
                            onDismiss={() => {
                                if (error) dispatch(clearError());
                                if (localError) setLocalError('');
                            }}
                        />

                        <AutoDismissNotification
                            message={message}
                            type="success"
                            isVisible={messageState.isVisible}
                            progress={messageState.progress}
                            showProgress={true}
                            onDismiss={() => dispatch(clearMessage())}
                        />
                        
                        <div className="space-y-2">
                            <label className="text-white font-medium text-sm tracking-wide">Email</label>
                            <div className="relative">
                                <img src={Email} className="absolute w-5 h-5 left-4 top-1/2 transform -translate-y-1/2 opacity-70" alt="email" />
                                <input 
                                    type="email" 
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email" 
                                    className="w-full p-4 pl-12 text-white bg-white/10 border-2 border-white/20 rounded-full placeholder:text-white/60 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all outline-none" 
                                    required
                                />
                            </div>
                        </div>


                        <div className="flex justify-end mr-5">
                           <Link to="/login" className='text-white hover:underline hover:text-blue-600 text-xs'>back to login</Link>
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full p-4 mt-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? 'Sending...' : 'Send Reset OTP'}
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

export default ForgetPassword;