const Installment = require("../models/Installment.model");
const catchAsync = require("../utils/catch-async.util");
const AppError = require("../utils/app-error.util");

exports.createInstallment = catchAsync(async (req, res, next) => {
  const { transactionId, installmentNo, amount, dueDate, paymentId, notes } = req.body;
  if (!transactionId || installmentNo == null || !dueDate || amount == null) {
    return next(new AppError("transactionId, installmentNo, dueDate, amount are required", 400));
  }
  const installment = await Installment.create({
    transactionId,
    installmentNo,
    amount,
    dueDate,
    paymentId,
    notes
  });
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

exports.generateInstallments = catchAsync(async (req, res, next) => {
  const { transactionId, startDate, numberOfInstallments, frequency } = req.body;
  if (!transactionId || !startDate || !numberOfInstallments || !frequency) {
    return next(new AppError("transactionId, startDate, numberOfInstallments, frequency are required", 400));
  }

  const Transaction = require("../models/Transaction.model");
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) return next(new AppError("Transaction not found", 404));

  const remainingAmount = Math.max(0, transaction.totalAmount - (transaction.paidAmount || 0));
  if (remainingAmount <= 0) {
    return next(new AppError("هذه المعاملة مدفوعة بالكامل بالفعل (This transaction is already fully paid)", 400));
  }

  const amountPerInstallment = parseFloat((remainingAmount / numberOfInstallments).toFixed(2));
  const installmentsToInsert = [];
  let currentDate = new Date(startDate);

  // Get the highest current installment number for this transaction to avoid duplicates
  const lastInstallment = await Installment.findOne({ transactionId }).sort({ installmentNo: -1 });
  let startInstallmentNo = lastInstallment ? lastInstallment.installmentNo + 1 : 1;

  for (let i = 0; i < numberOfInstallments; i++) {
    // Determine the due date based on frequency
    if (i > 0) {
      if (frequency === "شهري") { // monthly
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (frequency === "ربع سنوي") { // quarterly
        currentDate.setMonth(currentDate.getMonth() + 3);
      } else if (frequency === "نصف سنوي") { // semi-annually
        currentDate.setMonth(currentDate.getMonth() + 6);
      } else if (frequency === "سنوي") { // yearly
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      } else {
        return next(new AppError("التردد غير مدعوم (Invalid frequency. use: شهري, ربع سنوي, نصف سنوي, سنوي)", 400));
      }
    }

    // For the very last installment, assign the remainder to avoid rounding issues
    const installmentAmount = (i === numberOfInstallments - 1)
      ? remainingAmount - (amountPerInstallment * (numberOfInstallments - 1))
      : amountPerInstallment;

    installmentsToInsert.push({
      transactionId,
      installmentNo: startInstallmentNo + i,
      amount: installmentAmount,
      dueDate: new Date(currentDate),
      notes: `قسط مُولد آلياً - ${frequency} - رقم ${startInstallmentNo + i}`
    });
  }

  const createdInstallments = await Installment.insertMany(installmentsToInsert);
  res.status(201).json({
    message: "تم إنشاء الأقساط بنجاح (Installments generated successfully)",
    count: createdInstallments.length,
    data: createdInstallments
  });
});


