# API Bài viết – Trường `isFeatured`

FE đã gửi trường **Bài viết nổi bật** khi tạo/cập nhật bài viết.

## Yêu cầu với Backend (Server API)

- **Endpoint**: `POST /posts`, `PUT /posts/:id`
- **FormData**: FE gửi thêm field `isFeatured` với giá trị chuỗi `"true"` hoặc `"false"`.
- Backend cần:
  1. Đọc `isFeatured` từ body (FormData).
  2. Lưu vào model Post (ví dụ: `isFeatured: Boolean`, mặc định `false`).
  3. Trả về post (GET/POST/PUT) có field `isFeatured` để FE hiển thị và sửa.

## Ví dụ

- Tạo bài: `formData.append("isFeatured", "true")` hoặc `"false"`.
- Cập nhật bài: tương tự.
- Response post object nên có: `{ ..., isFeatured: true | false }`.
