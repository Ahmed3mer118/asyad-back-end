const TaskByEmployee = require("../models/TaskByEmployee.model");
const catchAsync = require("../utils/catch-async.util");
const AppError = require("../utils/app-error.util");

exports.createTask = catchAsync(async (req, res, next) => {
    const { employeeId, taskNo, data, notes } = req.body;
    if (!employeeId || taskNo == null || !data) {
        return next(new AppError("employeeId, taskNo, and data are required", 400));
    }

    // Prevent duplicate taskNo for the same employee
    const existing = await TaskByEmployee.findOne({ employeeId, taskNo });
    if (existing) {
        return next(new AppError("Task number already exists for this employee", 400));
    }

    const task = await TaskByEmployee.create({ employeeId, taskNo, data, notes });
    res.status(201).json({ message: "Task submitted by employee successfully", data: task });
});

exports.getTasks = catchAsync(async (req, res) => {
    const { employeeId, status } = req.query;
    const q = {};
    if (employeeId) q.employeeId = employeeId;
    if (status) q.status = status;
    const tasks = await TaskByEmployee.find(q)
        .populate("employeeId")
        .sort({ createdAt: -1 });
    res.status(200).json({ message: "Tasks fetched", data: tasks });
});

exports.updateTask = catchAsync(async (req, res, next) => {
    const task = await TaskByEmployee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return next(new AppError("Task not found", 404));
    res.status(200).json({ message: "Task updated", data: task });
});
