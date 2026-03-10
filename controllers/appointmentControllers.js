const Appointment = require("../models/Appointment.model");
const logger = require("../utils/logger.util");

const populateAppointment = (query) =>
  query
    .populate("customerId", "userName email phone_number role")
    .populate("propertyId", "name price location statusSaleRent availability")
    .populate("employeeId", "jobTitle department");

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
    const appointments = await populateAppointment(
      Appointment.find({ customerId: req.user._id }).sort({ startTime: 1 })
    );

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
    const appointments = await populateAppointment(
      Appointment.find().sort({ startTime: -1 })
    );

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

    const appointments = await populateAppointment(
      Appointment.find({ propertyId }).sort({ startTime: 1 })
    );

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

exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await populateAppointment(Appointment.findById(id));

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    res.status(200).json({
      message: "Appointment fetched successfully",
      data: appointment
    });
  } catch (error) {
    logger.error("Error fetching appointment by id", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Error fetching appointment" });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(id, { status }, { new: true })
      .populate("customerId", "userName email phone_number role")
      .populate("propertyId", "name price location statusSaleRent availability")
      .populate("employeeId", "jobTitle department");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

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

