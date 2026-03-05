const Employee = require("../models/Employee.model");
const User = require("../models/userModel");
const Role = require("../models/Role.model");
const catchAsync = require("../utils/catch-async.util");
const AppError = require("../utils/app-error.util");
const logger = require("../utils/logger.util");

exports.createEmployee = catchAsync(async (req, res, next) => {
  const {
    userId,
    jobTitle,
    department,
    salary,
    commissionRate,
    hireDate,
    employmentType,
    yearsOfExperience
  } = req.body;
  if (!userId) return next(new AppError("userId is required", 400));

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  const existingEmployee = await Employee.findOne({ userId });
  if (existingEmployee) return next(new AppError("Employee already exists for this user", 409));

  const employee = await Employee.create({
    userId,
    jobTitle,
    department,
    salary,
    commissionRate,
    hireDate,
    employmentType,
    yearsOfExperience
  });

  const employeeRole = await Role.findOne({ name: "Employee" });
  if (employeeRole) {
    user.role = "Employee";
    user.roleId = employeeRole._id;
    await user.save();
  }

  logger.info("Employee created", { employeeId: employee.id, userId: user.id });
  res.status(201).json({ message: "Employee created", data: employee });
});

exports.getEmployees = catchAsync(async (req, res) => {
  const employees = await Employee.find().populate("userId", "userName email phone_number role isActive");
  res.status(200).json({ message: "Employees fetched", data: employees });
});

exports.getEmployeeById = catchAsync(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id).populate("userId", "userName email phone_number role isActive");
  if (!employee) return next(new AppError("Employee not found", 404));
  res.status(200).json({ message: "Employee fetched", data: employee });
});

exports.updateEmployee = catchAsync(async (req, res, next) => {
  const updates = req.body;
  const employee = await Employee.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!employee) return next(new AppError("Employee not found", 404));
  logger.info("Employee updated", { employeeId: employee.id });
  res.status(200).json({ message: "Employee updated", data: employee });
});

exports.deactivateEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!employee) return next(new AppError("Employee not found", 404));
  logger.info("Employee deactivated", { employeeId: employee.id });
  res.status(200).json({ message: "Employee deactivated", data: employee });
});

