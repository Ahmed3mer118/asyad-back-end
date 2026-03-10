const mongoose = require("mongoose");

const tasksToEmployeeSchema = new mongoose.Schema(
    {
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
        propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
        appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
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

module.exports = mongoose.model("TasksToEmployee", tasksToEmployeeSchema);
