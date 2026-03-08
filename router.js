const express = require('express');
const authRoutes = require('./router/authRouter');
const userRoutes = require('./router/userRouter');
const propertyRoutes = require('./router/propertyRouter');
const appointmentRoutes = require('./router/appointmentRouter');
const employeeRoutes = require("./router/employeeRouter");
const transactionRoutes = require("./router/transactionRouter");
const paymentRoutes = require("./router/paymentRouter");
const installmentRoutes = require("./router/installmentRouter");
const favoriteRoutes = require("./router/favoriteRouter");
const evaluationRoutes = require("./router/evaluationRouter");
const emailLogRoutes = require("./router/emailLogRouter");
const tasksToEmployeeRoutes = require("./router/tasksToEmployeeRouter");
const taskByEmployeeRoutes = require("./router/taskByEmployeeRouter");

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/properties', propertyRoutes);
router.use('/appointments', appointmentRoutes);
router.use("/employees", employeeRoutes);
router.use("/transactions", transactionRoutes);
router.use("/payments", paymentRoutes);
router.use("/installments", installmentRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/evaluations", evaluationRoutes);
router.use("/email-logs", emailLogRoutes);
router.use("/tasks-to-employees", tasksToEmployeeRoutes);
router.use("/tasks-by-employees", taskByEmployeeRoutes);

module.exports = router;

