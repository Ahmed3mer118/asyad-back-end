const Favorite = require("../models/Favorite.model");
const catchAsync = require("../utils/catch-async.util");
const AppError = require("../utils/app-error.util");

exports.addFavorite = catchAsync(async (req, res, next) => {
  const { propertyId } = req.body;
  if (!propertyId) return next(new AppError("propertyId is required", 400));

  const fav = await Favorite.create({ customerId: req.user._id, propertyId });
  res.status(201).json({ message: "Added to favorites", data: fav });
});

exports.getMyFavorites = catchAsync(async (req, res) => {
  const favs = await Favorite.find({ customerId: req.user._id })
    .sort({ createdAt: -1 })
    .populate("propertyId");
  res.status(200).json({ message: "Favorites fetched", data: favs });
});

exports.removeFavorite = catchAsync(async (req, res) => {
  const { propertyId } = req.params;
  await Favorite.deleteOne({ customerId: req.user._id, propertyId });
  res.status(204).send();
});

