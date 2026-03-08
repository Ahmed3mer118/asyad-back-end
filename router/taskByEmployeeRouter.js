const express = require("express");
const router = express.Router();

const taskByEmployeeControllers = require("../controllers/taskByEmployeeControllers");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

// These actions are generally submitted by the Employee
router.post("/", authenticate, authorize("admin", "employee"), taskByEmployeeControllers.createTask);
router.get("/", authenticate, authorize("admin", "employee"), taskByEmployeeControllers.getTasks);
// Typically only Admins approve/reject/update the employee submissions
router.patch("/:id", authenticate, authorize("admin", "employee"), taskByEmployeeControllers.updateTask);

module.exports = router;
