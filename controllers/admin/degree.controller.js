const Degree = require("../../models/degree.model");
const Account = require("../../models/account.model");
const paginationHelper = require("../../helpers/pagination.helper");
const systemConfig = require("../../config/system");
const moment = require("moment"); // Thư viện để xử lý ngày tháng

// [GET] admin/degrees
module.exports.index = async (req, res) => {
    try {
        // Lấy các query tìm kiếm
        const searchQuery = req.query.search?.trim() || ""; // Họ tên
        const degreeCodeQuery = req.query.degreeCode?.trim() || ""; // Số Quyết định
        const issueDateQuery = req.query.issueDate?.trim() || ""; // Ngày cấp

        const searchConditions = {};

        // Tìm theo họ tên
        if (searchQuery) {
            searchConditions.fullName = new RegExp(searchQuery, 'i');
        }

        // Tìm theo số quyết định
        if (degreeCodeQuery) {
            searchConditions.degreeCode = new RegExp(degreeCodeQuery, 'i');
        }

        // Tìm theo ngày cấp
        if (issueDateQuery) {
            const startDate = new Date(issueDateQuery); // Đầu ngày
            const endDate = new Date(issueDateQuery);
            endDate.setUTCHours(23, 59, 59, 999); // Cuối ngày

            searchConditions.issueDate = {
                $gte: startDate,
                $lte: endDate
            };
        }

        // Đếm số lượng kết quả
        const countRecords = await Degree.countDocuments(searchConditions);

        // Pagination (Phân trang)
        let objectPagination = {};
        if (countRecords > 0) {
            objectPagination = paginationHelper(req, countRecords);
        }

        // Lấy dữ liệu từ MongoDB
        const degrees = await Degree
            .find(searchConditions)
            .limit(objectPagination.limitItems)
            .skip(objectPagination.skip)
            .sort({ _id: "desc" });

        // hiển thị người tạo sản phẩm
        for (const degree of degrees) {
            const createdBy = await Account.findOne({
            _id: degree.createdBy,
            });
            
            // if và 2 toán tử 3 ngôi chức năng giống nhau, mình ghi ra để nhớ các trường hợp
            // if(createdBy) {
            //   product.createdByFullName = createdBy.fullName;
            // };

            // product.createdByFullName = createdBy?.fullName;

            createdBy ? degree.createdByFullName = createdBy.fullName : null;
        }
        // End hiển thị người tạo sản phẩm

        // hiển thị người cập nhật sản phẩm
        for (const degree of degrees) {
            const updatedBy = await Account.findOne({
            _id: degree.updatedBy,
            });

            updatedBy ? degree.updatedByFullName = updatedBy.fullName : null;
        }
        // End hiển thị người cập nhật phẩm

        // Render dữ liệu ra view
        res.render("admin/pages/degrees/index", {
            pageTitle: "Thông tin bằng cấp",
            degrees,
            searchQuery,
            degreeCodeQuery,
            issueDateQuery,
            objectPagination
        });
    } catch (error) {
        console.error("Lỗi khi tìm kiếm bằng cấp:", error);
        res.status(500).send("Có lỗi xảy ra, vui lòng thử lại sau.");
    }
};



// module.exports.index = async (req, res) => {

//     const degrees = await Degree.find();

//     res.render("admin/pages/degrees/index", {
//         pageTitle: "Thông tin bằng cấp",
//         degrees: degrees
//     })
// }

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

        // Kiểm tra nếu thiếu trường
        if (!degreeCode || !fullName || !unit || !program || !issueDate) {
            req.flash("error", "Vui lòng nhập đầy đủ thông tin.");
            return res.redirect(`/${systemConfig.prefixAdmin}/degrees/create`);
        }

        // Thêm người tạo
        const createdBy = res.locals.user.id;

        // // Chuyển đổi issueDate từ DD/MM/YYYY sang Date
        // const formattedIssueDate = moment(issueDate, "DD/MM/YYYY").toDate();

        // // Kiểm tra nếu ngày không hợp lệ
        // if (!formattedIssueDate.isValid()) {
        //     req.flash("error", "Ngày cấp không hợp lệ.");
        //     return res.redirect(`/${systemConfig.prefixAdmin}/degrees/create`);
        // }

        // Thêm mới vào cơ sở dữ liệu
        await Degree.create({ degreeCode, fullName, unit, program, issueDate, createdBy });
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
            const { degreeCode, fullName, unit, program, issueDate, } = req.body;
            const id = req.params.id;
   
            // Kiểm tra nếu thiếu bất kỳ trường nào
            if (!degreeCode || !fullName || !unit || !program || !issueDate) {
                req.flash("error", "Vui lòng nhập đầy đủ thông tin.");
                return res.redirect(`/${systemConfig.prefixAdmin}/degrees/edit/${id}`);
            }

            // Thêm người sửa
            const updatedBy = res.locals.user.id;
   
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
               issueDate,
               updatedBy
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
}

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const excelJS = require('exceljs');


// Thiết lập cấu hình lưu trữ cho Multer (upload file)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

const upload = multer({ storage: storage });

// [GET] /admin/degrees/import-database
module.exports.importDatabase = async (req, res) => {
    res.render('admin/pages/degrees/importDatabase', {
        title: 'Import Dữ liệu từ Excel',
        prefixAdmin: systemConfig.prefixAdmin
    });
};

// [POST] /admin/degrees/import-database
module.exports.importDatabasePost = [
    upload.single('file'), // Xử lý file upload
    async (req, res) => {
        try {
            // Kiểm tra nếu không có file được upload
            if (!req.file) {
                req.flash('error', 'Vui lòng chọn một file để import.');
                return res.redirect(`/${systemConfig.prefixAdmin}/degrees/import-database`);
            }

            // Đọc file Excel
            const workbook = new excelJS.Workbook();
            await workbook.xlsx.readFile(req.file.path);
            const worksheet = workbook.getWorksheet(1); // Lấy sheet đầu tiên
            const degrees = [];

            // Duyệt qua từng dòng trong sheet (bỏ qua header)
            worksheet.eachRow((row, rowIndex) => {
                if (rowIndex > 1) { // Bỏ qua dòng header (dòng 1)
                    const degree = {
                        degreeCode: row.getCell(1).value,
                        fullName: row.getCell(2).value,
                        unit: row.getCell(3).value,
                        program: row.getCell(4).value,
                        issueDate: new Date(row.getCell(5).value), // Convert to Date
                        createdBy: res.locals.user.id
                    };
                    degrees.push(degree);
                }
            });
            
            // Ghi dữ liệu vào MongoDB (sử dụng insertMany để chèn nhiều bản ghi)
            await Degree.insertMany(degrees);

            // Xóa file upload sau khi import xong
            fs.unlinkSync(req.file.path);

            // Thông báo thành công
            req.flash('success', 'Dữ liệu đã được import thành công!');
            res.redirect(`/${systemConfig.prefixAdmin}/degrees`); // Điều hướng về trang danh sách

        } catch (error) {
            console.error('Lỗi khi import dữ liệu:', error);
            req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại.');
            res.redirect(`/${systemConfig.prefixAdmin}/degrees/import-database`); // Trở về trang import nếu có lỗi
        }
    }
];



  