import mongoose from "mongoose";

const TempUserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  phone_number: { type: String, unique: true },
  address: { type: String },
  username: { type: String, unique: true },
  createAt: { type: Date, default: Date.now, expires: 300 },
});

export default mongoose.model("TempUser", TempUserSchema);
