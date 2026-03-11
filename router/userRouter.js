const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userControllers");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

// Specific routes first (before /:id so "me" is not treated as id)
router.get("/byAdmin", authenticate, authorize("admin"), userControllers.getUsers);
router.get("/me", authenticate, authorize("user", "admin", "owner", "employee"), userControllers.getUsersById);
router.get("/", authenticate, authorize("user", "admin", "owner", "employee"), userControllers.getUsersById);
router.put("/update-status", authenticate, authorize("admin"), userControllers.adminUpdateUserStatus);
router.put("/me", authenticate, authorize("user", "admin"), userControllers.updateUserProfile);

// Parameterized routes last
router.get("/:id", authenticate, authorize("admin"), userControllers.getUsersById);
router.patch("/:id", authenticate, authorize("admin"), userControllers.updateUserRole);

module.exports = router;
