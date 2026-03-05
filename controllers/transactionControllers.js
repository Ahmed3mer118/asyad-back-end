const Transaction = require("../models/Transaction.model");
const Property = require("../models/Property.model");
const catchAsync = require("../utils/catch-async.util");
const AppError = require("../utils/app-error.util");
const logger = require("../utils/logger.util");

exports.createTransaction = catchAsync(async (req, res, next) => {
  const { propertyId, customerId, employeeId, transactionType, totalAmount, paidAmount } = req.body;
  if (!propertyId || !customerId || !employeeId || !transactionType || totalAmount == null) {
    return next(new AppError("propertyId, customerId, employeeId, transactionType, totalAmount are required", 400));
  }

  const property = await Property.findById(propertyId);
  if (!property) return next(new AppError("Property not found", 404));

  const transaction = await Transaction.create({
    propertyId,
    customerId,
    employeeId,
    transactionType,
    totalAmount,
    paidAmount: paidAmount || 0
  });

  if (transactionType === "بيع") {
    await Property.findByIdAndUpdate(propertyId, { availability: "مباع" });
  }

  logger.info("Transaction created", { transactionId: transaction.id, propertyId, customerId, employeeId });
  res.status(201).json({ message: "Transaction created", data: transaction });
});

exports.getTransactions = catchAsync(async (req, res) => {
  const { customerId, employeeId, propertyId } = req.query;
  const q = {};
  if (customerId) q.customerId = customerId;
  if (employeeId) q.employeeId = employeeId;
  if (propertyId) q.propertyId = propertyId;

  const transactions = await Transaction.find(q)
    .sort({ createdAt: -1 })
    .populate("propertyId", "name price statusSaleRent availability")
    .populate("customerId", "userName email phone_number")
    .populate({ path: "employeeId", populate: { path: "userId", select: "userName email phone_number" } });

  res.status(200).json({ message: "Transactions fetched", data: transactions });
});

exports.getTransactionById = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate("propertyId")
    .populate("customerId", "userName email phone_number")
    .populate({ path: "employeeId", populate: { path: "userId", select: "userName email phone_number" } });

  if (!transaction) return next(new AppError("Transaction not found", 404));
  res.status(200).json({ message: "Transaction fetched", data: transaction });
});

exports.updateTransaction = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!transaction) return next(new AppError("Transaction not found", 404));
  res.status(200).json({ message: "Transaction updated", data: transaction });
});

