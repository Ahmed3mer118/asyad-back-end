const TasksToEmployee = require("../models/TasksToEmployee.model");
const catchAsync = require("../utils/catch-async.util");
const AppError = require("../utils/app-error.util");

exports.createTask = catchAsync(async (req, res, next) => {
    const { employeeId, title, description, propertyId, appointmentId, dueDate } = req.body;
    if (!employeeId || !title || !propertyId) {
        return next(new AppError("employeeId, title, and propertyId are required", 400));
    }

    if (dueDate) {
        const d = new Date(dueDate);
        const startOfDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
        const endOfDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
        const existingAtSameTime = await TasksToEmployee.findOne({
            employeeId,
            dueDate: { $gte: startOfDay, $lte: endOfDay }
        });
        if (existingAtSameTime) {
            return next(new AppError("Employee already has a task at this date/time (عنده نفس المعاد فيه تاسك)", 409));
        }
    }

    const task = await TasksToEmployee.create({ employeeId, title, description, propertyId, appointmentId, dueDate: dueDate ? new Date(dueDate) : undefined });
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
