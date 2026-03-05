const express = require("express");
const router = express.Router();

const transactionControllers = require("../controllers/transactionControllers");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.post("/", authenticate, authorize("admin", "employee"), transactionControllers.createTransaction);
router.get("/", authenticate, authorize("admin", "employee"), transactionControllers.getTransactions);
router.get("/:id", authenticate, authorize("admin", "employee"), transactionControllers.getTransactionById);
router.patch("/:id", authenticate, authorize("admin", "employee"), transactionControllers.updateTransaction);

module.exports = router;

