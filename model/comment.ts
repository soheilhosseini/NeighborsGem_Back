import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    text: String,
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      require: true,
    },
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", CommentSchema);
