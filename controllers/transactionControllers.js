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

  if (transactionType === "sale") {
    await Property.findByIdAndUpdate(propertyId, { availability: "sold" });
  }

  logger.info("Transaction created", { transactionId: transaction.id, propertyId, customerId, employeeId });
  res.status(201).json({ message: "Transaction created", data: transaction });
});

exports.getTransactions = catchAsync(async (req, res, next) => {
  const { customerId, employeeId, propertyId, page = 1, limit = 20 } = req.query;
  const isAdminOrEmployee = ["admin", "employee"].includes(String(req.user?.role || "").toLowerCase());
  const q = {};

  if (customerId) {
    if (!isAdminOrEmployee && req.user._id.toString() !== customerId) {
      return next(new AppError("You can only access your own transactions", 403));
    }
    q.customerId = customerId;
  } else if (!isAdminOrEmployee) {
    q.customerId = req.user._id;
  }
  if (employeeId) q.employeeId = employeeId;
  if (propertyId) q.propertyId = propertyId;

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

  const [transactions, total] = await Promise.all([
    Transaction.find(q)
      .sort({ transactionDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("propertyId", "name price statusSaleRent availability")
      .populate("customerId", "userName email phone_number")
      .populate({ path: "employeeId", populate: { path: "userId", select: "userName email phone_number" } })
      .lean(),
    Transaction.countDocuments(q)
  ]);

  res.status(200).json({ data: transactions, total });
});

exports.getMyTransactions = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const userId = req.user._id;
  const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

  const [transactions, total] = await Promise.all([
    Transaction.find({ customerId: userId })
      .sort({ transactionDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("propertyId", "name price statusSaleRent availability")
      .populate("customerId", "userName email phone_number")
      .populate({ path: "employeeId", populate: { path: "userId", select: "userName email phone_number" } })
      .lean(),
    Transaction.countDocuments({ customerId: userId })
  ]);

  res.status(200).json({ data: transactions, total });
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

