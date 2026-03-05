const Property = require("../models/Property.model");
const logger = require("../utils/logger.util");

exports.createProperty = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      statusSaleRent,
      availability,
      propertyType,
      area,
      features,
      category,
      ownerId,
      details,
      location,
      images
    } = req.body;

    const finalOwnerId = ownerId || req.user._id;

    const normalizedImages = Array.isArray(images)
      ? images.map((img, idx) => {
          if (!img) return null;
          if (typeof img === "string") return { url: img, isMain: idx === 0 };
          return { url: img.url, isMain: Boolean(img.isMain) };
        }).filter(Boolean)
      : [];

    const property = await Property.create({
      name,
      description,
      price,
      statusSaleRent,
      availability,
      propertyType,
      area,
      features,
      category,
      ownerId: finalOwnerId,
      details,
      location,
      images: normalizedImages
    });

    logger.info("Property created", {
      propertyId: property._id,
      ownerId: property.ownerId
    });

    res.status(201).json({ message: "Property created", data: property });
  } catch (error) {
    logger.error("Error creating property", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Error creating property" });
  }
};

exports.getProperties = async (req, res) => {
  try {
    const {
      city,
      minPrice,
      maxPrice,
      bedrooms,
      statusSaleRent,
      availability,
      category,
      page = 1,
      limit = 10
    } = req.query;

    const query = { isActive: true };

    if (city) query["location.city"] = city;
    if (statusSaleRent) query.statusSaleRent = statusSaleRent;
    if (availability) query.availability = availability;
    if (category) query.category = category;
    if (bedrooms) query["details.bedrooms"] = Number(bedrooms);
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [properties, total] = await Promise.all([
      Property.find(query).skip(skip).limit(Number(limit)),
      Property.countDocuments(query)
    ]);

    res.status(200).json({
      message: "Properties fetched successfully",
      data: properties,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error("Error fetching properties", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Error fetching properties" });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);

    if (!property || !property.isActive) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({ message: "Property fetched successfully", data: property });
  } catch (error) {
    logger.error("Error fetching property by id", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Error fetching property" });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (Array.isArray(updates.images)) {
      updates.images = updates.images
        .map((img, idx) => {
          if (!img) return null;
          if (typeof img === "string") return { url: img, isMain: idx === 0 };
          return { url: img.url, isMain: Boolean(img.isMain) };
        })
        .filter(Boolean);
    }

    const property = await Property.findByIdAndUpdate(id, updates, { new: true });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    logger.info("Property updated", { propertyId: property._id });

    res.status(200).json({ message: "Property updated successfully", data: property });
  } catch (error) {
    logger.error("Error updating property", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Error updating property" });
  }
};

exports.deactivateProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    logger.info("Property deactivated", { propertyId: property._id });

    res.status(200).json({ message: "Property deactivated successfully", data: property });
  } catch (error) {
    logger.error("Error deactivating property", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Error deactivating property" });
  }
};

