import mongoose from "mongoose";
import FileSchema from "./file";
import { AddressSchema } from "./address";

const PostSchema = new mongoose.Schema(
  {
    address: AddressSchema,
    title: { type: String },
    description: { type: String },
    medias: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "File",
    },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

PostSchema.index({ "address.location": "2dsphere" });

export default mongoose.model("Post", PostSchema);
