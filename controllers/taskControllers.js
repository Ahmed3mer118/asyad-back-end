const Task = require("../models/Task.model");
const catchAsync = require("../utils/catch-async.util");
const AppError = require("../utils/app-error.util");

exports.createTask = catchAsync(async (req, res, next) => {
  const { employeeId, title, description, dueDate } = req.body;
  if (!employeeId || !title) return next(new AppError("employeeId and title are required", 400));
  const task = await Task.create({ employeeId, title, description, dueDate });
  res.status(201).json({ message: "Task created", data: task });
});

exports.getTasks = catchAsync(async (req, res) => {
  const { employeeId, status } = req.query;
  const q = {};
  if (employeeId) q.employeeId = employeeId;
  if (status) q.status = status;
  const tasks = await Task.find(q).sort({ createdAt: -1 });
  res.status(200).json({ message: "Tasks fetched", data: tasks });
});

exports.updateTask = catchAsync(async (req, res, next) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!task) return next(new AppError("Task not found", 404));
  res.status(200).json({ message: "Task updated", data: task });
});

