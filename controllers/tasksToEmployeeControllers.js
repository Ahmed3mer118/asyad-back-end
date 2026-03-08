const TasksToEmployee = require("../models/TasksToEmployee.model");
const catchAsync = require("../utils/catch-async.util");
const AppError = require("../utils/app-error.util");

exports.createTask = catchAsync(async (req, res, next) => {
    const { employeeId, title, description, propertyId, appointmentId, dueDate } = req.body;
    if (!employeeId || !title || !propertyId) {
        return next(new AppError("employeeId, title, and propertyId are required", 400));
    }
    const task = await TasksToEmployee.create({ employeeId, title, description, propertyId, appointmentId, dueDate });
    res.status(201).json({ message: "Task assigned to employee successfully", data: task });
});

exports.getTasks = catchAsync(async (req, res) => {
    const { employeeId, status } = req.query;
    const q = {};
    if (employeeId) q.employeeId = employeeId;
    if (status) q.status = status;
    const tasks = await TasksToEmployee.find(q)
        .populate("employeeId")
        .populate("propertyId")
        .sort({ createdAt: -1 });
    res.status(200).json({ message: "Tasks fetched", data: tasks });
});

exports.updateTask = catchAsync(async (req, res, next) => {
    const task = await TasksToEmployee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return next(new AppError("Task not found", 404));
    res.status(200).json({ message: "Task updated", data: task });
});
