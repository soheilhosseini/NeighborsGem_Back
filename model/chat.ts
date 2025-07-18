import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    name: { type: String },
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    isGroup: Boolean,
  },
  { timestamps: true }
);

export default mongoose.model("Chat", ChatSchema);
