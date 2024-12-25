const Degree = require("../../models/degree.model");
const filterHelper = require("../../helpers/filter.helper");
const paginationHelper = require("../../helpers/pagination.helper");
const systemConfig = require("../../config/system");
const moment = require("moment"); // Thư viện để xử lý ngày tháng

// [GET] admin/degrees
module.exports.index = async (req, res) => {

    const degrees = await Degree.find();

    res.render("admin/pages/degrees/index", {
        pageTitle: "Thông tin bằng cấp",
        degrees: degrees
    })
}

// [GET] admin/degrees/create
module.exports.create = async (req, res) => {
    res.render('admin/pages/degrees/create', {
        pageTitle: "Tạo Mới Bằng Cấp",
    });
};

// [POST] admin/degrees/create
module.exports.createPost = async (req, res) => {
    try {
        const { degreeCode, fullName, unit, program, issueDate } = req.body;
        console.log(req.body);

        // Kiểm tra nếu thiếu trường
        if (!degreeCode || !fullName || !unit || !program || !issueDate) {
            req.flash("error", "Vui lòng nhập đầy đủ thông tin.");
            return res.redirect(`/${systemConfig.prefixAdmin}/degrees/create`);
        }

        // // Chuyển đổi issueDate từ DD/MM/YYYY sang Date
        // const formattedIssueDate = moment(issueDate, "DD/MM/YYYY").toDate();

        // // Kiểm tra nếu ngày không hợp lệ
        // if (!formattedIssueDate.isValid()) {
        //     req.flash("error", "Ngày cấp không hợp lệ.");
        //     return res.redirect(`/${systemConfig.prefixAdmin}/degrees/create`);
        // }

        // Thêm mới vào cơ sở dữ liệu
        await Degree.create({ degreeCode, fullName, unit, program, issueDate });
        req.flash("success", "Tạo bằng cấp thành công!");
        res.redirect(`/${systemConfig.prefixAdmin}/degrees`);
    } catch (error) {
        console.error("Lỗi khi tạo bằng cấp:", error);
        req.flash("error", "Đã xảy ra lỗi, vui lòng thử lại.");
        res.redirect(`/${systemConfig.prefixAdmin}/degrees/create`);
    }
};

// [GET] /admin/degrees/edit/:id
module.exports.edit = async (req, res) => {
    try {
     const id = req.params.id;
   
     const degree = await Degree.findOne({
       _id: id
     });
   
      // có thông tin vào sản phẩm product thì trả nó ra ngoài giao diện qua res.render
       res.render("admin/pages/degrees/edit", {
       pageTitle: "Chỉnh sửa sản phẩm",
       degree: degree
     });
    } catch (error) {
       req.flash("error", "Không thấy chứng chỉ này");
       res.redirect(`/${systemConfig.prefixAdmin}/degrees/`);
    }
   }

   // [PATCH] /admin/degrees/edit/:id
   module.exports.editPatch = async (req, res) => {
       try {
           console.log(req.body);
           const { degreeCode, fullName, unit, program, issueDate } = req.body;
           const id = req.params.id;
   
           // Kiểm tra nếu thiếu bất kỳ trường nào
           if (!degreeCode || !fullName || !unit || !program || !issueDate) {
               req.flash("error", "Vui lòng nhập đầy đủ thông tin.");
               return res.redirect(`/${systemConfig.prefixAdmin}/degrees/edit/${id}`);
           }
   
           // Chuyển đổi issueDate từ DD/MM/YYYY sang Date
        //    đây là đoạn code dùng để chuyển đổi ngày tháng từ chuỗi sang kiểu Date khi nhập chuỗi từ bên phía front
        //    const formattedIssueDate = moment(issueDate, "DD/MM/YYYY", true);
        //    if (!formattedIssueDate.isValid()) {
        //        req.flash("error", "Ngày cấp không hợp lệ. Định dạng phải là DD/MM/YYYY.");
        //        return res.redirect(`/${systemConfig.prefixAdmin}/degrees/edit/${id}`);
        //    }
   
           // Cập nhật dữ liệu trong cơ sở dữ liệu
           await Degree.findByIdAndUpdate(id, {
               degreeCode,
               fullName,
               unit,
               program,
               issueDate: formattedIssueDate.toDate(),
           });
   
           req.flash("success", "Cập nhật chứng chỉ thành công!");
           res.redirect(`/${systemConfig.prefixAdmin}/degrees/`);
       } catch (error) {
           console.error("Lỗi khi cập nhật chứng chỉ:", error);
           req.flash("error", "Có lỗi xảy ra, vui lòng thử lại.");
           res.redirect(`/${systemConfig.prefixAdmin}/degrees/edit/${req.params.id}`);
       }
   };
   

  // [DELETE] /admin/degrees/delete/:id
  module.exports.deleteDegree = async (req, res) => {
    // const id = req.params.id;

    // await Product.deleteOne({
    //     _id: id
    // })

    // req.flash('success', 'Xoá chứng chỉ thành công!');

    // res.redirect("back");
    try {
        const id = req.params.id;
        await Degree.findByIdAndDelete(id);
        req.flash('success', `Xóa chứng chỉ thành công`);
        res.redirect(`/${systemConfig.prefixAdmin}/degrees`);
    } catch (error) {
        req.flash('error', 'Xóa chứng chỉ thất bại');
        res.redirect(`/${systemConfig.prefixAdmin}/degrees`);
    }
};
  