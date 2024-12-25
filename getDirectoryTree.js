const fs = require('fs');
const path = require('path');

// Hàm xây dựng cây thư mục
function buildJsFileTree(dirPath) {
    const result = {};

    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            // Bỏ qua thư mục không cần thiết
            if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
                result[file] = buildJsFileTree(fullPath); // Đệ quy
            }
        } else if (path.extname(fullPath) === '.js') {
            result[file] = null; // File .js là lá trong cây
        }
    });

    return result;
}

// Sử dụng hàm
const tree = buildJsFileTree('./'); // Thay './' bằng thư mục bạn muốn quét
console.log(JSON.stringify(tree, null, 2)); // Hiển thị cấu trúc cây dạng JSON
