const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true
    },
    // SQL: Appointments.CustomerId
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // Backward compatibility (old name)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee"
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    notes: {
      type: String
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled"
    }
  },
  {
    timestamps: true
  }
);

appointmentSchema.pre("validate", function (next) {
  if (!this.customerId && this.userId) this.customerId = this.userId;
  if (!this.userId && this.customerId) this.userId = this.customerId;
  next();
});

module.exports = mongoose.model("Appointment", appointmentSchema);

