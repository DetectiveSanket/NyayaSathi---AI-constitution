import User from "../models/user-module.js";

/**
 * Lets Google-only users add a password (hybrid). Protected by JWT.
 * Plain password is assigned; User pre-save hook hashes it.
 */
export const setPassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.authProvider !== "google") {
      return res.status(400).json({
        message:
          user.authProvider === "manual"
            ? "Account already uses email/password"
            : "Password is already set for this account",
      });
    }

    const { password } = req.body;
    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    user.password = password;
    user.authProvider = "both";
    await user.save();

    return res.status(200).json({ success: true, message: "Password set successfully" });
  } catch (error) {
    console.error("setPassword error:", error);
    return res.status(500).json({ message: "Failed to set password" });
  }
};
