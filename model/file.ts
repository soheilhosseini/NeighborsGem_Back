import mongoose, { InferSchemaType } from "mongoose";

export const FileSchema = new mongoose.Schema(
  {
    file_path: { type: String, required: true },
    thumbnail_path: { type: String }, // For images or pdf previews
    mime_type: { type: String },
    size: Number,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["avatar", "post"],
      default: "post",
    },
  },
  { timestamps: true }
);
type FileDoc = InferSchemaType<typeof FileSchema>;
export type FileType = mongoose.HydratedDocument<FileDoc>;
export default mongoose.model<FileType>("File", FileSchema);
