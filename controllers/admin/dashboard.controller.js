const Degree = require("../../models/degree.model");
const Account = require("../../models/account.model");

// [GET] /admin/dashboard
module.exports.index = async (req, res) => {
  try {
    // Đếm số lượng admin
    const totalAdmins = await Account.countDocuments({ 
      deleted: false,
      status: { $in: ["active", "inactive"] },
    });

    // Đếm số lượng admin hoạt động
    const activeAdmins = await Account.countDocuments({ 
      deleted: false, 
      status: "active",
    });

    // Đếm số lượng admin dừng hoạt động
    const inactiveAdmins = await Account.countDocuments({ 
      deleted: false, 
      status: "inactive",
    });

    // Render dữ liệu ra view
    res.render("admin/pages/dashboard", {
      pageTitle: "Tổng quan",
      totalAdmins,
      activeAdmins,
      inactiveAdmins,
      user: res.locals.user, // User từ middleware
      role: res.locals.role, // Role từ middleware
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin tổng quan:", error);
    res.status(500).send("Có lỗi xảy ra, vui lòng thử lại sau.");
  }
};