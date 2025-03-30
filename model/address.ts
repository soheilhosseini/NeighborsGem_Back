import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  address: { type: String },
  coordinate: { type: Array },
  is_main_address: { type: Boolean },
  created_by: { type: mongoose.Schema.Types.ObjectId },
});

export default mongoose.model("Address", AddressSchema);
