import db from "../../../utils/db";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import validator from "validator";
import { sendEmail } from "../../../utils/sendEmails";

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email template for OTP verification
const otpEmailTemplate = (otp) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #009934;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 5px 5px;
        }
        .otp-box {
          background-color: white;
          border: 2px solid #009934;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .otp-code {
          font-size: 32px;
          font-weight: bold;
          color: #009934;
          letter-spacing: 5px;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Mã Xác Nhận Đăng Ký</h1>
        </div>
        <div class="content">
          <p>Xin chào,</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại Eco Bắc Giang.</p>
          <p>Vui lòng sử dụng mã OTP sau để xác nhận email của bạn:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p>Mã OTP này có hiệu lực trong <strong>10 phút</strong>.</p>
          <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
          <div class="footer">
            <p>Trân trọng,<br>Đội ngũ EcoBacGiang</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    console.log("Starting registration process...");

    const { name, email, password, conf_password, phone, agree } = req.body;

    // Validation
    if (!name || !email || !phone || !password || !conf_password) {
      return res.status(400).json({ message: "Vui lòng điền hết các trường." });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Địa chỉ email không hợp lệ." });
    }
    if (password !== conf_password) {
      return res.status(400).json({ message: "Mật khẩu không khớp." });
    }
    if (agree !== true) {
      return res.status(400).json({
        message: "Bạn phải đồng ý với Điều khoản & Chính sách bảo mật.",
      });
    }
    if (!/^\d{10,11}$/.test(phone)) {
      return res.status(400).json({
        message: "Số điện thoại không hợp lệ (10-11 chữ số).",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu phải có ít nhất 6 ký tự.",
      });
    }

    await db.connectDb();
    console.log("DB connected");

    // Check if email or phone already exists
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Địa chỉ email đã tồn tại." });
    }
    if (await User.findOne({ phone })) {
      return res.status(400).json({ message: "Số điện thoại đã được đăng ký." });
    }

    // Hash password
    const cryptedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new User({
      name,
      email,
      phone,
      password: cryptedPassword,
      agree,
    });
    const addedUser = await newUser.save();
    console.log("User added to the database");

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    addedUser.emailVerificationOTP = otp;
    addedUser.emailVerificationOTPExpiry = otpExpiry;
    addedUser.emailVerificationSentAt = new Date();
    await addedUser.save();

    // Send email with OTP
    try {
      await sendEmail(
        email,
        "",
        "",
        "Mã Xác Nhận Đăng Ký - EcoBacGiang",
        otpEmailTemplate(otp)
      );
    } catch (emailError) {
      console.error("Error sending email:", emailError);
    }

    return res.status(200).json({
      message: "Đăng ký thành công! Mã xác nhận đã được gửi đến email của bạn.",
    });
  } catch (error) {
    console.error("Error:", error.stack || error.message);
    return res.status(500).json({
      message: "Đã xảy ra lỗi trong quá trình đăng ký.",
    });
  }
}
