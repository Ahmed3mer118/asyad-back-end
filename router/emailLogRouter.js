const express = require("express");
const router = express.Router();

const emailLogControllers = require("../controllers/emailLogControllers");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.post("/", authenticate, authorize("admin"), emailLogControllers.createEmailLog);
router.get("/", authenticate, authorize("admin"), emailLogControllers.getEmailLogs);

module.exports = router;

