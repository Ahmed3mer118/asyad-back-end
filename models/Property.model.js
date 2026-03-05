const mongoose = require("mongoose");

const detailsSchema = new mongoose.Schema(
  {
    bedrooms: Number,
    bathrooms: Number,
    area: Number,
    furnished: Boolean
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    country: String,
    city: String,
    address: String,
    latitude: Number,
    longitude: Number
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    statusSaleRent: {
      type: String,
      enum: ["rent", "sale"],
      required: true
    },
    availability: {
      type: String,
      enum: ["available", "sold"],
      default: "available"
    },
    propertyType: { type: String },
    area: { type: Number },
    price: { type: Number, required: true },
    features: { type: String },
    category: {
      type: String,
      enum: ["residential", "commercial", "industrial"],
      default: "residential"
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    details: detailsSchema,
    location: locationSchema,
    images: [
      {
        url: { type: String, required: true },
        isMain: { type: Boolean, default: false }
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

propertySchema.pre("validate", function (next) {
  if (!this.name && this.title) this.name = this.title;
  next();
});

module.exports = mongoose.model("Property", propertySchema);

