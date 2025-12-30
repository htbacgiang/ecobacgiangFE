import db from "../../../utils/db";
import User from "../../../models/User";
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
    await db.connectDb();

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Vui lòng cung cấp email." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        message: "Email không tồn tại trong hệ thống.",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email đã được xác nhận trước đó.",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpiry = otpExpiry;
    user.emailVerificationSentAt = new Date();
    await user.save();

    // Send email
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
      status: true,
      message: "Mã OTP mới đã được gửi đến email của bạn.",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi gửi lại mã OTP.",
    });
  }
}
