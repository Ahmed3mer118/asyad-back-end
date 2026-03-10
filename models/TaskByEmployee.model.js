const mongoose = require("mongoose");

const taskByEmployeeSchema = new mongoose.Schema(
    {
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
        taskNo: { type: Number, required: true },
        data: { type: String, required: true },
        notes: { type: String },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "completed"],
            default: "pending"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("TaskByEmployee", taskByEmployeeSchema);
