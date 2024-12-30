const ExcelJS = require('exceljs');

async function createExcelFile() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Degrees');

    // Thêm header cho bảng
    worksheet.columns = [
        { header: 'Degree Code', key: 'degreeCode', width: 20 },
        { header: 'Full Name', key: 'fullName', width: 30 },
        { header: 'Unit', key: 'unit', width: 30 },
        { header: 'Program', key: 'program', width: 30 },
        { header: 'Issue Date', key: 'issueDate', width: 15 }
    ];

    // Thêm dữ liệu mẫu
    worksheet.addRow({
        degreeCode: 'B435436',
        fullName: 'Phạm Văn W',
        unit: 'Đại học Bách Khoa',
        program: 'Kỹ thuật Cơ khí',
        issueDate: new Date('2020-07-29')
    });
    worksheet.addRow({
        degreeCode: 'B123456',
        fullName: 'Nguyễn Thị A',
        unit: 'Đại học Ngoại thương',
        program: 'Quản trị Kinh doanh',
        issueDate: new Date('2021-01-15')
    });
    worksheet.addRow({
        degreeCode: 'B654321',
        fullName: 'Lê Minh T',
        unit: 'Đại học Bách Khoa',
        program: 'Kỹ thuật Máy tính',
        issueDate: new Date('2022-03-10')
    });

    // Lưu tệp Excel
    await workbook.xlsx.writeFile('degrees.xlsx');
    console.log('Tệp Excel đã được tạo thành công!');
}

createExcelFile().catch((error) => console.error(error));