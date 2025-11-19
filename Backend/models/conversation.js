import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
        user: {

            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            default: "New Conversation",
            trim: true,
        },
    },
    { timestamps: true }
);

// const Conversation = mongoose.model("Conversation", conversationSchema);
// export default Conversation;

export default mongoose.model("Conversation", conversationSchema);