const Favorite = require("../models/Favorite.model");
const FavoriteEvent = require("../models/FavoriteEvent.model");
const catchAsync = require("../utils/catch-async.util");
const AppError = require("../utils/app-error.util");

exports.addFavorite = catchAsync(async (req, res, next) => {
  const { propertyId } = req.body;
  if (!propertyId) return next(new AppError("propertyId is required", 400));

  const existing = await Favorite.findOne({ customerId: req.user._id, propertyId });
  if (existing) {
    return res.status(200).json({ message: "Already in favorites", data: existing });
  }

  const fav = await Favorite.create({ customerId: req.user._id, propertyId });
  await FavoriteEvent.create({ customerId: req.user._id, propertyId, action: "added" });
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
  await FavoriteEvent.create({ customerId: req.user._id, propertyId, action: "removed" });
  res.status(204).send();
});

/**
 * إحصائيات المفضلة لعقار: كم مهتم حالياً، كم أضاف، كم شال
 */
exports.getPropertyFavoriteStats = catchAsync(async (req, res, next) => {
  const { propertyId } = req.params;
  const [currentCount, addedCount, removedCount] = await Promise.all([
    Favorite.countDocuments({ propertyId }),
    FavoriteEvent.countDocuments({ propertyId, action: "added" }),
    FavoriteEvent.countDocuments({ propertyId, action: "removed" })
  ]);
  res.status(200).json({
    data: {
      propertyId,
      currentFavoriteCount: currentCount,
      totalAdded: addedCount,
      totalRemoved: removedCount
    }
  });
});

/**
 * المستخدمون اللي لسه عاملين العقار في المفضلة — للتوصيات أو الإشعارات (أدمن)
 */
exports.getFavoritedByUsers = catchAsync(async (req, res, next) => {
  const { propertyId } = req.params;
  const favs = await Favorite.find({ propertyId })
    .populate("customerId", "userName email phone_number")
    .lean();
  res.status(200).json({
    data: favs.map((f) => ({
      userId: f.customerId?._id ?? f.customerId,
      userName: f.customerId?.userName,
      email: f.customerId?.email,
      phone_number: f.customerId?.phone_number,
      addedAt: f.createdAt
    }))
  });
});

/**
 * عقارات الأكثر إقبالاً (حسب عدد المفضلة) — للتحليل والترويج في الموقع
 * query: city, limit
 */
exports.getPopularByFavorites = catchAsync(async (req, res) => {
  const { city, limit = 20 } = req.query;
  const match = { isActive: true };
  if (city) match["location.city"] = new RegExp(city, "i");

  const popular = await Favorite.aggregate([
    { $match: {} },
    { $group: { _id: "$propertyId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: Math.min(100, parseInt(limit, 10) || 20) },
    {
      $lookup: {
        from: "properties",
        localField: "_id",
        foreignField: "_id",
        as: "property"
      }
    },
    { $unwind: "$property" },
    { $match: { "property.isActive": true } },
    ...(city ? [{ $match: { "property.location.city": new RegExp(city, "i") } }] : []),
    {
      $project: {
        propertyId: "$_id",
        favoriteCount: "$count",
        name: "$property.name",
        price: "$property.price",
        location: "$property.location",
        statusSaleRent: "$property.statusSaleRent",
        availability: "$property.availability"
      }
    }
  ]);

  res.status(200).json({ data: popular });
});

/**
 * مستخدمون أبقوا عقاراً في المفضلة فترة طويلة — للتوصيات أو إشعار "لا زالت مهتماً؟"
 * query: days (default 30)
 */
exports.getLongStandingFavorites = catchAsync(async (req, res) => {
  const days = Math.max(1, parseInt(req.query.days, 10) || 30);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const list = await Favorite.find({ createdAt: { $lte: since } })
    .populate("customerId", "userName email phone_number")
    .populate("propertyId", "name price location statusSaleRent availability")
    .sort({ createdAt: 1 })
    .lean();

  res.status(200).json({
    data: list.map((f) => ({
      userId: f.customerId?._id ?? f.customerId,
      userName: f.customerId?.userName,
      email: f.customerId?.email,
      propertyId: f.propertyId?._id ?? f.propertyId,
      propertyName: f.propertyId?.name,
      propertyPrice: f.propertyId?.price,
      addedAt: f.createdAt,
      daysInFavorites: Math.floor((Date.now() - new Date(f.createdAt)) / (24 * 60 * 60 * 1000))
    }))
  });
});

