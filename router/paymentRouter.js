const express = require("express");
const router = express.Router();

const paymentControllers = require("../controllers/paymentControllers");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.post("/", authenticate, authorize("admin", "employee"), paymentControllers.createPayment);
router.get("/", authenticate, authorize("admin", "employee"), paymentControllers.getPayments);

module.exports = router;

