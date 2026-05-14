import User from "../models/user-module.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js"; // utility for nodemailer

// =========================
// Generate Access & Refresh Tokens
// =========================
const generateAccessToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "15m",
    });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });
};

// =========================
// Register User
// =========================
export const registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        let user = await User.findOne({ email }); // Check if user already exists

        if (user) {
            // If user exists and is already verified
            if (user.isVerified) {
                return res.status(400).json({ 
                    message: "Email already registered and verified. Please login instead.",
                    action: "login"
                });
            }
            
            // If user exists but NOT verified - allow re-registration with new OTP
            console.log("User exists but not verified. Sending new OTP...");
            
            // Update user details (in case they want to change name)
            user.name = name;
            user.password = password; // This will be hashed by pre-save middleware
            
            // Generate new OTP
            const otp = user.generateOTP();
            await user.save();

            // Send beautiful OTP email
            await sendEmail(email, "Verify your account - New OTP", null, otp, 'verification');

            return res.status(200).json({
                message: "Account exists but not verified. We've sent a new verification OTP to your email.",
                action: "verify",
                email: email
            });
        }

        // Create new user if doesn't exist
        user = new User({ name, email, password }); 

        // Generate OTP
        const otp = user.generateOTP();
        await user.save();

        // Send beautiful OTP email
        await sendEmail(email, "Verify your account", null, otp, 'verification');

        res.status(201).json({
            message: "User registered successfully! Please check your email for the verification OTP.",
            action: "verify",
            email: email
        });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// =========================
// Resend OTP for Email Verification
// =========================
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found. Please register first." });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ 
        message: "Email already verified. You can login now.",
        action: "login"
      });
    }
    
    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();
    
    // Send new OTP email
    await sendEmail(email, "New Verification OTP", null, otp, 'verification');
    
    res.status(200).json({
      message: "New verification OTP sent to your email successfully!",
      action: "verify",
      email: email
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// Verify Email
// =========================
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified" });

    const isValid = user.verifyOTP(otp);
    if (!isValid) return res.status(400).json({ message: "Invalid or expired OTP" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.status(200).json({ 
        message: "Email verified successfully. You can now log in." 
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// Login User
// =========================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ 
        message: "No account found with this email. Please register first.",
        action: "register"
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({ 
        message: "Please verify your email first. Check your inbox or request a new OTP.",
        action: "verify",
        email: email
      });
    }

    if (user.authProvider === "google" && (!user.password || user.password === "")) {
      return res.status(400).json({
        message: "This account uses Google sign-in. Please continue with Google or set a password in Settings.",
        action: "google",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: "Invalid password. Please check your password and try again.",
        action: "retry"
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// Logout User
// =========================
export const logoutUser = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.refreshToken = null;
    await user.save();

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// Refresh Token
// =========================
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: "No refresh token provided" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Refresh token expired or invalid" });
  }
};

// =========================
// Forgot Password (send OTP)
// =========================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = user.generateOTP();
    await user.save();

    await sendEmail(email, "Password Reset OTP", null, otp, 'reset');

    res.status(200).json({ message: "Password reset OTP sent to your email. Please check your inbox." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// Reset Password
// =========================
export const resetPassword = async (req, res) => {

  try {

    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) return res.status(404).json({ message: "User not found" });

    const isValid = user.verifyOTP(otp);
    if (!isValid) return res.status(400).json({ message: "Invalid or expired OTP" });

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// User Profile (self)
// =========================
export const getUserProfile = async (req, res) => {
  
  try {
    const user = await User.findById(req.user.userId).select("-password -refreshToken");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// Update Profile
// =========================
export const updateUserProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.status(200).json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// Admin: Get All Users
// =========================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -refreshToken");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// Admin: Delete User
// =========================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
