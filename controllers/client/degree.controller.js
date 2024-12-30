const Degree = require("../../models/degree.model");
const paginationHelper = require("../../helpers/pagination.helper");

// [GET] /

// module.exports.search = async (req, res) => {
//     res.render("client/pages/degree/index", {
//         pageTitle: "Thông tin bằng cấp",
//         degrees: [], // Truyền mảng rỗng vì chưa tìm kiếm
//         searchQuery: "" // Chuỗi tìm kiếm trống
//     });
// };

// [GET] /

module.exports.searchDegree = async (req, res) => {
    try {
        const searchQuery = req.query.search?.trim() || ""; // Họ tên
        const degreeCodeQuery = req.query.degreeCode?.trim() || ""; // Mã bằng cấp
        const issueDateQuery = req.query.issueDate?.trim() || ""; // Ngày cấp

        

        // Nếu không có bất kỳ điều kiện nào, render kết quả rỗng
        if (!searchQuery && !degreeCodeQuery && !issueDateQuery) {
            return res.render("client/pages/degree/index", {
                pageTitle: "Thông tin bằng cấp",
                degrees: [],
                searchQuery: "",
                degreeCodeQuery: "",
                objectPagination: {}
            });
        }

        // // Điều kiện truy vấn: Cả fullName và degreeCode phải khớp
        // const searchConditions = {
        //     fullName: new RegExp(`^${searchQuery}$`, 'i'), // Khớp chính xác họ tên (không cần khoảng trắng thừa)
        //     degreeCode: new RegExp(`^${degreeCodeQuery}$`, 'i') // Khớp chính xác mã bằng cấp
        // };

    
        const searchConditions = {};

        // Tìm theo họ tên
        if (searchQuery) {
            searchConditions.fullName = new RegExp(searchQuery, 'i');
        }
        
        // Tìm theo mã bằng cấp
        if (degreeCodeQuery) {
            searchConditions.degreeCode = new RegExp(degreeCodeQuery, 'i'); 
        }

        // Xử lý tìm kiếm theo ngày cấp
        // if (issueDateQuery) {
        //     const [day, month, year] = issueDateQuery.split('/'); // Tách ngày, tháng, năm
        //     const formattedDate = new Date(`${year}-${month}-${day}`); // Chuyển thành định dạng yyyy-mm-dd

        //     if (formattedDate instanceof Date && !isNaN(formattedDate)) {
        //         searchConditions.issueDate = formattedDate; // Lọc theo ngày
        //     } else {
        //         req.flash("error", "Ngày nhập không hợp lệ, vui lòng nhập đúng định dạng dd/mm/yyyy.");
        //         return res.redirect(`/searchDegree`);
        //     }
        // }

        // Xử lý tìm kiếm theo ngày cấp
        if (issueDateQuery) {
            const startDate = new Date(issueDateQuery); // Đầu ngày
            const endDate = new Date(issueDateQuery);
            endDate.setUTCHours(23, 59, 59, 999); // Cuối ngày

            searchConditions.issueDate = {
                $gte: startDate,
                $lte: endDate
            };
        }

        // console.log("Kết quả tìm kiếm:", degrees);

        

        // Pagination (Phân trang) 
        const countRecords = await Degree.countDocuments(searchConditions);
        // Đếm các document(mỗi bảng ghi là 1 document)
        // Kiểm tra xem có kết quả tìm kiếm không, nếu có thì tính phân trang
        let objectPagination = {};
        if (countRecords > 0) {
            objectPagination = paginationHelper(req, countRecords); // Chỉ tính phân trang khi có kết quả
        }
        // End Pagination (Phân trang)
        // Truy vấn Mongodb để tìm kiếm bằng cấp 
        const degrees = await Degree
        .find(searchConditions)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip)
        .sort({ position: "desc" });
        // Nếu không tìm thấy kết quả
        if (degrees.length === 0) {
            req.flash("error", "Không tìm thấy thông tin bằng cấp khớp điều kiện tìm kiếm!");
            return res.redirect(`/searchDegree`);
        }

        // Render kết quả
        res.render("client/pages/degree/index", {
            pageTitle: "Thông tin bằng cấp",
            degrees,
            searchQuery,
            degreeCodeQuery,
            objectPagination
        });
    } catch (error) {
        console.error("Lỗi khi tìm kiếm bằng cấp:", error);
        res.status(500).send("Có lỗi xảy ra, vui lòng thử lại sau.");
    }
};

