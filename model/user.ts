import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String, trim: true, sparse: true, unique: true },
    phone_number: { type: String, trim: true, sparse: true, unique: true },
    username: { type: String, trim: true, sparse: true, unique: true },
    password: { type: String, trim: true, select: false },
    avatar: { type: mongoose.Schema.Types.ObjectId, ref: "File" },
    pushToken: { type: String },
  },
  { timestamps: true}
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  if (this.password) this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("User", UserSchema);
