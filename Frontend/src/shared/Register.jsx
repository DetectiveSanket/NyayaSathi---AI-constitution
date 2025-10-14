import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import User from "../assets/Icon/username.png";
import Password from "../assets/Icon/pass.png";
import Email from "../assets/Icon/email (1).png";
import google from "../assets/Icon/google.png";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../features/auth/authThunks";

function Register() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Local state for form inputs
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    // Local state for password visibility(eye icon)
    const [showPassword, setShowPassword] = useState(false);

    // Redux state
    const { loading, error, message } = useSelector((state) => state.auth);

    // Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.email || !formData.password) {
            alert("All fields are required!");
            return;
        }

        // Name validation
        if (formData.name.length < 3) {
            alert("Name must be at least 3 characters long!");
            return;
        }

        if (formData.name.length > 30) {
            alert("Name must be less than 30 characters!");
            return;
        }

        // Password validation
        if (formData.password.length < 8) {
            alert("Password must be at least 8 characters long!");
            return;
        }

        // Dispatch register thunk
        const resultAction = await dispatch(registerUser(formData));

        if (registerUser.fulfilled.match(resultAction)) {
            // Success: store email in localStorage as backup and navigate to verify-email page
            localStorage.setItem('registrationEmail', formData.email);
            alert(resultAction.payload.message || "Verification email sent!");
            navigate("/otpverification");
        } 

        else {
            // Error
            alert(resultAction.payload || "Registration failed!");
        }
    };

  return (
        <>   
            <div className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col">
                <div
                    className="pointer-events-none absolute inset-0"
                        style={{
                        background:
                            "radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.18) 0%, rgba(6, 182, 212, 0.10) 22%, rgba(0, 0, 0, 0) 60%)",
                    }}
                />

            <Navbar />

                <main className="relative mx-auto max-w-6xl px-4 flex-1 w-full flex items-center justify-center mt-16">
                    <section className="w-full max-w-xl">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
                            Register to your account
                        </h1>
                        <p className="text-sm sm:text-base text-white/70 mb-6 sm:mb-8">
                            Start exploring the platform in seconds.
                        </p>

                        {/* Info Box */}
                        <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-6 sm:mb-8">
                            <div className="flex items-center text-blue-300 text-sm">
                            <svg
                                className="w-5 h-5 mr-2 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 0 100-2v-3a1 1 0 00-1-1H9z" />
                            </svg>
                            <span>
                                💡 <strong>Pro Tip:</strong> Use a strong password with at least 8
                                characters, including uppercase, lowercase, numbers, and symbols.
                                Make sure your email is valid and accessible for verification and
                                password recovery.
                            </span>
                            </div>
                        </div>

                        {/* FORM */}
                        <form className="w-full space-y-6 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-[#011f24] shadow-2xl" onSubmit={handleSubmit} >

                            <button
                                style={{ width: "80%", margin: "10px auto" }}
                                className="flex items-center justify-center w-full px-4 py-2 text-white bg-transparent border-2 border-gray-700 focus:border-teal-500  rounded-full hover:bg-[#1b4f4b81]"
                                type="button"
                            >
                                <img src={google} className="w-6 h-6 mr-5" alt="google" />
                                Continue with Google
                            </button>

                            <div className="flex items-center justify-center my-4">
                                <hr className="w-8 h-px bg-[#4A4C51]" />
                                <p className="px-4 text-sm text-[#4A4C51]">
                                    Register/Login with Email
                                </p>
                                <hr className="w-8 h-px bg-[#4A4C51]" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-white font-medium text-sm tracking-wide">
                                    User Name
                                </label>

                                <div className="relative">
                                    <img
                                        src={User}
                                        className="absolute w-5 h-5 left-4 top-1/2 transform -translate-y-1/2 opacity-70"
                                        alt="user"
                                    />

                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter your username"
                                        onChange={handleChange}
                                        value={formData.name}
                                        className="w-full p-4 pl-12 text-white bg-white/10 border-2 border-white/20 rounded-full placeholder:text-white/60 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-white font-medium text-sm tracking-wide">
                                    Email
                                </label>
                                <div className="relative">
                                    <img
                                        src={Email}
                                        className="absolute w-5 h-5 left-4 top-1/2 transform -translate-y-1/2 opacity-70"
                                        alt="email"
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        onChange={handleChange}
                                        value={formData.email}
                                        className="w-full p-4 pl-12 text-white bg-white/10 border-2 border-white/20 rounded-full placeholder:text-white/60 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-white font-medium text-sm tracking-wide">
                                    Password
                                </label>
                                <div className="relative">
                                    <img
                                        src={Password}
                                        className="absolute w-5 h-5 left-4 top-1/2 transform -translate-y-1/2 opacity-70"
                                        alt="password"
                                    />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Enter your Password"
                                        onChange={handleChange}
                                        value={formData.password}
                                        className="w-full p-4 pl-12 pr-14 text-white bg-white/10 border-2 border-white/20 rounded-full placeholder:text-white/60 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all outline-none"
                                    />
                                        <button
                                        type="button"
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-all"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                    {showPassword ? (
                                            <EyeOff className="w-5 h-5 text-white/60 hover:text-white/80 transition-colors" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-white/60 hover:text-white/80 transition-colors" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full p-4 mt-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02]"
                                disabled={loading}
                            >
                                {loading ? "Registering..." : "Register"}
                            </button>

                            {error && (
                                    <p className="text-red-400 text-sm text-center mt-2">{error}</p>
                                )}
                                {message && (
                                <p className="text-green-400 text-sm text-center mt-2">
                                    {message}
                                </p>
                            )}

                            <p className="my-2 text-xs text-center text-white">
                                    I already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="text-base text-blue-900 hover:underline"
                                >
                                    Login
                                </Link>
                            </p>
                        </form>
                    </section>
                </main>

                <Footer />
            </div>
        </>     
    );
}

export default Register;
