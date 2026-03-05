const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },
    paymentMethod: { type: String, required: true, enum: ["cash", "visa", "mastercard", "check", "bank transfer", "prepaid card", "electronic wallet", "other"] },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["paid", "partial", "late"], default: "paid" },
    notes: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);

