const express = require("express");
const router = express.Router();

const favoriteControllers = require("../controllers/favoriteControllers");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.post("/", authenticate, authorize("user", "owner"), favoriteControllers.addFavorite);
router.get("/me", authenticate, authorize("user", "owner"), favoriteControllers.getMyFavorites);
router.delete("/:propertyId", authenticate, authorize("user", "owner"), favoriteControllers.removeFavorite);

module.exports = router;

