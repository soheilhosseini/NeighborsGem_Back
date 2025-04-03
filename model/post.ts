import mongoose from "mongoose";
import FileSchema from "./file";
import { AddressSchema } from "./address";

const PostSchema = new mongoose.Schema({
  address: AddressSchema,
  title: { type: String },
  description: { type: String },
  created_at: { type: Date, default: Date.now },
  categories: {},
  medias: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "File",
  },
  creator_id: { type: Number },
  likes: { type: Array },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
});

PostSchema.index({ "address.location": "2dsphere" });

export default mongoose.model("Post", PostSchema);
