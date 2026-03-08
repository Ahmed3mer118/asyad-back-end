const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
        customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
        transactionType: { type: String, enum: ["بيع", "إيجار"], required: true },
        transactionDate: { type: Date, default: Date.now },
        totalAmount: { type: Number, required: true },
        paidAmount: { type: Number, default: 0 }
    },
    { timestamps: true }
);

transactionSchema.virtual("remainingAmount").get(function () {
    const total = Number(this.totalAmount || 0);
    const paid = Number(this.paidAmount || 0);
    return Math.max(0, total - paid);
});

transactionSchema.set("toJSON", { virtuals: true });
transactionSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Transaction", transactionSchema);
