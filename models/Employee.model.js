const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    jobTitle: { type: String }, 
    department: { type: String }, 
    salary: { type: Number },
    /** النسبة الحالية للعمليات الجديدة فقط؛ تغييرها لا يؤثر على العمليات السابقة */
    currentCommissionRate: {
      type: Number,
      min: 0,
      max: 100
    },
    /** للتوافق مع الإصدارات السابقة؛ يفضّل استخدام currentCommissionRate */
    commissionRate: {
      type: Number,
      min: 0,
      max: 100
    },
    hireDate: {
      type: Date,
      // default: Date.now
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract","hybrid"]
    },
    yearsOfExperience: { type: Number },
    averageRating: { type: Number },
    totalSalesAmount: { type: Number, default: 0 },
    totalDeals: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);

