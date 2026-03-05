const express = require("express");
const router = express.Router();

const paymentMethodControllers = require("../controllers/paymentMethodControllers");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.get("/", paymentMethodControllers.getPaymentMethods);
router.post("/", authenticate, authorize("admin"), paymentMethodControllers.createPaymentMethod);
router.patch("/:id", authenticate, authorize("admin"), paymentMethodControllers.updatePaymentMethod);
router.delete("/:id", authenticate, authorize("admin"), paymentMethodControllers.deletePaymentMethod);

module.exports = router;

