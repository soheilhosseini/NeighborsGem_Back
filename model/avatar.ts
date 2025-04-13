import mongoose from "mongoose";
const AvatarSchema = new mongoose.Schema(
  {
    avatar: String,
    avatar_thumbnail: String,
  },
  { timestamps: true }
);
export default AvatarSchema;
