// src/middleware/ragAuth.js - Middleware that accepts both regular auth and public RAG tokens
import jwt from 'jsonwebtoken';
import User from '../models/user-module.js';

/**
 * Middleware that accepts either:
 * 1. Regular JWT token (from logged-in user)
 * 2. Public RAG session token (for anonymous chatbot access)
 */
export const ragAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      // For RAG endpoints, allow anonymous access with a default user ID
      req.user = {
        _id: null,
        userId: "anonymous",
        isPublic: true,
      };
      return next();
    }

    try {
      // Try to verify as regular JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if it's a public RAG session token
      if (decoded.type === "rag_public") {
        // Public RAG session token
        req.user = {
          _id: decoded.sessionId || null,
          userId: decoded.sessionId || "anonymous",
          isPublic: true,
        };
        return next();
      }

      // Regular user token - get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        // Fallback to anonymous if user not found
        req.user = {
          _id: null,
          userId: "anonymous",
          isPublic: true,
        };
        return next();
      }

      req.user = user;
      req.user.userId = req.user._id;
      req.user.isPublic = false;
      
      next();
    } catch (error) {
      // Token verification failed - allow anonymous access for RAG
      req.user = {
        _id: null,
        userId: "anonymous",
        isPublic: true,
      };
      next();
    }
  } catch (error) {
    // On any error, allow anonymous access
    req.user = {
      _id: null,
      userId: "anonymous",
      isPublic: true,
    };
    next();
  }
};

