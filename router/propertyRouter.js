const express = require("express");
const router = express.Router();
const propertyControllers = require("../controllers/propertyControllers");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.get("/", propertyControllers.getProperties);
router.get("/:id", propertyControllers.getPropertyById);

router.post(
  "/",
  authenticate,
  authorize("admin", "owner"),
  propertyControllers.createProperty
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin", "owner"),
  propertyControllers.updateProperty
);

router.patch(
  "/:id/deactivate",
  authenticate,
  authorize("admin", "owner"),
  propertyControllers.deactivateProperty
);

module.exports = router;

