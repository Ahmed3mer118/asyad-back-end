const Payment = require("../models/Payment.model");
const Transaction = require("../models/Transaction.model");
const catchAsync = require("../utils/catch-async.util");
const AppError = require("../utils/app-error.util");
const logger = require("../utils/logger.util");

exports.createPayment = catchAsync(async (req, res, next) => {
  const { transactionId, installmentId, paymentMethod, amount, status, notes } = req.body;
  if (!transactionId || !paymentMethod || amount == null) {
    return next(new AppError("transactionId, paymentMethod, amount are required", 400));
  }
  const paymentAmount = Number(amount);
  if (paymentAmount <= 0) return next(new AppError("amount must be > 0", 400));

  const transaction = await Transaction.findById(transactionId);
  if (!transaction) return next(new AppError("Transaction not found", 404));

  const isAdminOrEmployee = ["admin", "employee"].includes(String(req.user?.role || "").toLowerCase());
  if (!isAdminOrEmployee && transaction.customerId.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only record payment for your own transaction", 403));
  }

  const remainingAmount = transaction.totalAmount - (transaction.paidAmount || 0);

  if (remainingAmount <= 0) {
    return next(new AppError("This transaction is already fully paid", 400));
  }

  if (paymentAmount > remainingAmount) {
    return next(new AppError(`Payment amount (${paymentAmount}) exceeds remaining amount (${remainingAmount})`, 400));
  }

  const paymentData = { transactionId, paymentMethod, amount: paymentAmount, status, notes };
  if (installmentId) {
    paymentData.installmentId = installmentId;
  }

  const payment = await Payment.create(paymentData);

  const updatedTransaction = await Transaction.findByIdAndUpdate(
    transactionId,
    { $inc: { paidAmount: paymentAmount } },
    { new: true }
  );

  let updatedInstallment = null;
  if (installmentId) {
    const Installment = require("../models/Installment.model");
    const installment = await Installment.findById(installmentId);
    if (installment) {
      const newPaidAmount = (installment.paidAmount || 0) + paymentAmount;
      const newStatus = newPaidAmount >= installment.amount ? "paid" : "partial";

      updatedInstallment = await Installment.findByIdAndUpdate(
        installmentId,
        {
          paidAmount: newPaidAmount,
          status: newStatus,
          paymentId: payment._id,
          paymentDate: new Date()
        },
        { new: true }
      );
    }
  }

  logger.info("Payment created and transaction updated", { paymentId: payment.id, transactionId });
  res.status(201).json({
    data: {
      payment,
      transaction: updatedTransaction,
      installment: updatedInstallment
    }
  });
});

exports.getPayments = catchAsync(async (req, res, next) => {
  const { transactionId } = req.query;
  const isAdminOrEmployee = ["admin", "employee"].includes(String(req.user?.role || "").toLowerCase());
  const q = {};
  if (transactionId) {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return next(new AppError("Transaction not found", 404));
    if (!isAdminOrEmployee && transaction.customerId.toString() !== req.user._id.toString()) {
      return next(new AppError("You can only view payments for your own transactions", 403));
    }
    q.transactionId = transactionId;
  }
  const payments = await Payment.find(q).sort({ paymentDate: -1, createdAt: -1 });
  res.status(200).json({ data: payments, total: payments.length });
});

exports.getMyPayments = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const myTransactionIds = (await Transaction.find({ customerId: userId }).select("_id").lean()).map((t) => t._id);
  const payments = await Payment.find({ transactionId: { $in: myTransactionIds } })
    .sort({ paymentDate: -1, createdAt: -1 })
    .lean();
  res.status(200).json({ data: payments, total: payments.length });
});

