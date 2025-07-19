import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    icon: { type: String, default: null }, // Optional icon field for future use
  },
  { timestamps: true }
);

export default mongoose.model("Category", CategorySchema);
