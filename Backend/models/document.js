// src/models/Document.js
import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: false 
    }, // optional: owner

    filename: { 
        type: String, 
        required: true 
    },

    s3Key: { 
        type: String, 
        required: true 
    },

    contentType: { 
        type: String 
    },

    size: { 
        type: Number 
    },

    language: { 
        type: String, 
        default: "en" 
    },

    processed: { 
        type: Boolean, 
        default: false 
    }, // will be set true when chunk+embed done

    meta: { 
        type: mongoose.Schema.Types.Mixed 
    }, // any other metadata

    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    
});

const Document = mongoose.model("Document", DocumentSchema);
export default Document;
