import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  phone_number: { type: String, unique: true },
  address: { type: String },
  username: { type: String, unique: true },
  createAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);
