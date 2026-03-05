const Payment = require("../models/Payment.model");
const Transaction = require("../models/Transaction.model");
const catchAsync = require("../utils/catch-async.util");
const AppError = require("../utils/app-error.util");
const logger = require("../utils/logger.util");

exports.createPayment = catchAsync(async (req, res, next) => {
  const { transactionId, paymentMethod, amount, status, notes } = req.body;
  if (!transactionId || !paymentMethod || amount == null) {
    return next(new AppError("transactionId, paymentMethod, amount are required", 400));
  }
  if (Number(amount) <= 0) return next(new AppError("amount must be > 0", 400));

  const payment = await Payment.create({ transactionId, paymentMethod, amount, status, notes });
  const updatedTransaction = await Transaction.findByIdAndUpdate(
    transactionId,
    { $inc: { paidAmount: Number(amount) } },
    { new: true }
  );

  if (!updatedTransaction) return next(new AppError("Transaction not found", 404));

  logger.info("Payment created and transaction updated", { paymentId: payment.id, transactionId });
  res.status(201).json({ message: "Payment created", data: { payment, transaction: updatedTransaction } });
});

exports.getPayments = catchAsync(async (req, res) => {
  const { transactionId } = req.query;
  const q = {};
  if (transactionId) q.transactionId = transactionId;
  const payments = await Payment.find(q)
    .sort({ createdAt: -1 });
  res.status(200).json({ message: "Payments fetched", data: payments });
});

