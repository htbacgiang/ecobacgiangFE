import db from "../../../utils/db";
import User from "../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await db.connectDb();

    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        message: "Vui lòng điền đầy đủ email và mã OTP.",
      });
    }

    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        message: "Email không tồn tại trong hệ thống.",
      });
    }

    // Check if email already verified
    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email đã được xác nhận trước đó.",
      });
    }

    // Check if OTP exists
    if (!user.emailVerificationOTP) {
      return res.status(400).json({
        message: "Không tìm thấy mã OTP. Vui lòng yêu cầu mã OTP mới.",
      });
    }

    // Check if OTP matches
    if (user.emailVerificationOTP !== otp) {
      return res.status(400).json({ message: "Mã OTP không đúng." });
    }

    // Check if OTP is expired
    if (
      !user.emailVerificationOTPExpiry ||
      new Date() > user.emailVerificationOTPExpiry
    ) {
      // Clear expired OTP
      user.emailVerificationOTP = undefined;
      user.emailVerificationOTPExpiry = undefined;
      await user.save();
      return res.status(400).json({
        message: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã OTP mới.",
      });
    }

    // Verify email and clear OTP
    user.emailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpiry = undefined;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Xác nhận email thành công! Bạn có thể đăng nhập ngay.",
    });
  } catch (error) {
    console.error("Verify email OTP error:", error);
    return res.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi xác nhận email.",
    });
  }
}
