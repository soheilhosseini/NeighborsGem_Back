import mongoose from "mongoose";
import FileSchema from "./file";
import AddressSchema from "./address";

const PostSchema = new mongoose.Schema({
  address_id: { type: String, ref: "Address", require: true },
  title: { type: String },
  description: { type: String },
  created_at: { type: Date, default: Date.now },
  categories: {},
  medias: [String],
  creator_id: { type: Number },
  likes: { type: Array },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
});

export default mongoose.model("Post", PostSchema);
