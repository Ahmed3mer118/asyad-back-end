const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true }
  },
  { timestamps: true }
);

favoriteSchema.index({ customerId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);

