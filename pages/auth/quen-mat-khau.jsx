import { useState } from "react";
import Head from "next/head";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/router";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authService } from "../../lib/api-services";
import Link from "next/link";

// Schema xác thực với Yup
const forgotPasswordValidation = Yup.object({
  email: Yup.string()
    .required("Vui lòng nhập địa chỉ email.")
    .email("Vui lòng nhập địa chỉ email hợp lệ."),
});

export default function ForgotPassword() {
  const router = useRouter();
  const [status, setStatus] = useState("");

  const initialValues = {
    email: "",
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setStatus("Đang gửi mã OTP...");
    setSubmitting(true);

    try {
      const result = await authService.forgotPassword(values.email.toLowerCase().trim());
      
      setStatus("Mã OTP đã được gửi!");
      toast.success(result.message || "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.");
      
      // Chuyển đến trang đặt lại mật khẩu với email
      setTimeout(() => {
        router.push({
          pathname: "/auth/dat-lai-mat-khau",
          query: { email: values.email.toLowerCase().trim() },
        });
      }, 2000);
    } catch (error) {
      setStatus(`Lỗi: ${error.message || "Đã xảy ra lỗi khi gửi mã OTP"}`);
      toast.error(error.message || "Đã xảy ra lỗi khi gửi mã OTP");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Quên mật khẩu - Eco Bắc Giang | Eco Coffee</title>
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
          {/* Forgot Password Card */}
          <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md relative z-10 opacity-90">
            {/* Back Button */}
            <Link
              href="/dang-nhap"
              className="inline-flex items-center text-white hover:text-orange-500 transition-colors mb-4"
            >
              <FaArrowLeft className="mr-2" />
              <span>Quay lại đăng nhập</span>
            </Link>

            <h2 className="text-3xl font-bold text-white text-center mb-4">
              Quên Mật Khẩu
            </h2>

            <p className="text-gray-300 text-center mb-6">
              Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
            </p>

            <Formik
              enableReinitialize
              initialValues={initialValues}
              validationSchema={forgotPasswordValidation}
              validateOnChange={true}
              validateOnBlur={true}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  {/* Email */}
                  <div className="relative">
                    <label htmlFor="email" className="block text-white text-sm mb-2">
                      Email <span className="text-orange-500">*</span>
                    </label>
                    <div className="flex items-center border border-gray-600 rounded-lg bg-gray-800 gap-4">
                      <span className="pl-3 text-orange-500">
                        <FaEnvelope />
                      </span>
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Nhập email của bạn"
                        required
                      />
                    </div>
                    <ErrorMessage
                      name="email"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Status Message */}
                  {status && (
                    <p
                      className={`text-center ${
                        status.includes("thành công") || status.includes("đã được gửi")
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
                    disabled={isSubmitting || status === "Đang gửi mã OTP..."}
                    className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Đang gửi..." : "Gửi mã OTP"}
                  </button>
                </Form>
              )}
            </Formik>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm mb-2">
                Mã OTP sẽ được gửi đến email của bạn
              </p>
              <p className="text-gray-400 text-xs">
                Vui lòng kiểm tra hộp thư đến và thư mục spam
              </p>
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
