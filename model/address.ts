import mongoose from "mongoose";

export const AddressSchema = new mongoose.Schema({
  address: { type: String },
  location: {
    type: {
      type: String, // Always "Point" for GeoJSON format
      enum: ["Point"], // Only "Point" type is valid for GeoJSON
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude] format
      required: true,
    },
  },
  is_main_address: { type: Boolean },
  created_by: { type: mongoose.Schema.Types.ObjectId },
});

// Ensure that MongoDB creates a 2dsphere index for geo queries
AddressSchema.index({ location: "2dsphere" });

export default mongoose.model("Address", AddressSchema);
