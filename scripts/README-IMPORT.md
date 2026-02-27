# Hướng dẫn Import Sản phẩm từ JSON qua Backend (BE)

## File đã tạo

1. **`sample-products.json`** - File chứa 24 sản phẩm mẫu:
   - 5 sản phẩm Rau ăn lá
   - 6 sản phẩm Củ - quả
   - 6 sản phẩm Thực phẩm khô
   - 6 sản phẩm Sản phẩm OCOP

2. **`scripts/import-products.js`** - Script gọi **BE API** (POST /api/products) để import sản phẩm. Không dùng MongoDB/model trực tiếp từ FE.

## Cách sử dụng

### Cách 1: Sử dụng script tự động (Khuyến nghị)

1. Đảm bảo **Backend (ecobacgiangBE)** đang chạy.

2. Cấu hình biến môi trường (trong `.env` hoặc `.env.local`):
   - `API_SERVER_URL` hoặc `NEXT_PUBLIC_API_SERVER_URL` (ví dụ: `http://localhost:5000/api`)
   - (Tùy chọn) `API_ADMIN_TOKEN` hoặc `TOKEN` nếu BE yêu cầu auth cho POST /products

3. Chạy script:
```bash
node scripts/import-products.js
```

4. Script sẽ:
   - Đọc file `sample-products.json`
   - Gửi từng sản phẩm lên BE qua POST `/api/products`
   - Bỏ qua sản phẩm đã tồn tại (BE trả 400)
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
- `giaGoc` (optional): Giá gốc (trước khuyến mãi). Hệ thống vẫn tự động đọc dữ liệu cũ ở trường `promotionalPrice` nếu có.
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

### Lỗi kết nối / Failed to fetch
- Kiểm tra Backend (ecobacgiangBE) đang chạy
- Kiểm tra `API_SERVER_URL` hoặc `NEXT_PUBLIC_API_SERVER_URL` trong `.env` (ví dụ: `http://localhost:5000/api`)

### Lỗi duplicate / đã tồn tại
- Script tự động bỏ qua sản phẩm trùng (BE trả 400)
- Nếu muốn import lại, xóa sản phẩm cũ trên BE hoặc thay đổi `maSanPham`/`slug` trong JSON

### Lỗi validation
- Kiểm tra tất cả các trường required đã có
- Kiểm tra format dữ liệu (số, boolean, string)
- Kiểm tra `unit` phải là một trong: "Kg", "gam", "túi", "chai"

