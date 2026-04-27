import React, { useState, useEffect } from 'react'
import Navbar from './Navbar';
import Footer from './Footer';
import Password from '../assets/Icon/pass.png';
import Email from '../assets/Icon/email (1).png';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import google from '../assets/Icon/google.png';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../features/auth/authThunks';
import { clearMessage, clearError } from '../store/authSlice';
import useAutoDismiss from '../hooks/useAutoDismiss';
import AutoDismissNotification from '../ProtectionRoutes/AutoDismissNotification';
import { toast } from 'sonner';
import AuthLoadingOverlay from '../shared/AuthLoadingOverlay';

const LogIn = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Local state for form inputs
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    // Local state for password visibility
    const [showPassword, setShowPassword] = useState(false);
    
    // Local state for success message from navigation
    const [successMessage, setSuccessMessage] = useState('');

    // Redux state
    const { loading, error, message } = useSelector((state) => state.auth);

    // Auto-dismiss messages
    const messageState = useAutoDismiss(message, clearMessage, 3000, true);
    const errorState = useAutoDismiss(error, clearError, 4000, true);

    // Auto-dismiss success message from navigation after 4 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Handle success message from location state (e.g., from password reset)
    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            // Clear the message from location state
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear success message when user starts typing
        if (successMessage) {
            setSuccessMessage('');
        }
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // console.log("Login attempt with:", { email: formData.email });

        // Basic validation
        if (!formData.email || !formData.password) {
            alert("⚠️ All fields are required!");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert("⚠️ Please enter a valid email address!");
            return;
        }

        // Dispatch login thunk
        const resultAction = await dispatch(loginUser(formData));

        // console.log("Login result:", resultAction);

        if (loginUser.fulfilled.match(resultAction)) {
            // Success: navigate to chatbot
            // console.log("Login successful, navigating to /chatbot");
            // alert(resultAction.payload.message || "✅ Login successful!");
            toast.success(resultAction.payload.message || "✅ Login successful!");
            navigate("/chatbot");
        } else {
            // Error handling
            const errorMsg = resultAction.payload || "❌ Login failed!";
            // console.log("Login failed:", errorMsg);
            alert(errorMsg);
            
            // Specific error handling
            if (errorMsg.toLowerCase().includes("verify your email")) {
                // If user needs to verify email, store email and redirect to OTP
                localStorage.setItem('registrationEmail', formData.email);
                alert("⚠️ Please verify your email first!");
                navigate("/otpverification");
            } else if (errorMsg.toLowerCase().includes("register first")) {
                alert("⚠️ No account found. Please register first!");
                navigate("/register");
            }
        }
    };

    const handleLoginTimeout = () => {
        toast.error('Request timed out. The server may be starting up — please try again in a moment.');
    };

     

    return (
        <>
            <AuthLoadingOverlay
                isLoading={loading}
                message="Logging you in securely..."
                timeoutMs={90000}
                onTimeout={handleLoginTimeout}
            />
            <div className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col margin-top: 4rem;">
            {/* Cyan Spotlight Background overlay shared by navbar and content */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.18) 0%, rgba(6, 182, 212, 0.10) 22%, rgba(0, 0, 0, 0) 60%)'
                }}
            />

            {/* Navbar sits on top of the same background */}
            <Navbar />

            /* Page content fills available space */
            <main className="relative mx-auto mt-16 max-w-6xl px-4 flex-1 w-full flex items-center justify-center">
                <section className="w-full max-w-xl">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">Login to your account</h1>
                    <p className="text-sm sm:text-base text-white/70 mb-6 sm:mb-8">Start exploring the platform in seconds.</p>
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-6 sm:mb-8">
                        <div className="flex items-center text-blue-300 text-sm">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                            </svg>
                            <span>💡 <strong>Pro Tip:</strong> Use a password manager to securely store and autofill your login credentials for faster and safer access.</span>
                        </div>
                    </div>
                    <form className="w-full space-y-6 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-[#011f24] shadow-2xl" onSubmit={handleSubmit}>

                        <button style={{width: '80%', margin: '10px auto' }} className="flex items-center justify-center gap-2 w-full px-4 py-2 text-white bg-transparent border-2 border-gray-700 focus:border-teal-500 rounded-full hover:bg-[#1b4f4b81] whitespace-nowrap">
                            <img src={google} className="w-6 h-6 flex-shrink-0" alt="google" />
                            <span>Continue with Google</span>
                        </button>
                        
                        {/* <button style={{width: '80%', margin: '0 auto'}} className="flex items-center justify-center w-full px-4 py-2 mt-3 text-white bg-transparent border-2 border-gray-700 focus:border-pink-600 rounded-full hover:bg-[#3A3C3F]">
                            <img src={instagram} className="w-6 h-6 mr-5" alt="google" />
                            Continue with GitHub
                        </button> */}
                            
                            <div className="flex items-center justify-center my-4">
                                <hr className="w-8 h-px bg-[#4A4C51]"/>
                                <p className="px-4 text-sm text-[#4A4C51]">Register/Login with Email</p>
                                <hr className="w-8 h-px bg-[#4A4C51]"/>
                            </div>                        
                        
                        <div className="space-y-2">
                            <label className="text-white font-medium text-sm tracking-wide">Email</label>
                            <div className="relative">
                                <img src={Email} className="absolute w-5 h-5 left-4 top-1/2 transform -translate-y-1/2 opacity-70" alt="email" />
                                <input 
                                    type="email" 
                                    name="email"
                                    placeholder="Enter your email" 
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-4 pl-12 text-white bg-white/10 border-2 border-white/20 rounded-full placeholder:text-white/60 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all outline-none" 
                                />
                            </div>
                        </div>

                        
                        <div className="space-y-2">
                            <label className="text-white font-medium text-sm tracking-wide">Password</label>
                            <div className="relative">
                                <img src={Password} className="absolute w-5 h-5 left-4 top-1/2 transform -translate-y-1/2 opacity-70" alt="password" />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your Password" 
                                    value={formData.password}
                                    onChange={handleChange}
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
                           <Link to="/forgot-password" className='text-white hover:underline hover:text-blue-600 text-xs'>Forget Password?</Link>
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full p-4 mt-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? "Logging in..." : "LogIn"}
                        </button>

                        {/* Auto-dismissing notifications */}
                        <AutoDismissNotification
                            message={error}
                            type="error"
                            isVisible={errorState.isVisible}
                            progress={errorState.progress}
                            showProgress={true}
                            onDismiss={() => dispatch(clearError())}
                        />

                        <AutoDismissNotification
                            message={message}
                            type="success"
                            isVisible={messageState.isVisible}
                            progress={messageState.progress}
                            showProgress={true}
                            onDismiss={() => dispatch(clearMessage())}
                        />

                        <AutoDismissNotification
                            message={successMessage}
                            type="success"
                            isVisible={true}
                            progress={0}
                            showProgress={false}
                            onDismiss={() => setSuccessMessage('')}
                        />

                        <p className="my-2 text-xs text-center text-white">Do not have an account?  <Link to='/register' className="text-base text-blue-900 hover:underline">Register</Link> </p>
                        
                    </form>
                </section>
            </main>

            <Footer />
        </div>
        </>
    );
};
export default LogIn;
