import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authService } from "../lib/api-services";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";

export default function VerifyEmail() {
  const router = useRouter();
  const { email } = router.query;
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const otpInputs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto focus first input on mount
  useEffect(() => {
    if (otpInputs.current[0]) {
      otpInputs.current[0].focus();
    }
  }, []);

  // Redirect if no email
  useEffect(() => {
    if (router.isReady && !email) {
      toast.error("Không tìm thấy email. Vui lòng đăng ký lại.");
      setTimeout(() => {
        router.push("/dang-ky");
      }, 2000);
    }
  }, [router, router.isReady, email]);

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

  const handleVerify = async () => {
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      toast.error("Vui lòng nhập đầy đủ 6 số OTP");
      return;
    }

    if (!email) {
      toast.error("Không tìm thấy email. Vui lòng đăng ký lại.");
      return;
    }

    try {
      setLoading(true);
      const result = await authService.verifyEmailOTP(
        email.toLowerCase().trim(),
        otpCode
      );
      
      toast.success(result.message || "Xác nhận email thành công!");
      
      setTimeout(() => {
        router.push("/dang-nhap");
      }, 2000);
    } catch (error) {
      console.error("Verify OTP error:", error);
      toast.error(error.message || "Mã OTP không đúng. Vui lòng thử lại.");
      
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      if (otpInputs.current[0]) {
        otpInputs.current[0].focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error("Không tìm thấy email. Vui lòng đăng ký lại.");
      return;
    }

    try {
      setResendLoading(true);
      const result = await authService.resendEmailOTP(email.toLowerCase().trim());
      
      toast.success(result.message || "Mã OTP mới đã được gửi đến email của bạn.");
      
      // Reset countdown
      setCountdown(60);
      setCanResend(false);
      
      // Clear OTP inputs
      setOtp(["", "", "", "", "", ""]);
      if (otpInputs.current[0]) {
        otpInputs.current[0].focus();
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error(error.message || "Đã xảy ra lỗi khi gửi lại mã OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />

      <section
        className="min-h-screen flex items-center justify-center relative"
        style={{
          backgroundImage: `url('/dang-ky.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-70"></div>

        <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md relative z-10 opacity-90">
          {/* Back Button */}
          <Link
            href="/dang-ky"
            className="inline-flex items-center text-white hover:text-orange-500 transition-colors mb-4"
          >
            <FaArrowLeft className="mr-2" />
            <span>Quay lại đăng ký</span>
          </Link>

          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Xác nhận Email
          </h2>

          <p className="text-gray-300 text-center mb-6">
            Chúng tôi đã gửi mã xác nhận đến email của bạn
          </p>

          {/* Email Display */}
          {email && (
            <div className="flex items-center justify-center mb-6 p-3 bg-gray-800 rounded-lg">
              <FaEnvelope className="text-orange-500 mr-2" />
              <span className="text-white text-sm">{email}</span>
            </div>
          )}

          {/* OTP Inputs */}
          <div className="mb-6">
            <label className="block text-white text-sm mb-3 text-center">
              Nhập mã OTP (6 số)
            </label>
            <div className="flex justify-center gap-3">
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
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || otp.join("").length !== 6}
            className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {loading ? "Đang xác nhận..." : "Xác nhận"}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-orange-500 hover:text-orange-400 transition-colors disabled:opacity-50"
              >
                {resendLoading ? "Đang gửi..." : "Gửi lại mã OTP"}
              </button>
            ) : (
              <p className="text-gray-400 text-sm">
                Gửi lại mã sau {countdown}s
              </p>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-2">
              Không nhận được mã OTP?
            </p>
            <p className="text-gray-400 text-xs">
              Vui lòng kiểm tra thư mục spam hoặc thử lại sau
            </p>
          </div>

          {/* Link to Login */}
          <div className="text-center mt-6">
            <span className="pr-2 text-white text-sm">Đã có tài khoản?</span>
            <Link
              href="/dang-nhap"
              className="text-orange-500 text-sm hover:text-orange-400 transition-colors"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

