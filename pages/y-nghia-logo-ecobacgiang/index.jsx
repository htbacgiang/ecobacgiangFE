import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import DefaultLayout from "../../components/layout/DefaultLayout";
import Image from "next/image";

export default function LogoMeaning() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <DefaultLayout>
      <Head>
        <title>Ý Nghĩa Logo Eco Bắc Giang | Eco Bắc Giang</title>
        <meta
          name="description"
          content="Khám phá ý nghĩa logo của Eco Bắc Giang - biểu tượng kết hợp giữa nông nghiệp hữu cơ và công nghệ cao, hướng đến phát triển bền vững."
        />
        <meta
          name="keywords"
          content="Eco Bắc Giang, ý nghĩa logo, nông nghiệp công nghệ cao, sản xuất hữu cơ, phát triển bền vững"
        />
        <meta name="author" content="Eco Bắc Giang" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="Vietnamese" />
        <meta name="revisit-after" content="7 days" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/y-nghia-logo-ecobacgiang`}
        />

        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/y-nghia-logo-ecobacgiang`}
        />
        <meta
          property="og:title"
          content="Ý Nghĩa Logo Eco Bắc Giang | Eco Bắc Giang"
        />
        <meta
          property="og:description"
          content="Khám phá ý nghĩa logo của Eco Bắc Giang - biểu tượng kết hợp giữa nông nghiệp hữu cơ và công nghệ cao, hướng đến phát triển bền vững."
        />
        <meta
          property="og:image"
          content={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/images/logo-meaning.jpg`}
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Ý nghĩa logo Eco Bắc Giang" />
        <meta property="og:locale" content="vi_VN" />
        <meta property="og:site_name" content="Eco Bắc Giang" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:url"
          content={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/y-nghia-logo-ecobacgiang`}
        />
        <meta
          name="twitter:title"
          content="Ý Nghĩa Logo Eco Bắc Giang | Eco Bắc Giang"
        />
        <meta
          name="twitter:description"
          content="Khám phá ý nghĩa logo của Eco Bắc Giang - biểu tượng kết hợp giữa nông nghiệp hữu cơ và công nghệ cao."
        />
        <meta
          name="twitter:image"
          content={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/images/logo-meaning.jpg`}
        />
        <meta name="twitter:image:alt" content="Ý nghĩa logo Eco Bắc Giang" />

        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Ý Nghĩa Logo Eco Bắc Giang",
              "description": "Khám phá ý nghĩa logo của Eco Bắc Giang - biểu tượng kết hợp giữa nông nghiệp hữu cơ và công nghệ cao",
              "url": `${process.env.NEXT_PUBLIC_BASE_URL || ''}/y-nghia-logo-ecobacgiang`,
              "mainEntity": {
                "@type": "Organization",
                "name": "Eco Bắc Giang",
                "description": "Tiên phong trong nông nghiệp hữu cơ và công nghệ cao tại Việt Nam",
                "address": {
                  "@type": "PostalAddress",
                  "addressRegion": "Bắc Giang",
                  "addressCountry": "VN"
                }
              }
            })
          }}
        />
      </Head>

      {/* Header Spacer */}
      <div className="h-[80px] bg-gradient-to-r from-green-50 to-green-100"></div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 py-16 px-6 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Section */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-base font-bold rounded-full shadow-lg hover:bg-green-700 transition-colors duration-300">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                Biểu Tượng Thương Hiệu
              </div>

              {/* Main Heading */}
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold leading-tight font-heading">
                  <span className="text-green-700">
                    Ý Nghĩa Logo {""}
                  </span>
                  <span className="text-gray-800">
                     Eco Bắc Giang
                  </span>
                </h1>
              </div>

              {/* Description */}
              <div className="space-y-6 text-base text-gray-700 leading-relaxed">
                <p className="border-l-4 border-green-600 pl-6 bg-white/50 backdrop-blur-base rounded-r-lg py-4 text-base">
                  <strong className="text-green-700 font-semibold">Khám phá biểu tượng: </strong>
                  Logo Eco Bắc Giang không chỉ là thiết kế thẩm mỹ mà còn chứa đựng thông điệp sâu sắc về sự kết hợp giữa nông nghiệp hữu cơ và công nghệ tiên tiến.
                </p>

                <p className="bg-white/70 backdrop-blur-base rounded-lg p-6 shadow-lg text-base">
                  Với slogan <strong className="text-green-700 font-semibold">&ldquo;Agriculture of Thinks&rdquo;</strong>, logo đại diện cho tầm nhìn đổi mới trong nông nghiệp, hướng tới mục tiêu Net Zero 2050 và phát triển bền vững tại Bắc Giang.
                </p>
              </div>
            </div>

            {/* Image Section */}
            <div className="relative">
              <div className="relative  overflow-hidden  transform hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                <Image
                  src="/images/logo-eco-bac-giang.png"
                  alt="Logo Eco Bắc Giang"
                  width={600}
                  height={400}
                  style={{ objectFit: "cover" }}
                  quality={90}
                  loading="lazy"
                  className=" w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="bg-white">
        {/* Ý nghĩa và thông điệp chính */}
        <div className="py-6 ">
          <div className="container mx-auto px-4 md:px-0">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Ý Nghĩa Và <span className="text-green-600">Thông Điệp</span>
              </h2>
              <p className="text-lg text-gray-600 mx-auto">
                Khám phá ý nghĩa sâu sắc đằng sau slogan &ldquo;Agriculture of Thinks&rdquo; và các yếu tố thiết kế của logo
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg border border-green-100">
                  <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Agriculture of Thinks
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Slogan này nhấn mạnh tư duy sáng tạo và đổi mới trong nông nghiệp.
                    Eco Bắc Giang không chỉ sản xuất mà còn &ldquo;suy nghĩ&rdquo; về cách ứng dụng
                    công nghệ tiên tiến để tạo ra nền nông nghiệp thông minh, bền vững.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 shadow-md border border-blue-100">
                    <h4 className="text-lg font-bold text-blue-700 mb-2 flex items-center">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      AI & IoT
                    </h4>
                    <p className="text-sm text-gray-700">Ứng dụng trí tuệ nhân tạo và Internet of Things</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 shadow-md border border-purple-100">
                    <h4 className="text-lg font-bold text-purple-700 mb-2 flex items-center">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mr-2">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Robot & Automation
                    </h4>
                    <p className="text-sm text-gray-700">Tự động hóa quy trình sản xuất nông nghiệp</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative overflow-hidden ">
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent z-10"></div>
                  <Image
                    src="/images/smart-farm.webp"
                    alt="Ý nghĩa logo Eco Bắc Giang"
                    width={600}
                    height={400}
                    style={{ objectFit: "cover" }}
                    quality={90}
                    loading="lazy"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Màu sắc và hình khối */}
        <div className="py-6">
          <div className="container mx-auto px-4 md:px-0">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Màu Sắc Và <span className="text-green-600">Hình Khối</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                  <h3 className="text-lg font-bold text-green-700 mb-3 flex items-center">
                    <div className="w-4 h-4 bg-green-600 rounded-full mr-3"></div>
                    Màu xanh lá cây (#16a34a)
                  </h3>
                  <p className="text-gray-700">
                    Đại diện cho sự phát triển bền vững và thân thiện với môi trường, màu sắc này biểu tượng
                    cho nông nghiệp hữu cơ và Net Zero 2050.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
                  <h3 className="text-lg font-bold text-orange-700 mb-3 flex items-center">
                    <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                    Màu cam (#ea580c)
                  </h3>
                  <p className="text-gray-700">
                    Tượng trưng cho sự sáng tạo, đổi mới và năng lượng tích cực. Thể hiện khát vọng
                    tiên phong trong ứng dụng công nghệ vào nông nghiệp.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                    <div className="w-4 h-4 bg-gray-800 rounded-full mr-3"></div>
                    Màu đen (#1f2937)
                  </h3>
                  <p className="text-gray-700">
                    Mang đến sự tương phản mạnh mẽ, tạo cảm giác chuyên nghiệp và hiện đại,
                    kết hợp với sự chính xác trong sứ mệnh phát triển.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="relative  overflow-hidden ">
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent z-10"></div>
                  <Image
                    src="/images/mau-logo.jpg"
                    alt="Màu sắc logo Eco Bắc Giang"
                    width={600}
                    height={400}
                    style={{ objectFit: "cover" }}
                    quality={90}
                    loading="lazy"
                    className=" w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Biểu tượng và hình học */}
        <div className="py-8 px-6">
          <div className="container mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                Biểu Tượng Và <span className="text-green-600">Hình Học</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg border border-green-100">
                  <h3 className="text-lg font-bold text-green-700 mb-3 flex items-center">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Chữ &ldquo;C&rdquo; và biểu tượng vô cực
                  </h3>
                  <p className="text-gray-700">
                    Phần chữ &ldquo;C&rdquo; trong từ &ldquo;ECO&rdquo; được tạo thành bởi hai hình tròn lồng ghép,
                    gợi liên tưởng đến biểu tượng vô cực (∞). Thể hiện tính sáng tạo không giới hạn.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg border border-blue-100">
                  <h3 className="text-lg font-bold text-blue-700 mb-3 flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Tỷ lệ vàng (Golden Ratio)
                  </h3>
                  <p className="text-gray-700">
                    Logo sử dụng tỷ lệ vàng để tạo sự cân đối và hài hòa, mang lại cảm giác
                    nhất quán và trực quan dễ chịu.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent z-10"></div>
                  <Image
                    src="/images/logo-eco.png"
                    alt="Biểu tượng logo Eco Bắc Giang"
                    width={600}
                    height={400}
                    style={{ objectFit: "cover" }}
                    quality={90}
                    loading="lazy"
                    className=" w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kết luận */}
        <div className="py-6 px-6 mb-8">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-3">
              Kết Luận
            </h2>
            <p className="text-lg text-black-100 leading-relaxed max-w-6xl mx-auto">
              Logo của Eco Bắc Giang không chỉ là biểu tượng thương hiệu mà còn truyền tải
              thông điệp mạnh mẽ về nông nghiệp bền vững kết hợp công nghệ cao. <br className="block md:hidden"/> Đây là minh chứng
              cho khát vọng đổi mới, cam kết phát triển và tầm nhìn chiến lược của dự án tại Bắc Giang.
            </p>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};
