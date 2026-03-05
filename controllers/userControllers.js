const Users = require("../models/userModel");
const logger = require("../utils/logger.util");

exports.getUsers = async (req, res) => {
  try {
    const showData = await Users.find();

    logger.info("Admin fetched all users", {
      adminId: req.user?.id,
      count: showData?.length
    });

    return res.status(200).json({ message: "User retrieved successfully.", data: showData });
  } catch (error) {
    logger.error("Error while getting users", { error: error.message, stack: error.stack });
    return res.status(500).json({ error: "Server error while getting User." });
  }
};

exports.getUsersById = async (req, res) => {
  try {
    const id = req.user._id;
    const user = await Users.findById(id).select('-password -verificationCode -resetCode -resetCodeExpires');

    if (!user) {
      logger.warn("User not found when fetching by id", { requestedUserId: id });
      return res.status(404).json({ error: "User not found." });
    }

    logger.info("User fetched own profile", { userId: user.id });

    return res.status(200).json({
      message: "User retrieved successfully.",
      data: user
    });
  } catch (error) {
    logger.error("Error while getting user by id", { error: error.message, stack: error.stack });
    return res.status(500).json({
      error: "Server error while getting user."
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const id = req.user._id;
    const { userName, phone_number, address } = req.body;

    const user = await Users.findById(id);

    if (!user) {
      logger.warn("User not found when updating profile", { requestedUserId: id });
      return res.status(404).json({ error: "User not found." });
    }

    // Only allow updating specific fields
    const updateData = {};
    if (userName) updateData.userName = userName;
    if (phone_number) updateData.phone_number = phone_number;
    if (address) updateData.address = address;
    console.log("updateData", updateData);
    const updatedUser = await Users.findByIdAndUpdate(id, updateData, { new: true }).select('-password -verificationCode -resetCode -resetCodeExpires');

    logger.info("User updated own profile", { userId: updatedUser.id });

    return res.status(200).json({
      message: "Profile updated successfully.",
      data: updatedUser
    });
  } catch (error) {
    logger.error("Error while updating user profile", { error: error.message, stack: error.stack });
    return res.status(500).json({
      error: "Server error while updating profile."
    });
  }
};

exports.adminUpdateUserStatus = async (req, res) => {
  try {
    const { id, email } = req.body;
    let query = {};

    if (id) {
      query._id = id;
    } else if (email) {
      query.email = email;
    } else {
      return res.status(400).json({ error: "User ID or Email is required." });
    }

    const user = await Users.findOne(query);

    if (!user) {
      logger.warn("User not found when updating status", { query });
      return res.status(404).json({ error: "User not found." });
    }

    // Toggle isActive status
    user.isActive = !user.isActive;
    await user.save();

    const updatedUser = await Users.findById(user._id).select('-password -verificationCode -resetCode -resetCodeExpires');

    logger.info("Admin updated user status", {
      adminId: req.user?._id,
      targetUserId: updatedUser.id,
      newStatus: updatedUser.isActive
    });

    return res.status(200).json({
      message: `User ${updatedUser.isActive ? "activated" : "deactivated"} successfully.`,
      data: updatedUser
    });
  } catch (error) {
    logger.error("Error while updating user status by admin", { error: error.message, stack: error.stack });
    return res.status(500).json({
      error: "Server error while updating user status."
    });
  }
};