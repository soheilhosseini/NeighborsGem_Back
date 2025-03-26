import mongoose from "mongoose";
import AvatarSchema from "./avatar";

const UserSchema = new mongoose.Schema({
  first_name: { type: String },
  last_name: { type: String },
  email: { type: String, trim: true, sparse: true },
  phone_number: { type: String, trim: true, sparse: true },
  username: { type: String, trim: true, sparse: true },
  createAt: { type: Date, default: Date.now },
  password: { type: String, trim: true },
  avatar: { type: mongoose.Schema.Types.ObjectId, ref: "File" },
});

export default mongoose.model("User", UserSchema);
