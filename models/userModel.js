const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Role = require("./Role.model");

const userSchema = new mongoose.Schema({
    userName: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Admin', 'User', 'Owner', 'Tenant', 'Employee'],
        default: 'User'
    },
    phone_number: {
        type: String
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
      },
    address: [String],

    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String
    },
    resetCode: {
        type: String
    },
    resetCodeExpires: {
        type: Date
    }
,  isActive: {
    type: Boolean,
    default: true
  }
}, {
    timestamps: true
});


userSchema.pre("save", async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


userSchema.methods.correctPassword = async function (inputPassword) {
    return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
