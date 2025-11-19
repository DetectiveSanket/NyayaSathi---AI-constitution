import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({

        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },

        sender: {
            type: String,
            enum: ["user", "assistant", "system"],
            required: true,
        },

        text: {
            type: String,
            required: true,
            trim: true,
        },

        meta: {
            type: Object,
            default: {},
        },
    },

    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
