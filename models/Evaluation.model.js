const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    evaluatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    rating: { type: Number, min: 1, max: 5, required: true },
    comments: { type: String },
    evaluationDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Evaluation", evaluationSchema);

