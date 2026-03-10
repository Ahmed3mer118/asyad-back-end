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
// # user: book viewing (يحجز معاينة)
router.post("/book", authenticate, authorize("user", "admin"), appointmentControllers.createAppointment);
// # user endpoints (must be before /:id so "me" is not treated as id)
router.get("/me", authenticate, authorize("user", "admin"), appointmentControllers.getMyAppointments);
// # get one appointment by id (after /me and /property/:propertyId)
router.get("/:id", authenticate, authorize("admin", "user"), appointmentControllers.getAppointmentById);
module.exports = router;

