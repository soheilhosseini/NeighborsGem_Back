import mongoose from "mongoose";
import refreshTokenSchema from "./refreshToken";

const UserSchema = new mongoose.Schema({
  first_name: { type: String },
  last_name: { type: String },
  email: { type: String, trim: true, sparse: true },
  phone_number: { type: String, trim: true, sparse: true },
  username: { type: String, trim: true, sparse: true },
  address: { type: String },
  createAt: { type: Date, default: Date.now },
  password: { type: String, trim: true },
  refresh_tokens: [refreshTokenSchema],
});

export default mongoose.model("Users", UserSchema);
