import mongoose from "mongoose";

export const FileSchema = new mongoose.Schema(
  {
    file_path: { type: String, required: true },
    thumbnail_path: { type: String }, // For images or pdf previews
    mime_type: { type: String },
    size: Number,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
export default mongoose.model("File", FileSchema);
