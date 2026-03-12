const express = require("express");
const router = express.Router();

const favoriteControllers = require("../controllers/favoriteControllers");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.post("/", authenticate, authorize("user", "owner"), favoriteControllers.addFavorite);
router.get("/me", authenticate, authorize("user", "owner"), favoriteControllers.getMyFavorites);
router.get("/popular", favoriteControllers.getPopularByFavorites);
router.get("/long-standing", authenticate, authorize("admin"), favoriteControllers.getLongStandingFavorites);
router.get("/stats/:propertyId", favoriteControllers.getPropertyFavoriteStats);
router.get("/favorited-by/:propertyId", authenticate, authorize("admin"), favoriteControllers.getFavoritedByUsers);
router.delete("/:propertyId", authenticate, authorize("user", "owner"), favoriteControllers.removeFavorite);

module.exports = router;

