import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true }, // برای URL
  icon: { type: String }, // اختیاری: emoji یا آدرس آیکن
  isActive: { type: Boolean, default: true },
});
