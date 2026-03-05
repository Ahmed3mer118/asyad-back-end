const mongoose = require("mongoose");

const installmentSchema = new mongoose.Schema(
  {
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    paymentDate: { type: Date },
    status: { type: String, enum: ["due", "paid", "late"], default: "due" },
    notes: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Installment", installmentSchema);

