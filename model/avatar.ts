import mongoose from "mongoose";
const AvatarSchema = new mongoose.Schema({
  created_at: { type: Date, default: Date.now },
  avatar: String,
  avatar_thumbnail: String,
});
export default AvatarSchema;
