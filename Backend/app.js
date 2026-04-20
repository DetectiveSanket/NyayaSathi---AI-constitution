
import 'dotenv/config'; // Crucial: must be first import so env vars are loaded before other modules
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './DB/db.js';
import rateLimit from 'express-rate-limit';
import { getRedisClient } from './services/redisClient.js';

import userRoutes from './routes/user-route.js';
import contactRoutes from './routes/contact-route.js';
import chatRoutes from "./routes/chat-route.js";
import docsRoutes from "./routes/docs-routes.js";
import ragRoutes from "./routes/rag-routes.js";

const app = express();

connectDB(); // Connect to the database

// Initialize Redis connection (non-blocking, will connect on first use)
getRedisClient();

//* Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());

// Support multiple allowed origins (comma-separated in FRONTEND_URL env var)
// e.g. FRONTEND_URL=https://nyayasathi.netlify.app,http://localhost:5173
const rawOrigins = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = rawOrigins.split(',').map((o) => o.trim()).filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, mobile apps, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        console.warn(`⚠️  CORS blocked origin: ${origin}`);
        return callback(new Error(`CORS policy: origin '${origin}' not allowed`));
    },
    credentials: true,
    optionsSuccessStatus: 200, // For legacy browser compatibility
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // configurable
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

const PORT = process.env.PORT || 5000;

// Health check endpoint (for Render / uptime monitors)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug request logging (development only)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`[${req.method}] ${req.path}`);
        next();
    });
}

//* Routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/docs", docsRoutes);
app.use("/api/v1/rag", ragRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error("❌ Global error handler:", err);
    console.error("❌ Error stack:", err.stack);
    res.status(err.status || 500).json({
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`✅ Default GEMINI_MODEL loaded as: ${process.env.GEMINI_MODEL || "NOT SET"}`);
    console.log(`✅ Default RAG_MODEL loaded as: ${process.env.RAG_MODEL || "NOT SET"}`);
});