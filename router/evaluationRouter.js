const express = require("express");
const router = express.Router();

const evaluationControllers = require("../controllers/evaluationControllers");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.post("/", authenticate, authorize("user", "owner", "admin"), evaluationControllers.createEvaluation);
router.get("/", authenticate, authorize("admin", "employee"), evaluationControllers.getEvaluations);

module.exports = router;

