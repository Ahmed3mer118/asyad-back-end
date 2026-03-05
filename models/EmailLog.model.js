const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    subject: { type: String },
    message: { type: String },
    status: { type: String, enum: ["Sent", "Failed"], default: "Sent" }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

module.exports = mongoose.model("EmailLog", emailLogSchema);

