const EmailLog = require("../models/EmailLog.model");
const catchAsync = require("../utils/catch-async.util");
const AppError = require("../utils/app-error.util");

exports.createEmailLog = catchAsync(async (req, res, next) => {
  const { userId, email, subject, message, status } = req.body;
  if (!userId || !email) return next(new AppError("userId and email are required", 400));

  // احسب رقم اللوج التالي لهذا المستخدم (LogNo)
  const lastLog = await EmailLog.findOne({ userId }).sort({ logNo: -1 }).lean();
  const nextLogNo = lastLog ? lastLog.logNo + 1 : 1;

  const log = await EmailLog.create({
    userId,
    logNo: nextLogNo,
    email,
    subject,
    message,
    status
  });
  res.status(201).json({ message: "Email log created", data: log });
});

exports.getEmailLogs = catchAsync(async (req, res) => {
  const { userId, status } = req.query;
  const q = {};
  if (userId) q.userId = userId;
  if (status) q.status = status;
  const logs = await EmailLog.find(q).sort({ createdAt: -1 });
  res.status(200).json({ message: "Email logs fetched", data: logs });
});

