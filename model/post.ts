import mongoose from "mongoose";
import FileSchema from "./file";

const PostSchema = new mongoose.Schema({
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    require: true,
  },
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

export default mongoose.model("Post", PostSchema);
