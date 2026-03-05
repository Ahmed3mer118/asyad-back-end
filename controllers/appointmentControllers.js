const Appointment = require("../models/Appointment.model");
const logger = require("../utils/logger.util");

exports.createAppointment = async (req, res) => {
  try {
    const { propertyId, startTime, endTime, notes } = req.body;

    const appointment = await Appointment.create({
      propertyId,
      customerId: req.user._id,
      startTime,
      endTime,
      notes
    });

    logger.info("Appointment created", {
      appointmentId: appointment._id,
      userId: req.user._id,
      propertyId
    });

    res.status(201).json({ message: "Appointment created", data: appointment });
  } catch (error) {
    logger.error("Error creating appointment", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Error creating appointment" });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ customerId: req.user._id }).sort({
      startTime: 1
    });

    res.status(200).json({
      message: "Appointments fetched successfully",
      data: appointments
    });
  } catch (error) {
    logger.error("Error fetching my appointments", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Error fetching appointments" });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({
      startTime: -1
    });

    res.status(200).json({
      message: "Appointments fetched successfully",
      data: appointments
    });
  } catch (error) {
    logger.error("Error fetching appointments", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Error fetching appointments" });
  }
};  

exports.getAppointmentsByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const appointments = await Appointment.find({ propertyId }).sort({
      startTime: 1
    });

    res.status(200).json({
      message: "Appointments fetched successfully",
      data: appointments
    });
  } catch (error) {
    logger.error("Error fetching appointments by property", {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: "Error fetching appointments" });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(id, { status }, { new: true });

    logger.info("Appointment status updated", {
      appointmentId: appointment._id,
      status
    });
    

    res.status(200).json({ message: "Appointment status updated", data: appointment });
  } catch (error) {
    logger.error("Error updating appointment status", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Error updating appointment status" });
  }
};

