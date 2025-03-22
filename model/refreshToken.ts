import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  token: String,
  expiresAt: Date,
});

export default refreshTokenSchema;
