const mongoose = require("mongoose");

const installmentSchema = new mongoose.Schema(
  {
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },
    installmentNo: { type: Number, required: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    amount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueDate: { type: Date, required: true },
    paymentDate: { type: Date },
    status: {
      type: String,
      enum: ["مستحق", "مدفوع", "متأخر"],
      default: "مستحق"
    },
    notes: { type: String }
  },
  { timestamps: true }
);

installmentSchema.index({ transactionId: 1, installmentNo: 1 }, { unique: true });

module.exports = mongoose.model("Installment", installmentSchema);

