const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userControllers")
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
router.get("/byAdmin", authenticate, authorize("admin"), userControllers.getUsers);

// current user profile (kept both paths for backward compatibility)
router.get("/", authenticate, authorize("user", "admin", "owner", "employee"), userControllers.getUsersById);
router.get("/me", authenticate, authorize("user", "admin", "owner", "employee"), userControllers.getUsersById);
router.put("/update-status", authenticate, authorize("admin"), userControllers.adminUpdateUserStatus);
// update user profile
router.put("/me", authenticate, authorize("user", "admin"), userControllers.updateUserProfile);
module.exports = router;
