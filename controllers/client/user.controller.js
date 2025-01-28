const md5 = require("md5");
const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password.model");
const generateHelper = require("../../helpers/generate.helper");
const sendEmailHelper = require("../../helpers/sendEmail.helper");

// [GET] /user/register
module.exports.register = async (req, res) => {
    res.render("client/pages/user/register", {
        pageTitle: "Đăng ký tài khoản",
    });
}

// [POST] /user/register
module.exports.registerPost = async (req, res) => {
    // kiểm tra đã tồn tại email chưa
    const existUser = await User.findOne({
        email: req.body.email,
        deleted: false,
    });

    if(existUser) {
        req.flash("error", "Email đã tồn tại");
        res.redirect("back");
        return;
    }

    const userInfo = {
        fullName: req.body.fullName,
        email: req.body.email,
        password: md5(req.body.password),
        tokenUser: generateHelper.generateRandomString(30),
    }

    const user = new User(userInfo);
    await user.save();
    
    res.cookie("tokenUser", user.tokenUser);

    res.redirect("/");
}

// [GET] /user/login
module.exports.login = async (req, res) => {
    res.render("client/pages/user/login", {
        pageTitle: "Đăng nhập tài khoản",
    });
}

// [POST] /user/login
module.exports.loginPost = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({
        email: email,
        deleted: false,
    });

    if(!user) {
        req.flash("error", "Email không tồn tại!");
        res.redirect("back");
        return;
    }

    if(md5(password) != user.password) {
        req.flash("error", "Sai mật khẩu");
        res.redirect("back");
        return;
    }

    if(user.status != "active") {
        req.flash("error", "Tài khoản đang bị khoá");
        res.redirect("back");
        return;
    }

    res.cookie("tokenUser", user.tokenUser);

    req.flash("success", "Đăng nhập thành công");

    res.redirect("/");
}

// [GET] /user/logout
module.exports.logout = async (req, res) => {
    res.clearCookie("tokenUser");
    req.flash("success", "Đã đăng xuất");
    res.redirect("/");
}

// [GET] /user/password/forgot
module.exports.forgotPassword = async (req, res) => {
    res.render("client/pages/user/forgot-password", {
        pageTitle: "Lấy lại mật khẩu",
    });
}

// [POST] /user/password/forgot
module.exports.forgotPasswordPost = async (req, res) => {
    const email = req.body.email;

    // Kiểm tra email đã tồn tại chưa
    const user = await User.findOne({
        email: email,
        deleted: false,
    });

    if(!user) {
        req.flash("error", "Email không tồn tại!");
        res.redirect("back");
        return;
    }

    // Bước 1: Tạo mã OTP và lưu vào database
    // tạo chuỗi OTP gồm 6 số
    const otp = generateHelper.generateRandomNumber(6);
    const objectForgotPassword = {
        email: email,
        otp: otp,
        // 3*60*1000 là 3 phút đc quy ra đơn vị
        expireAt: Date.now() + 3*60*1000,
    };
    console.log(objectForgotPassword);
    
    const forgotPassword = new ForgotPassword(objectForgotPassword);
    await forgotPassword.save();

    // Bước 2: Gửi mã OTP qua email
    const subject = "Password Reset OTP Verification";
    const text = `Kính gửi ${user.fullName},

    Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Vui lòng sử dụng Mã Xác Nhận (OTP) sau để xác minh danh tính và hoàn tất quá trình đặt lại mật khẩu:

    Mã OTP: ${otp}

    Mã OTP này chỉ có hiệu lực trong một khoảng thời gian ngắn, vì vậy bạn vui lòng sử dụng ngay lập tức. Nếu bạn không yêu cầu đặt lại mật khẩu, xin vui lòng bỏ qua email này.

    Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua:  
    - Số điện thoại: 028 7308 7007  
    - Email: khoahoctre@gmail.com  

    Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.

    Trân trọng,  
    Trung tâm TST`;
    sendEmailHelper.sendEmail(email, subject, text);

    // xử dụng query ?email=${email} để biết mã otp nhập dành cho email nào
    res.redirect(`/user/password/otp?email=${email}`);
}

// [GET] /user/password/otp
module.exports.otpPassword = async (req, res) => {
    const email = req.query.email;

    res.render("client/pages/user/otp-password", {
        pageTitle: "Nhập mã OTP",
        email: email,
    });
}

// [POST] /user/password/otp
module.exports.otpPasswordPost = async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;

    const result = await ForgotPassword.findOne({
        email: email,
        otp: otp,
    });

    if(!result) {
        req.flash("error", "Mã OTP không hợp lệ");
        res.redirect("back");
        return;
    }
    
    const user = await User.findOne({
        email: email,
    });

    // trả về token user cho người dùng
    res.cookie('tokenUser', user.tokenUser, { 
        expires: new Date(Date.now() + 86400000), // Thời gian hết hạn, ở đây là 1 ngày sau khi cookie được thiết lập
        httpOnly: true // Tùy chọn khác, có thể thêm tùy ý, httpOnly là một tùy chọn khác mà bạn có thể thêm vào để chỉ định rằng cookie chỉ được truy cập thông qua giao thức HTTP và không thể truy cập từ mã JavaScript trên trình duyệt.
    });

    res.redirect("/user/password/reset");
}

// [GET] /user/password/reset
module.exports.resetPassword = async (req, res) => {

    res.render("client/pages/user/reset-password", {
        pageTitle: "Đổi mật khẩu",
    });
}

// [POST] /user/password/reset
module.exports.resetPasswordPost = async (req, res) => {
    const tokenUser = req.cookies.tokenUser;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if(password != confirmPassword) {
        req.flash("error", "Mật khẩu không khớp");
        res.redirect("back");
        return;
    }

    await User.updateOne({
        tokenUser: tokenUser,
    }, {
        password: md5(password),
    });

    req.flash("success", "Đổi mật khẩu thành công");
    res.redirect("/");
};

// [GET] /user/info
module.exports.info = async (req, res) => {
    const infoUser = await User.findOne({
        tokenUser: req.cookies.tokenUser,
        deleted: false,
    }).select("-password");

    res.render("client/pages/user/info", {
        pageTitle: "Thông tin tài khoản",
        infoUser: infoUser,
    })
}