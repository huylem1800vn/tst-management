const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    password: String,
    tokenUser: String,
    phone: String,
    avatar: String,
    organization: String,
    education: String,
    skills: {
      type: [String],
      default: []
    },
    networks: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      default: "active",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    dateOfBirth: { // Thêm trường ngày tháng năm sinh
      type: Date,
      required: false, // Không bắt buộc (có thể bỏ qua khi thêm user mới)
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
