import mongoose from "mongoose";

const villageSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  districtId: { type: String, required: true },
  location: { lat: Number, lng: Number },
  population: Number,
  elevationM: Number,
  distanceFromRiverKm: Number,
  historicalFloods: Number,
  vulnerabilityIndex: Number
});

export default mongoose.models.Village || mongoose.model("Village", villageSchema);
