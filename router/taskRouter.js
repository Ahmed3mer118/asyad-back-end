const express = require("express");
const router = express.Router();

const taskControllers = require("../controllers/taskControllers");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.post("/", authenticate, authorize("admin"), taskControllers.createTask);
router.get("/", authenticate, authorize("admin", "employee"), taskControllers.getTasks);
router.patch("/:id", authenticate, authorize("admin", "employee"), taskControllers.updateTask);

module.exports = router;

