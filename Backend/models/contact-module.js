import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: 3,
        maxlength: 50,
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },

    message: {
        type: String,
        required: [true, "Message is required"],
        trim: true,
        minlength: 10,
        maxlength: 2000,
    },

    ip: {
        type: String,
        required: true,
    },

    status: {
        type: String,
        enum: ['pending', 'reviewed', 'spam'],
        default: 'pending',
    },

    moderationFlags: {
        type: [String],
        default: [],
    },

}, { 
    timestamps: true 
});

// Index for faster queries
contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ status: 1 });

export default mongoose.model("Contact", contactSchema);
