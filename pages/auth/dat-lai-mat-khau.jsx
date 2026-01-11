import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/router";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authService } from "../../lib/api-services";
import Link from "next/link";

// Schema xác thực với Yup
const resetPasswordValidation = Yup.object({
  otp: Yup.string()
    .required("Vui lòng nhập mã OTP.")
    .length(6, "Mã OTP phải có 6 số."),
  newPassword: Yup.string()
    .required("Vui lòng nhập mật khẩu mới.")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
  confirmPassword: Yup.string()
    .required("Vui lòng xác nhận mật khẩu.")
    .oneOf([Yup.ref("newPassword"), null], "Mật khẩu xác nhận không khớp."),
});

export default function ResetPassword() {
  const router = useRouter();
  const { email } = router.query;
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const otpInputs = useRef([]);

  // Auto focus first input on mount
  useEffect(() => {
    if (otpInputs.current[0]) {
      otpInputs.current[0].focus();
    }
  }, []);

  // Redirect if no email
  useEffect(() => {
    if (router.isReady && !email) {
      toast.error("Không tìm thấy email. Vui lòng thử lại.");
      setTimeout(() => {
        router.push("/auth/quen-mat-khau");
      }, 2000);
    }
  }, [router.isReady, email]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleOtpChange = (value, index) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    // Limit to 1 digit
    if (value.length > 1) {
      value = value.slice(0, 1);
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      const newOtp = [...otp];
      digits.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus last input
      if (otpInputs.current[5]) {
        otpInputs.current[5].focus();
      }
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      toast.error("Vui lòng nhập đầy đủ 6 số OTP");
      return;
    }

    if (!email) {
      toast.error("Không tìm thấy email. Vui lòng thử lại.");
      return;
    }

    setStatus("Đang đặt lại mật khẩu...");
    setSubmitting(true);

    try {
      const result = await authService.resetPassword(
        email.toLowerCase().trim(),
        otpCode,
        values.newPassword,
        values.confirmPassword
      );
      
      setStatus("Đặt lại mật khẩu thành công!");
      toast.success(result.message || "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.");
      
      // Chuyển đến trang đăng nhập
      setTimeout(() => {
        router.push("/dang-nhap");
      }, 2000);
    } catch (error) {
      setStatus(`Lỗi: ${error.message || "Đã xảy ra lỗi khi đặt lại mật khẩu"}`);
      toast.error(error.message || "Đã xảy ra lỗi khi đặt lại mật khẩu");
      
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      if (otpInputs.current[0]) {
        otpInputs.current[0].focus();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = {
    otp: "",
    newPassword: "",
    confirmPassword: "",
  };

  return (
    <>
      <Head>
        <title>Đặt lại mật khẩu - Eco Bắc Giang | Eco Coffee</title>
        <meta
          name="description"
          content="Đặt lại mật khẩu cho tài khoản Eco Bắc Giang của bạn."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" href="/favicon.ico" />
        <meta httpEquiv="content-language" content="vi" />
      </Head>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />

      <div
        className="min-h-screen flex items-center justify-center relative"
        style={{
          backgroundImage: `url('/dang-ky.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-70"></div>

        {/* Main Container */}
        <div className="relative z-10 w-full max-w-md mx-4">
          {/* Reset Password Card */}
          <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md relative z-10 opacity-90">
            {/* Back Button */}
            <Link
              href="/auth/quen-mat-khau"
              className="inline-flex items-center text-white hover:text-orange-500 transition-colors mb-4"
            >
              <FaArrowLeft className="mr-2" />
              <span>Quay lại</span>
            </Link>

            <h2 className="text-3xl font-bold text-white text-center mb-4">
              Đặt Lại Mật Khẩu
            </h2>

            <p className="text-gray-300 text-center mb-6">
              Nhập mã OTP và mật khẩu mới của bạn
            </p>

            {/* Email Display */}
            {email && (
              <div className="flex items-center justify-center mb-6 p-3 bg-gray-800 rounded-lg">
                <FaEnvelope className="text-orange-500 mr-2" />
                <span className="text-white text-sm">{email}</span>
              </div>
            )}

            <Formik
              enableReinitialize
              initialValues={initialValues}
              validationSchema={resetPasswordValidation}
              validateOnChange={true}
              validateOnBlur={true}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  {/* OTP Input */}
                  <div>
                    <label className="block text-white text-sm mb-3 text-center">
                      Mã OTP (6 số) <span className="text-orange-500">*</span>
                    </label>
                    <div className="flex justify-center gap-3 mb-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpInputs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(e.target.value, index)}
                          onKeyDown={(e) => handleOtpKeyPress(e, index)}
                          onPaste={index === 0 ? handlePaste : undefined}
                          onFocus={() => setFocusedIndex(index)}
                          className={`w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 transition-colors ${
                            focusedIndex === index
                              ? "border-orange-500 bg-gray-800 text-white"
                              : "border-gray-600 bg-gray-800 text-white"
                          } focus:outline-none focus:ring-2 focus:ring-orange-500`}
                        />
                      ))}
                    </div>
                    {otp.join("").length !== 6 && (
                      <p className="text-red-500 text-sm text-center mt-1">
                        Vui lòng nhập đầy đủ 6 số OTP
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="relative">
                    <label htmlFor="newPassword" className="block text-white text-sm mb-2">
                      Mật khẩu mới <span className="text-orange-500">*</span>
                    </label>
                    <div className="flex items-center border border-gray-600 rounded-lg bg-gray-800 gap-4">
                      <span className="pl-3 text-orange-500">
                        <FaLock />
                      </span>
                      <Field
                        id="newPassword"
                        name="newPassword"
                        type={showPassword ? "text" : "password"}
                        className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Nhập mật khẩu mới"
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="pr-3 text-gray-400 hover:text-white"
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <ErrorMessage
                      name="newPassword"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <label htmlFor="confirmPassword" className="block text-white text-sm mb-2">
                      Xác nhận mật khẩu <span className="text-orange-500">*</span>
                    </label>
                    <div className="flex items-center border border-gray-600 rounded-lg bg-gray-800 gap-4">
                      <span className="pl-3 text-orange-500">
                        <FaLock />
                      </span>
                      <Field
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Xác nhận mật khẩu mới"
                        required
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="pr-3 text-gray-400 hover:text-white"
                        aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <ErrorMessage
                      name="confirmPassword"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Status Message */}
                  {status && (
                    <p
                      className={`text-center ${
                        status.includes("thành công")
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {status}
                    </p>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || status === "Đang đặt lại mật khẩu..." || otp.join("").length !== 6}
                    className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                  </button>
                </Form>
              )}
            </Formik>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm mb-2">
                Không nhận được mã OTP?
              </p>
              <Link
                href="/auth/quen-mat-khau"
                className="text-orange-500 text-sm hover:text-orange-400 transition-colors"
              >
                Gửi lại mã OTP
              </Link>
            </div>

            {/* Link to Login */}
            <div className="text-center mt-6">
              <span className="pr-2 text-white text-sm">Nhớ mật khẩu?</span>
              <Link
                href="/dang-nhap"
                className="text-orange-500 text-sm hover:text-orange-400 transition-colors"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
