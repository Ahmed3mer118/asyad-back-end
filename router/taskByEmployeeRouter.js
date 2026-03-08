const express = require("express");
const router = express.Router();

const taskByEmployeeControllers = require("../controllers/taskByEmployeeControllers");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.post("/", authenticate, authorize("admin", "employee"), taskByEmployeeControllers.createTask);
router.get("/", authenticate, authorize("admin", "employee"), taskByEmployeeControllers.getTasks);
router.patch("/:id", authenticate, authorize("admin", "employee"), taskByEmployeeControllers.updateTask);

module.exports = router;
