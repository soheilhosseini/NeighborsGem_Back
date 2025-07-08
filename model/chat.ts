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

ChatSchema.index(
  { participants: 1 },
  { unique: true, partialFilterExpression: { isGroup: false } }
);

export default mongoose.model("Chat", ChatSchema);
