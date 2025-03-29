import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  address: { type: String },
  coordinate: { type: Array },
  is_main_address: { type: Boolean },
  user_id: { type: String },
});

export default mongoose.model("Address", AddressSchema);
