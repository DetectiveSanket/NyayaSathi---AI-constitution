
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './DB/db.js';
import rateLimit from 'express-rate-limit';

import userRoutes from './routes/user-route.js';
import contactRoutes from './routes/contact-route.js';
import chatRoutes from "./routes/chat-route.js";
import docsRoutes from "./routes/docs-routes.js";

const app = express();

dotenv.config(); // Load environment variables
connectDB(); // Connect to the database

//* Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());

const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
const corsOptions = {
    origin: frontendURL,
    credentials: true,
};
app.use(cors(corsOptions)); // Enable CORS with options

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes   
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP',
});
app.use(limiter);

const PORT = process.env.PORT || 3000;

// Debug middleware
app.use((req, res, next) => {
    console.log('Request Body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    next();
});

//* Routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/docs", docsRoutes);



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});