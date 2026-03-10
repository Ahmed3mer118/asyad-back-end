const express = require("express");
const router = express.Router();

const installmentControllers = require("../controllers/installmentControllers");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.post("/", authenticate, authorize("admin", "employee"), installmentControllers.createInstallment);
router.post("/generate", authenticate, authorize("admin", "employee"), installmentControllers.generateInstallments);
router.get("/me", authenticate, installmentControllers.getMyInstallments);
router.get("/", authenticate, installmentControllers.getInstallments);
router.patch("/:id", authenticate, authorize("admin", "employee"), installmentControllers.updateInstallment);

module.exports = router;

