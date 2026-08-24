import mongoose from "mongoose";

const districtSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  center: { lat: Number, lng: Number },
  population: Number,
  floodProne: Boolean
});

export default mongoose.models.District || mongoose.model("District", districtSchema);
