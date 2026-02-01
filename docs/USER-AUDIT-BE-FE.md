# Kiểm tra tổng thể – User (BE + FE) & File không còn dùng

## BACKEND (ecobacgiangBE-main)

### File liên quan user – ĐANG DÙNG

| File | Vai trò |
|------|--------|
| **routes/auth.js** | Đăng ký, đăng nhập, xác nhận OTP, quên/đặt lại/đổi mật khẩu. Gửi email OTP (dùng `utils/sendEmails.js`). Mount: `/api/auth`, `/auth`. |
| **routes/user.js** | GET /user (admin), GET /user/me, GET /user/:userId, PUT /user/:userId, DELETE. Mount: `/api/user`. |
| **models/User.js** | Schema user (email, password, role, address, …). Được auth, user, subscription, … dùng. |
| **middleware/auth.js** | `withAuth`, `optionalAuth` – verify JWT, gắn `req.userId`, `req.user`. Được user, address, orders, wishlist, … dùng. |
| **utils/sendEmails.js** | Gửi email (nodemailer). Được `routes/auth.js` và `routes/subscription.js` dùng. |
| **routes/subscription.js** | Đăng ký/hủy nhận tin, gửi email thông báo cho admin. Mount: `/api/subscription`. |

### BE – Không có file user/auth nào bị bỏ dùng

Tất cả route trong `server.js` đều được mount và dùng (auth, user, products, cart, …).

---

## FRONTEND (ecobacgiangFE-main)

### File liên quan user – ĐANG DÙNG

| File | Vai trò |
|------|--------|
| **pages/dang-nhap.jsx** | Trang đăng nhập (BE + Google). `getSession` trong getServerSideProps. |
| **pages/dang-ky.jsx** | Trang đăng ký → gọi BE signup, chuyển xac-nhan-email. |
| **pages/xac-nhan-email.jsx** | Nhập OTP xác nhận email (BE verify-email-otp, resend-email-otp). |
| **pages/quen-mat-khau.jsx** | Gửi OTP quên mật khẩu (BE forgot-password). |
| **pages/dat-lai-mat-khau.jsx** | Đặt lại mật khẩu bằng OTP (BE reset-password). |
| **pages/doi-mat-khau.jsx** | Đổi mật khẩu khi đã đăng nhập (BE change-password). |
| **pages/tai-khoan/index.js** | Trang tài khoản: thông tin, đơn hàng, địa chỉ, đổi mật khẩu. Dùng useAuth, userService, signOut (auth-helper). |
| **pages/lich-su/index.js** | Lịch sử đơn hàng. getSession trong getServerSideProps. |
| **pages/checkout/index.js** | Giỏ hàng & thanh toán. useAuth, userService.getById. |
| **pages/cai-dat.jsx** | Cài đặt admin. useAuth. |
| **pages/loi-dang-nhap.jsx** | Trang lỗi đăng nhập (NextAuth). |
| **pages/api/auth/[...nextauth].js** | NextAuth (Credentials + Google). Dùng `models/User.js`, `utils/db.js`, `lib/mongodb.js`. |
| **components/users/*** | ChangePassword, AddressesTab, OrdersTab, ListOrders, UserSidebar, … Dùng useAuth, userService, addressService. |
| **components/header/UserDropdown.jsx** | Menu user, đăng xuất (auth-helper signOut). |
| **components/header/Navbar.jsx**, **ResponsiveNavbar.jsx**, **NavbarMobile.jsx** | useAuth, sync cart. |
| **components/admin/layout/Slidebar.jsx** | Admin sidebar, đăng xuất (auth-helper). |
| **hooks/useAuth.ts** | Nguồn auth thống nhất: user từ BE token (localStorage) hoặc NextAuth session. |
| **lib/auth-helper.js** | signInWithApiServer, signOut, getCurrentUser, getAuthToken. |
| **lib/api-services.js** | authService, userService (gọi BE /auth/*, /user/*). |
| **lib/api-client.js** | Gọi BE, gắn Bearer token từ localStorage. |
| **models/User.js** | NextAuth dùng (trong `pages/api/auth/[...nextauth].js`). |
| **utils/db.js** | NextAuth `[...nextauth].js` dùng. |
| **lib/mongodb.js** | NextAuth MongoDBAdapter dùng. |

---

## FRONTEND – File KHÔNG còn dùng (liên quan user/auth/email)

### 1. **pages/activate.jsx**

- **Lý do:** Gọi BE `POST /auth/activate` với `token`. BE không có route `/auth/activate` (đã chuyển sang OTP: verify-email-otp).
- **Hành động:** Xóa hoặc redirect `/activate` → `/xac-nhan-email`.

### 2. **emails/activateEmailTemplate.js**

- **Lý do:** Template email kích hoạt (link). Chỉ được **utils/sendEmails.js** (FE) import; FE không còn route/API nào gửi email kích hoạt (BE gửi OTP từ BE).
- **Hành động:** Có thể xóa (kèm xóa/điều chỉnh `utils/sendEmails.js` nếu không dùng gì khác).

### 3. **emails/resetEmailTemplate.js**

- **Lý do:** Template email reset mật khẩu (link). Không được import ở FE; BE dùng OTP và template trong BE.
- **Hành động:** Có thể xóa.

### 4. **emails/subscriptionEmailTemplate.js**

- **Lý do:** Template “Đăng ký nhận bản tin thành công”. Không được import ở FE; BE subscription gửi thông báo admin bằng template trong BE.
- **Hành động:** Có thể xóa.

### 5. **utils/sendEmails.js** (FE)

- **Lý do:** Gửi email từ FE (nodemailer), import `activateEmailTemplate`. Không có trang hay API route nào trên FE gọi `sendEmails`/`sendEmail` (đăng ký/quên mật khẩu đều gửi từ BE).
- **Hành động:** Có thể xóa (sau khi xóa hoặc không còn dùng `activateEmailTemplate`).

### 6. **utils/tokens.js** (FE)

- **Lý do:** `createActivationToken`, `createResetToken` (JWT) cho flow kích hoạt/reset bằng **link**. Hiện tại không thấy file nào import `tokens.js` (flow đã chuyển sang OTP trên BE).
- **Hành động:** Có thể xóa nếu đã xác nhận không còn reference.

---

## Tóm tắt – File đã xóa (FE) ✓

| # | File | Trạng thái |
|---|------|------------|
| 1 | **pages/activate.jsx** | Đã xóa |
| 2 | **emails/activateEmailTemplate.js** | Đã xóa |
| 3 | **emails/resetEmailTemplate.js** | Đã xóa |
| 4 | **emails/subscriptionEmailTemplate.js** | Đã xóa |
| 5 | **utils/sendEmails.js** | Đã xóa |
| 6 | **utils/tokens.js** | Đã xóa |

Nếu cần giữ URL `/activate` có thể tạo lại trang đơn giản redirect sang `/xac-nhan-email`.

---

## BE – Không có file user/auth bị bỏ dùng

Mọi file liên quan user (routes, model, middleware, sendEmails) đều đang được dùng.
