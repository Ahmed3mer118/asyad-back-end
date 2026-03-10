const express = require("express");
const router = express.Router();

const paymentControllers = require("../controllers/paymentControllers");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.post("/", authenticate, paymentControllers.createPayment);
router.get("/me", authenticate, paymentControllers.getMyPayments);
router.get("/", authenticate, paymentControllers.getPayments);

module.exports = router;

