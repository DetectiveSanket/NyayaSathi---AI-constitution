import admin, { firebaseAdminReady } from "../config/firebaseAdmin.js";
import User from "../models/user-module.js";
import jwt from "jsonwebtoken";

function generateAccessToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

export const googleAuth = async (req, res) => {
  try {
    if (!firebaseAdminReady) {
      return res.status(503).json({ message: "Google sign-in is not configured on this server." });
    }

    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "ID token required" });
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (err) {
      if (err.code === "auth/id-token-expired") {
        return res.status(401).json({ message: "Google token expired. Please sign in again." });
      }
      throw err;
    }

    const email = decodedToken.email;
    const name = decodedToken.name || email?.split("@")[0] || "User";
    const picture = decodedToken.picture || null;
    const uid = decodedToken.uid;

    if (!email) {
      return res.status(400).json({ message: "Google account has no email" });
    }

    let user = await User.findOne({ email });

    if (user) {
      const treatAsManual = !user.authProvider || user.authProvider === "manual";
      if (treatAsManual) {
        user.googleId = uid;
        user.authProvider = "both";
        if (!user.avatar) user.avatar = picture;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId: uid,
        authProvider: "google",
        avatar: picture,
        isVerified: true,
        password: undefined,
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    const userOut = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      authProvider: user.authProvider,
    };

    return res.status(200).json({
      success: true,
      token: accessToken,
      accessToken,
      refreshToken,
      user: userOut,
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(500).json({ message: error.message || "Authentication failed" });
  }
};
