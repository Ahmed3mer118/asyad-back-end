const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending"
    },
    dueDate: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);

