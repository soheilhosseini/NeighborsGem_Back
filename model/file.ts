import mongoose from "mongoose";

export const FileSchema = new mongoose.Schema({
  file_path: { type: String, required: true },
  thumbnail_path: { type: String }, // For images or pdf previews
  mime_type: { type: String },
  size: Number,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  created_at: { type: Date, default: Date.now },
});
export default mongoose.model("File", FileSchema);
