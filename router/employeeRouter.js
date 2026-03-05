const express = require("express");
const router = express.Router();

const employeeControllers = require("../controllers/employeeControllers");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.post("/", authenticate, authorize("admin"), employeeControllers.createEmployee);
router.get("/", authenticate, authorize("admin"), employeeControllers.getEmployees);
router.get("/:id", authenticate, authorize("admin"), employeeControllers.getEmployeeById);
router.patch("/:id", authenticate, authorize("admin"), employeeControllers.updateEmployee);
router.patch("/:id/deactivate", authenticate, authorize("admin"), employeeControllers.deactivateEmployee);

module.exports = router;

