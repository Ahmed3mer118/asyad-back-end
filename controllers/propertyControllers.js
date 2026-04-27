const Property = require("../models/Property.model");
const logger = require("../utils/logger.util");

const trimTrailingSlash = (value = "") => String(value).replace(/\/+$/, "");

const resolvePublicBaseUrl = (req) => {
  // Use configured public API domain first to avoid saving localhost URLs.
  if (process.env.PUBLIC_BASE_URL) {
    return trimTrailingSlash(process.env.PUBLIC_BASE_URL);
  }

  // Fallback to request host (works for same-domain deployments).
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.headers["x-forwarded-host"] || req.get("host");
  return trimTrailingSlash(`${protocol}://${host}`);
};

const toStoredImagePath = (rawUrl) => {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) return rawUrl;
  const value = rawUrl.trim();

  // Keep already-relative uploads path.
  if (value.startsWith("/uploads/")) return value;

  // Convert absolute URLs that include /uploads/... to stored relative path.
  const uploadsMatch = value.match(/\/uploads\/[^?#]+/i);
  if (uploadsMatch) return uploadsMatch[0];

  return value;
};

const normalizeImages = (images) => {
  if (!Array.isArray(images)) return [];
  const normalized = images
    .map((img, idx) => {
      if (!img) return null;
      if (typeof img === "string") {
        return { url: toStoredImagePath(img), isMain: idx === 0, order: idx };
      }
      const url = toStoredImagePath(img.url || img.path);
      if (!url) return null;
      return {
        url,
        isMain: Boolean(img.isMain),
        order: Number.isFinite(Number(img.order)) ? Number(img.order) : idx
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.order - b.order)
    .map((img, idx) => ({ ...img, order: idx }));

  if (!normalized.length) return normalized;
  const hasMain = normalized.some((img) => img.isMain);
  if (!hasMain) normalized[0].isMain = true;
  if (hasMain) {
    let found = false;
    for (const img of normalized) {
      if (img.isMain && !found) {
        found = true;
      } else {
        img.isMain = false;
      }
    }
  }
  return normalized;
};

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

    const normalizedImages = normalizeImages(images);

    const property = await Property.create({
      name,
      description,
      price,
      statusSaleRent,
      availability: availability || "available",
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

exports.getPropertiesForAdmin = async (req, res) => {
  try {
    const {
      city,
      minPrice,
      maxPrice,
      bedrooms,
      statusSaleRent,
      availability,
      category,
      isActive,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (city) query["location.city"] = city;
    if (statusSaleRent) query.statusSaleRent = statusSaleRent;
    if (availability) query.availability = availability;
    if (category) query.category = category;
    if (typeof isActive !== "undefined") query.isActive = String(isActive) === "true";
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
    logger.error("Error fetching admin properties", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Error fetching properties" });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = /^[a-f\d]{24}$/i.test(String(id));
    const query = isObjectId ? { _id: id } : { slug: id };
    const property = await Property.findOne(query);

    if (!property || !property.isActive) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({ message: "Property fetched successfully", data: property });
  } catch (error) {
    logger.error("Error fetching property by id", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Error fetching property" });
  }
};

exports.getPropertyBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const property = await Property.findOne({ slug });

    if (!property || !property.isActive) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({ message: "Property fetched successfully", data: property });
  } catch (error) {
    logger.error("Error fetching property by slug", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Error fetching property" });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (Array.isArray(updates.images)) {
      updates.images = normalizeImages(updates.images);
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

exports.uploadPropertyImages = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);
    if (!property || !property.isActive) {
      return res.status(404).json({ message: "Property not found" });
    }

    const files = Array.isArray(req.files) ? req.files : [];
    if (!files.length) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploaded = files.map((file, idx) => ({
      url: `/uploads/${file.filename}`,
      isMain: false,
      order: (property.images?.length || 0) + idx
    }));

    property.images = [...(property.images || []), ...uploaded];
    property.images = normalizeImages(property.images);
    await property.save();

    logger.info("Property images uploaded", {
      propertyId: property._id,
      count: uploaded.length
    });

    return res.status(201).json({
      message: "Property images uploaded successfully",
      data: { images: uploaded }
    });
  } catch (error) {
    logger.error("Error uploading property images", { error: error.message, stack: error.stack });
    return res.status(500).json({ message: "Error uploading property images" });
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

exports.activateProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    logger.info("Property activated", { propertyId: property._id });

    res.status(200).json({ message: "Property activated successfully", data: property });
  } catch (error) {
    logger.error("Error activating property", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Error activating property" });
  }
};

