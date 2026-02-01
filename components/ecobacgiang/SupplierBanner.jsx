"use client";

import Image from "next/image";
import Link from "next/link";

const BANNER_BG = "/images/banner-5.webp";
// Ảnh minh họa (nếu bạn lưu trong thư mục "iamges" thì đổi lại thành "/iamges/app-eco.webp")
const ILLUSTRATION = "/images/app-eco.webp";

export default function SupplierBanner() {
  return (
    <section
      className="relative w-full h-screen overflow-hidden bg-no-repeat bg-center bg-cover py-6"
      style={{
        backgroundImage: `url('${BANNER_BG}')`,
      }}
    >
      <div className="container mx-auto relative z-10 h-full flex flex-col lg:flex-row gap-6 lg:gap-8 px-4 py-10 lg:py-12 min-h-[420px]">
        {/* Phần trái: ảnh minh họa (điện thoại + cửa hàng) */}
        <div className="flex-shrink-0 w-full lg:max-w-[55%] flex justify-center order-2 lg:order-1 mt-4 md:mt-0">
          <div className="relative w-full max-w-3xl min-h-[340px] aspect-[4/3] lg:aspect-[4/3] lg:min-h-[460px] lg:w-[600px]">
            <Image
              src={ILLUSTRATION}
              alt="Mua nông sản sạch trực tiếp từ Eco Bắc Giang"
              fill
              className="object-contain object-center"
              sizes="(max-width: 1024px) 100vw, 600px"
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Phần phải: nội dung + CTA - căn giữa theo chiều dọc */}
        <div className="w-full lg:max-w-[45%] flex flex-col justify-center lg:min-h-full text-center lg:text-left order-1 lg:order-2 lg:pl-6">
          <div className="lg:border-l-4 lg:border-green-500 lg:pl-6 rounded-sm">
            <p className="text-sm sm:text-base font-semibold uppercase tracking-widest text-green-600 mb-3">
              Mua trực tiếp từ nông trại
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-gray-900 leading-[1.12] tracking-tight mb-1.5">
              Nông sản sạch,
            </h2>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-gray-800 leading-[1.12] tracking-tight mb-1 md:mb-4">
              tươi ngon mỗi ngày
            </h2>
            <h2
              className="text-3xl sm:text-4xl lg:text-[2.9rem] md:py-2 py-0 font-bold leading-tight mb-2"
              style={{
                background: "linear-gradient(90deg, #16a34a 0%, #059669 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Eco Bắc Giang
            </h2>
         
          </div>

          <ul className="space-y-4 py-5">
            <li className="flex items-center gap-4 text-gray-700 text-base sm:text-lg font-medium">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center ring-1 ring-green-500/20">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              Nông sản hữu cơ, nguồn gốc rõ ràng
            </li>
            <li className="flex items-center gap-4 text-gray-700 text-base sm:text-lg font-medium">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center ring-1 ring-green-500/20">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              Giao hàng tận nơi, tươi mới mỗi ngày
            </li>
            <li className="flex items-center gap-4 text-gray-700 text-base sm:text-lg font-medium">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center ring-1 ring-green-500/20">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              Đặt hàng đơn giản, thanh toán an toàn
            </li>
          </ul>

          <Link
            href="/san-pham"
            className="group inline-flex items-center justify-center gap-2 text-white font-semibold text-base sm:text-lg rounded-xl px-8 py-3.5 sm:py-4 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(90deg, #16a34a 0%, #059669 100%)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(90deg, #15803d 0%, #047857 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(90deg, #16a34a 0%, #059669 100%)";
            }}
          >
            Mua sắm ngay
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
