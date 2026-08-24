import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  type: { type: String, enum: ["shelter", "hospital", "police", "relief_centre"], required: true },
  name: { type: String, required: true },
  location: { lat: Number, lng: Number },
  districtId: String,
  capacity: Number
});

export default mongoose.models.Service || mongoose.model("Service", serviceSchema);
