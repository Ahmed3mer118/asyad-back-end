const User = require("../models/userModel");
const Role = require("../models/Role.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catch-async.util");
const AppError = require("../utils/app-error.util");
const { sendEmail } = require("../utils/sendEmail");
const logger = require("../utils/logger.util");

exports.register = (role) => {
  return catchAsync(async (req, res, next) => {
    const { username, email, password, phoneNumber } = req.body;
    const rawRole = (req.body.role || "user").toString();
    const roleMap = {
      admin: "Admin",
      user: "User",
      owner: "Owner",
      employee: "Employee"
    };
    const requestedRole = roleMap[rawRole.toLowerCase()] || rawRole;

    const allowedRoles = ["Admin", "User", "Owner", "Employee"];
    if (!allowedRoles.includes(requestedRole)) {
      return next(new AppError(`Invalid role. Allowed: ${allowedRoles.join(", ")}`, 400));
    }
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: "Email already in used" })
    }
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    // const hashedPassword = await bcrypt.hash(password, 10);

    const roleName = requestedRole;
    const roleDoc = await Role.findOne({ name: roleName });

    if (!roleDoc) {
      return next(new AppError("Role not configured in database", 500));
    }
    await sendEmail({
      to: email,
      subject: "Your Verification Code",
      message: `Your verification code is: ${verificationCode}`
    });

    const user = await User.create({
      userName: username,
      email,
      password,
      phone_number: phoneNumber,
      role: requestedRole,
      roleId: roleDoc._id,
      verificationCode
    });
 
    logger.info("User registered successfully", {
      userId: user.id,
      email: user.email,
      role: user.role
    });
 
    res.status(201).json({ message: "user created", user })
  }

  )
}

exports.verifyEmail = async (req, res, next) => {
  const { email, code } = req.body
  const user = await User.findOne({ email })
  if (!user || user.verificationCode !== code) {
    logger.warn("Invalid verification code attempt", { email });
    return res.status(400).json({ message: "Invalid Code" })
    // return next(new AppError("Invalid verification code", 400));
  }
  user.isVerified = true;
  user.verificationCode = null;
  await user.save();
  logger.info("Email verified successfully", { userId: user.id, email: user.email });
  res.status(200).json({ message: "Email verified successfully" });
}

const signToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password, phoneNumber } = req.body;

    if ((!email && !phoneNumber) || !password) {
      return res.status(400).json({
        error: "Email or phone number and password are required."
      });
    }
    const query = email
      ? { email }
      : { phone_number: phoneNumber };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({
        error: "Invalid Email or Password User"
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        error: "Please verify your email first"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid Email or Password"
      });
    }

    const token = signToken(user);

    return res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      error: "Unexpected error during login."
    });
  }
};

exports.forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new AppError("User not found", 404));

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetCode = resetCode;
  user.resetCodeExpires = Date.now() + 10 * 60 * 1000;

  await sendEmail({
    to: user.email,
    subject: "Password Reset Code",
    message: `Use this code to reset your password: ${resetCode}`
  });

  await user.save();
  logger.info("Password reset code generated and sent", { userId: user.id, email: user.email });
  res.status(200).json({ message: "Reset code sent to email" });
};
exports.resetPassword = async (req, res, next) => {
  try {

    const { email, resetCode, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError("No user found with this email", 404));
    }
    if (!user.resetCode || String(user.resetCode) !== String(resetCode)) {
      return res.status(400).json({ error: "Reset Code Is Invalid" });
    }
    if (Date.now() > user.resetCodeExpires) {
      return res.status(400).json({ error: "Invalid or expired reset code" });
    }

    user.password = newPassword;
    user.resetCode = null;
    user.resetCodeExpires = null;
    await user.save();
 
    logger.info("Password reset successful", { userId: user.id, email: user.email });
    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    next(err)
  }
};




