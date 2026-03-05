const PaymentMethod = require("../models/PaymentMethod.model");
const catchAsync = require("../utils/catch-async.util");
const AppError = require("../utils/app-error.util");

exports.createPaymentMethod = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  if (!name) return next(new AppError("name is required", 400));
  const method = await PaymentMethod.create({ name });
  res.status(201).json({ message: "Payment method created", data: method });
});

exports.getPaymentMethods = catchAsync(async (req, res) => {
  const methods = await PaymentMethod.find().sort({ name: 1 });
  res.status(200).json({ message: "Payment methods fetched", data: methods });
});

exports.updatePaymentMethod = catchAsync(async (req, res, next) => {
  const method = await PaymentMethod.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!method) return next(new AppError("Payment method not found", 404));
  res.status(200).json({ message: "Payment method updated", data: method });
});

exports.deletePaymentMethod = catchAsync(async (req, res, next) => {
  const method = await PaymentMethod.findByIdAndDelete(req.params.id);
  if (!method) return next(new AppError("Payment method not found", 404));
  res.status(204).send();
});

