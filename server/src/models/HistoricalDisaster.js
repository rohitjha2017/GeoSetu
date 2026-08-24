import mongoose from "mongoose";

const historicalDisasterSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  year: Number,
  event: String,
  districtsAffected: [String],
  note: String
});

export default mongoose.models.HistoricalDisaster || mongoose.model("HistoricalDisaster", historicalDisasterSchema);
