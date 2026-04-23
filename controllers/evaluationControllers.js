const Evaluation = require("../models/Evaluation.model");
const Employee = require("../models/Employee.model");
const catchAsync = require("../utils/catch-async.util");
const AppError = require("../utils/app-error.util");

exports.createEvaluation = catchAsync(async (req, res, next) => {
  const { employeeId, appointmentId, transactionId, rating, comments } = req.body;
  if (!employeeId || rating == null) return next(new AppError("employeeId and rating are required", 400));

  const evaluation = await Evaluation.create({
    employeeId,
    evaluatorId: req.user._id,
    appointmentId,
    transactionId,
    rating,
    comments
  });

  // منطق بديل للـ Trigger: تحديث AverageRating في Employee
  const stats = await Evaluation.aggregate([
    { $match: { employeeId: evaluation.employeeId } },
    {
      $group: {
        _id: "$employeeId",
        avgRating: { $avg: "$rating" }
      }
    }
  ]);

  if (stats.length) {
    await Employee.findByIdAndUpdate(evaluation.employeeId, {
      averageRating: Number(stats[0].avgRating.toFixed(2))
    });
  }

  const populated = await Evaluation.findById(evaluation._id)
    .populate("evaluatorId", "userName email phone_number")
    .lean();
  const data = populated ? { ...populated, ratingBy: populated.evaluatorId || null } : evaluation;
  res.status(201).json({ message: "Evaluation created", data });
});

exports.getEvaluations = catchAsync(async (req, res) => {
  const { employeeId } = req.query;
  const q = {};
  if (employeeId) q.employeeId = employeeId;
  const evaluations = await Evaluation.find(q)
    .sort({ createdAt: -1 })
    .populate("evaluatorId", "userName email phone_number")
    .lean();
  const data = evaluations.map((e) => ({
    ...e,
    ratingBy: e.evaluatorId || null
  }));
  res.status(200).json({ message: "Evaluations fetched", data });
});

