const mongoose = require("mongoose");

/**
 * سجل كل إضافة/إزالة من المفضلة — لتحليل: كم أضاف، كم شال، ومن بقي مهتم
 */
const favoriteEventSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    action: { type: String, enum: ["added", "removed"], required: true }
  },
  { timestamps: true }
);

favoriteEventSchema.index({ propertyId: 1, createdAt: -1 });
favoriteEventSchema.index({ customerId: 1, propertyId: 1, action: 1 });

module.exports = mongoose.model("FavoriteEvent", favoriteEventSchema);
