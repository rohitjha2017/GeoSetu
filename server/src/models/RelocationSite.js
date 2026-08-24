import mongoose from "mongoose";

const relocationSiteSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  districtId: String,
  location: { lat: Number, lng: Number },
  elevationM: Number,
  distanceFromRiverKm: Number,
  landCapacity: Number,
  housingCapacity: Number,
  waterInfraCapacity: Number,
  healthcareInfraCapacity: Number,
  roadInfraCapacity: Number,
  existingPopulation: Number,
  roadAccess: Number,
  healthcareAccess: Number,
  schoolAccess: Number,
  waterAvailability: Number
});

export default mongoose.models.RelocationSite || mongoose.model("RelocationSite", relocationSiteSchema);
