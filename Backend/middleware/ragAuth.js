// src/middleware/ragAuth.js - Middleware that accepts both regular auth and public RAG tokens
import jwt from 'jsonwebtoken';
import User from '../models/user-module.js';

/**
 * Middleware that accepts either:
 * 1. Regular JWT token (from logged-in user) → sets req.user to the real user
 * 2. Public RAG session token (type: "rag_public") → sets req.user as public/anonymous
 * 3. No token → anonymous access only
 *
 * ⚠️  A token that is present but INVALID (expired, tampered) returns 401
 *     so conversations are never silently assigned to the wrong user.
 */
export const ragAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // ─── No token at all: allow fully anonymous access ───────────────────────
    if (!token) {
      req.user = {
        _id: null,
        userId: 'anonymous',
        isPublic: true,
      };
      return next();
    }

    // ─── Token present: verify it ────────────────────────────────────────────
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Token is present but invalid / expired → reject instead of falling
      // back to anonymous (that was the original bug – conversations ended
      // up owned by "anonymous" when the token expired).
      return res.status(401).json({
        message: 'Token is invalid or expired. Please log in again.',
      });
    }

    // ─── Public RAG session token ─────────────────────────────────────────────
    if (decoded.type === 'rag_public') {
      req.user = {
        _id: decoded.sessionId || null,
        userId: decoded.sessionId || 'anonymous',
        isPublic: true,
      };
      return next();
    }

    // ─── Regular user JWT ────────────────────────────────────────────────────
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      // Token was valid but user was deleted from DB
      return res.status(401).json({ message: 'User not found. Please log in again.' });
    }

    // ✅ Authenticated user: attach real MongoDB ObjectId as string
    req.user = user;
    req.user.userId = user._id.toString(); // always a real MongoDB _id string
    req.user.isPublic = false;

    return next();
  } catch (error) {
    console.error('❌ ragAuth middleware error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};

