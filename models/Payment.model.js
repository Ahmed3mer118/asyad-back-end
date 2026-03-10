const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },
    installmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Installment" },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cash", "visa", "bank_transfer", "check"],
      default: "cash"
    },
    amount: { type: Number, required: true, min: 0.01 },
    paymentDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["paid", "partial", "late", "cancelled"],
      default: "paid"
    },
    notes: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);

