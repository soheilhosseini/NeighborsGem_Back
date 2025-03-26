import mongoose from "mongoose";

const ReactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  type: { type: String, enum: ["like", "dislike"], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Reaction", ReactionSchema);
