const express = require("express");
const router = express.Router();
const appointmentControllers = require("../controllers/appointmentControllers");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

// # admin endpoints    
router.get("/", authenticate, authorize("admin"), appointmentControllers.getAllAppointments);
router.get("/property/:propertyId", authenticate, authorize("admin"), appointmentControllers.getAppointmentsByProperty);
router.post("/", authenticate, authorize("admin"), appointmentControllers.createAppointment);
router.put("/:id/status", authenticate, authorize("admin"), appointmentControllers.updateAppointmentStatus);
// # user endpoints
router.get("/me", authenticate, authorize("user", "admin"), appointmentControllers.getMyAppointments);
module.exports = router;

