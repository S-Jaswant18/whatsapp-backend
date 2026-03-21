import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  name: String,
  templateName: String,
  scheduledTime: Date,
  status: { type: String, default: "Pending" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Campaign", campaignSchema);
