# Hướng dẫn Import Sản phẩm từ JSON vào Database

## File đã tạo

1. **`sample-products.json`** - File chứa 24 sản phẩm mẫu:
   - 5 sản phẩm Rau ăn lá
   - 6 sản phẩm Củ - quả
   - 6 sản phẩm Thực phẩm khô
   - 6 sản phẩm Sản phẩm OCOP

2. **`scripts/import-products.js`** - Script để import sản phẩm vào MongoDB

## Cách sử dụng

### Cách 1: Sử dụng script tự động (Khuyến nghị)

1. Đảm bảo MongoDB đang chạy và có biến môi trường `MONGODB_URI` được cấu hình

2. Chạy script:
```bash
node scripts/import-products.js
```

3. Script sẽ:
   - Kết nối đến MongoDB
   - Đọc file `sample-products.json`
   - Kiểm tra sản phẩm đã tồn tại (theo `maSanPham` hoặc `slug`)
   - Import các sản phẩm mới
   - Hiển thị kết quả và lỗi (nếu có)

### Cách 2: Import thủ công qua MongoDB Compass

1. Mở MongoDB Compass
2. Kết nối đến database của bạn
3. Chọn collection `products`
4. Click "Import Data"
5. Chọn file `sample-products.json`
6. Chọn format: JSON
7. Click "Import"

### Cách 3: Sử dụng MongoDB CLI (mongoimport)

```bash
mongoimport --uri="mongodb://localhost:27017/your-database-name" \
  --collection=products \
  --file=sample-products.json \
  --jsonArray
```

## Lưu ý

- Script sẽ tự động bỏ qua các sản phẩm đã tồn tại (dựa trên `maSanPham` hoặc `slug`)
- Nếu muốn import lại, bạn có thể:
  1. Xóa các sản phẩm cũ trong database
  2. Hoặc thay đổi `maSanPham` và `slug` trong file JSON

## Cấu trúc dữ liệu

Mỗi sản phẩm trong file JSON có các trường:

- `maSanPham` (required, unique): Mã sản phẩm
- `name` (required): Tên sản phẩm
- `price` (required): Giá sản phẩm
- `promotionalPrice` (optional): Giá khuyến mãi
- `category` (required): Mã danh mục (ví dụ: "rau-an-la")
- `categoryNameVN` (required): Tên danh mục tiếng Việt (ví dụ: "Rau ăn lá")
- `description` (required): Mô tả sản phẩm
- `image` (required): Mảng các URL ảnh
- `slug` (required, unique): Slug cho URL
- `unit` (required): Đơn vị (Kg, gam, túi, chai)
- `rating` (optional): Đánh giá (0-5)
- `reviewCount` (optional): Số lượng đánh giá
- `stockStatus` (optional): Trạng thái tồn kho ("Còn hàng" hoặc "Hết hàng")
- `isFeatured` (optional): Sản phẩm nổi bật (true/false)
- `isNew` (optional): Sản phẩm mới (true/false)
- `content` (optional): Nội dung HTML chi tiết

## Kiểm tra sau khi import

Sau khi import thành công, bạn có thể kiểm tra:

1. Truy cập trang chủ để xem các slide card sản phẩm theo danh mục
2. Kiểm tra trong MongoDB Compass hoặc database client
3. Test API: `GET /api/products` để xem danh sách sản phẩm

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra MongoDB đang chạy
- Kiểm tra `MONGODB_URI` trong file `.env`
- Kiểm tra quyền truy cập database

### Lỗi duplicate key
- Script tự động bỏ qua sản phẩm trùng lặp
- Nếu muốn import lại, xóa sản phẩm cũ hoặc thay đổi `maSanPham`/`slug`

### Lỗi validation
- Kiểm tra tất cả các trường required đã có
- Kiểm tra format dữ liệu (số, boolean, string)
- Kiểm tra `unit` phải là một trong: "Kg", "gam", "túi", "chai"

