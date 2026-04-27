import React, { useState, useRef, useEffect } from "react";
import Navbar from "../shared/Navbar";
import Footer from "../shared/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyOtp, resendOtp } from "../features/auth/authThunks";
import { clearMessage, clearError } from "../store/authSlice";
import useAutoDismiss from "../hooks/useAutoDismiss";
import AuthLoadingOverlay from "../shared/AuthLoadingOverlay";

function OTPVerification() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Get email from Redux (we stored it after registration)
  const { pendingEmail: reduxEmail, loading, error, message } = useSelector((state) => state.auth);
  
  // ✅ Fallback to localStorage if Redux state is lost (e.g., page refresh)
  const [email, setEmail] = useState(reduxEmail || localStorage.getItem('registrationEmail'));

  // Auto-dismiss messages
  useAutoDismiss(message, clearMessage, 3000);
  useAutoDismiss(error, clearError, 4000);

  // ✅ Update email if Redux state changes
  useEffect(() => {
    if (reduxEmail) {
      setEmail(reduxEmail);
      localStorage.setItem('registrationEmail', reduxEmail);
    }
  }, [reduxEmail]);

  // ✅ Debug logging
  useEffect(() => {

    // console.log("OTPVerification - State:", { 
    //   reduxEmail, 
    //   localStorageEmail: localStorage.getItem('registrationEmail'),
    //   finalEmail: email,
    //   loading, 
    //   error, 
    //   message 
    // });

  }, [reduxEmail, email, loading, error, message]);

  // ✅ Redirect if no email (user didn't come from registration)
  useEffect(() => {
    if (!email) {
      console.warn("No email found in Redux state, redirecting to register");
      alert("⚠️ Please register first to verify your email!");
      navigate("/register");
    }
  }, [email, navigate]);

  // Local state for OTP and timer
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Countdown logic
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) inputRefs.current[index + 1]?.focus();

    // Auto-submit on full input
    if (newOtp.every((digit) => digit !== "") && index === 5) {
      setTimeout(() => handleSubmit(null, newOtp.join("")), 300);
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Paste OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const nextEmptyIndex = newOtp.findIndex((digit) => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  // ✅ Submit OTP
  const handleSubmit = async (e, otpValue = null) => {
    if (e) e.preventDefault();
    const finalOtp = otpValue || otp.join("");

    // console.log("Submitting OTP:", { email, otp: finalOtp });

    if (finalOtp.length !== 6) {
      alert("⚠️ Please enter all 6 digits");
      return;
    }

    if (!email) {
      // alert("⚠️ Email not found. Please register again.");
      navigate("/register");
      return;
    }

    const resultAction = await dispatch(
      verifyOtp({ email, otp: finalOtp })
    );

    // console.log("Verify OTP result:", resultAction);

    if (verifyOtp.fulfilled.match(resultAction)) {
      // Clear stored email on successful verification
      localStorage.removeItem('registrationEmail');
      // alert(resultAction.payload.message || "✅ Email verified successfully!");
      navigate("/login");
    } else {
      const errorMsg = resultAction.payload || "❌ OTP verification failed!";
      alert(errorMsg);
      
      // If user not found, redirect to register
      if (errorMsg.toLowerCase().includes("user not found") || errorMsg.toLowerCase().includes("not found")) {
        alert("⚠️ User not found. Please register again.");
        navigate("/register");
      }
    }
  };

  // ✅ Resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return;
    
    // console.log("Resending OTP for email:", email);
    
    if (!email) {
      alert("⚠️ Email not found. Please register again.");
      navigate("/register");
      return;
    }

    setTimeLeft(120);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();

    const result = await dispatch(resendOtp({ email }));
    
    // console.log("Resend OTP result:", result);
    
    if (resendOtp.fulfilled.match(result)) {
      alert(result.payload.message || "✅ OTP resent successfully!");
    } else {
      const errorMsg = result.payload || "❌ Failed to resend OTP!";
      alert(errorMsg);
      
      // If user not found, redirect to register
      if (errorMsg.toLowerCase().includes("user not found") || errorMsg.toLowerCase().includes("not found")) {
        alert("⚠️ User not found. Please register again.");
        navigate("/register");
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <AuthLoadingOverlay
        isLoading={loading}
        message="Verifying your OTP..."
        timeoutMs={90000}
        onTimeout={() => {}}
      />
      <div className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.18) 0%, rgba(6, 182, 212, 0.10) 22%, rgba(0, 0, 0, 0) 60%)",
          }}
        />
        <Navbar />

        <main className="relative mx-auto mt-16 max-w-6xl px-4 flex-1 w-full flex items-center justify-center">
          <section className="w-full max-w-xl">
            {!email ? (
              // Show message if no email found
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
                  Email Required
                </h1>
                <p className="text-sm sm:text-base text-white/70 mb-6">
                  Please register first to verify your email.
                </p>
                <Link
                  to="/register"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                >
                  Go to Registration
                </Link>
              </div>
            ) : (
              // Show OTP verification form
              <>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
              OTP Verification
            </h1>
            <p className="text-sm sm:text-base text-white/70 mb-4">
              We've sent a beautiful verification email with your 6-digit OTP code.
            </p>

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
                  💡 <strong>Pro Tip:</strong> Check your email and click the OTP
                  code to copy it instantly, then paste it here!
                </span>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="w-full space-y-6 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-[#011f24] shadow-2xl"
            >
              {/* Email info */}
              <p className="mb-2 text-center text-sm text-gray-400">
                We&apos;ve sent a 6-digit code to{" "}
                <span className="text-emerald-500 font-semibold">
                  {email || "your email"}
                </span>
              </p>

              {/* OTP Inputs */}
              <div className="flex justify-center space-x-2 sm:space-x-3 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-10 h-10 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-white/10 border-2 rounded-xl text-white focus:outline-none transition-all duration-300 ${
                      digit
                        ? "border-cyan-400 bg-cyan-400/20 shadow-lg shadow-cyan-400/25"
                        : "border-gray-600 hover:border-gray-500"
                    } focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:bg-cyan-400/10`}
                    autoComplete="off"
                  />
                ))}
              </div>

              {/* Resend Timer */}
              <div className="text-center space-y-3">
                {!canResend ? (
                  <p className="text-sm text-white/70">
                    Resend OTP in{" "}
                    <span className="font-mono text-cyan-400 font-semibold">
                      {formatTime(timeLeft)}
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-sm text-cyan-400 hover:text-cyan-300 underline transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending..." : "Resend OTP"}
                  </button>
                )}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                className="w-full p-4 mt-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02]"
                disabled={otp.some((digit) => !digit) || loading}
              >
                {loading ? "Verifying..." : "Confirm OTP"}
              </button>

              {error && (
                <p className="text-red-400 text-sm text-center mt-2">{error}</p>
              )}
              {message && (
                <p className="text-green-400 text-sm text-center mt-2">
                  {message}
                </p>
              )}

              <div className="flex justify-end mr-5">
                <Link
                  to="/login"
                  className="text-white hover:underline hover:text-blue-600 text-xs"
                >
                  back to login
                </Link>
              </div>

              <p className="my-2 text-xs text-center text-white">
                Do not have an account?{" "}
                <Link
                  to="/register"
                  className="text-base text-blue-900 hover:underline"
                >
                  Register
                </Link>
              </p>
            </form>
            </>
            )}
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default OTPVerification;
