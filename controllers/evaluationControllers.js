const Evaluation = require("../models/Evaluation.model");
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
  res.status(201).json({ message: "Evaluation created", data: evaluation });
});

exports.getEvaluations = catchAsync(async (req, res) => {
  const { employeeId } = req.query;
  const q = {};
  if (employeeId) q.employeeId = employeeId;
  const evaluations = await Evaluation.find(q).sort({ createdAt: -1 });
  res.status(200).json({ message: "Evaluations fetched", data: evaluations });
});

