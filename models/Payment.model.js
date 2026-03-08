const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },
    installmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Installment" },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["كاش", "فيزا", "تحويل بنكي", "شيك"],
      default: "كاش"
    },
    amount: { type: Number, required: true, min: 0.01 },
    paymentDate: { type: Date, default: Date.now },
    // مطابق للـ SQL: Status ('مدفوع', 'جزئي', 'متأخر', 'ملغي')
    status: {
      type: String,
      enum: ["مدفوع", "جزئي", "متأخر", "ملغي"],
      default: "مدفوع"
    },
    notes: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);

