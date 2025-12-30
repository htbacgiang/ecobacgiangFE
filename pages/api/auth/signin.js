import db from "../../../utils/db";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await db.connectDb();

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Vui lòng điền đầy đủ email và mật khẩu.",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({
        message: "Email hoặc mật khẩu không đúng.",
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(400).json({
        message:
          "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để kích hoạt tài khoản.",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Email hoặc mật khẩu không đúng.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "fallback-secret-key-for-development",
      {
        expiresIn: "30d",
      }
    );

    // Prepare user data (exclude password)
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      image: user.image,
      emailVerified: user.emailVerified,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
    };

    return res.status(200).json({
      status: true,
      message: "Đăng nhập thành công.",
      user: userData,
      token: token,
    });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi đăng nhập.",
    });
  }
}
