const express = require("express");
const router = express.Router();

const tasksToEmployeeControllers = require("../controllers/tasksToEmployeeControllers");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.post("/", authenticate, authorize("admin"), tasksToEmployeeControllers.createTask);
router.get("/", authenticate, authorize("admin", "employee"), tasksToEmployeeControllers.getTasks);
router.patch("/:id", authenticate, authorize("admin", "employee"), tasksToEmployeeControllers.updateTask);

module.exports = router;
