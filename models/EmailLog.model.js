const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // مماثل لـ LogNo في SQL (جزء من الـ PK هناك)
    logNo: { type: Number, required: true },
    email: { type: String, required: true },
    subject: { type: String },
    message: { type: String },
    status: { type: String, enum: ["Sent", "Failed"], default: "Sent" }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

emailLogSchema.index({ userId: 1, logNo: 1 }, { unique: true });

module.exports = mongoose.model("EmailLog", emailLogSchema);

