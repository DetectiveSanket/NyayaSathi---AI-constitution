
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected to MongoDB");

    } catch (error) {
        console.error("❌ Fatal: Error connecting to MongoDB:", error.message);
        process.exit(1); // Exit so Render restarts the service and surfaces the error
    }
};

export default connectDB;