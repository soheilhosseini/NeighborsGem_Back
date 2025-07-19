import mongoose from "mongoose";

const MessageDeliverySchema = new mongoose.Schema({
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    required: true,
    index: true,
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

MessageDeliverySchema.index({ userId: 1, status: 1 });

export default mongoose.model("MessageDelivery", MessageDeliverySchema);
