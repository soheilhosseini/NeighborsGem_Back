import mongoose from "mongoose";

const TempUserSchema = new mongoose.Schema({
  email: { type: String, trim: true, sparse: true },
  phone_number: { type: String, trim: true, sparse: true },
  username: { type: String, trim: true, sparse: true },
  address: { type: String },
  created_at: { type: Date, default: Date.now, expires: 30000 },
  otp: { type: String, default: "123" },
  successfulOpt: { type: Boolean, default: false },
});

export default mongoose.model("TempUsers", TempUserSchema);
