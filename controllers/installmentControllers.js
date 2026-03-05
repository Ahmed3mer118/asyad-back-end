const Installment = require("../models/Installment.model");
const catchAsync = require("../utils/catch-async.util");
const AppError = require("../utils/app-error.util");

exports.createInstallment = catchAsync(async (req, res, next) => {
  const { transactionId, dueDate, amount, notes } = req.body;
  if (!transactionId || !dueDate || amount == null) {
    return next(new AppError("transactionId, dueDate, amount are required", 400));
  }
  const installment = await Installment.create({ transactionId, dueDate, amount, notes });
  res.status(201).json({ message: "Installment created", data: installment });
});

exports.getInstallments = catchAsync(async (req, res) => {
  const { transactionId } = req.query;
  const q = {};
  if (transactionId) q.transactionId = transactionId;
  const installments = await Installment.find(q).sort({ dueDate: 1 });
  res.status(200).json({ message: "Installments fetched", data: installments });
});

exports.updateInstallment = catchAsync(async (req, res, next) => {
  const installment = await Installment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!installment) return next(new AppError("Installment not found", 404));
  res.status(200).json({ message: "Installment updated", data: installment });
});

