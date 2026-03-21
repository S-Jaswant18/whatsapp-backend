import mongoose from "mongoose";

const messageLogSchema = new mongoose.Schema({
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String,
  status: { type: String, default: "pending" },
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  errorMessage: String,
  whatsappMessageId: String
}, { timestamps: true });

export default mongoose.model("MessageLog", messageLogSchema);
