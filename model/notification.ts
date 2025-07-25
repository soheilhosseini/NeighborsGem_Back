import mongoose from "mongoose";
import bcrypt from "bcrypt";

const NotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["newMessage"],
      default: "sent",
    },
    content: { type: String },
    recieverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);
