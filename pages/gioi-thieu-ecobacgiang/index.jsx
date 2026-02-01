import BusinessPhilosophy from "../../components/about/BusinessPhilosophy ";
import Intro from "../../components/about/Intro";
import QualityPolicy from "../../components/about/QualityPolicy";
import DefaultLayout from "../../components/layout/DefaultLayout";
import Head from "next/head";

export default function AboutSection() {

  return (
    <DefaultLayout>
      <Head>
        {/* Primary Meta Tags */}
        <title>Giới Thiệu Eco Bắc Giang | Nông Nghiệp Hữu Cơ Bền Vững</title>
        <meta
          name="title"
          content="Giới Thiệu Eco Bắc Giang | Nông Nghiệp Hữu Cơ Bền Vững"
        />
        <meta
          name="description"
          content="Eco Bắc Giang - Tiên phong trong nông nghiệp hữu cơ và công nghệ cao tại Việt Nam. Khám phá tầm nhìn, sứ mệnh và triết lý sản xuất hữu cơ thuận tự nhiên, hướng tới mục tiêu Net Zero 2050."
        />
        <meta
          name="keywords"
          content="Eco Bắc Giang, giới thiệu Eco Bắc Giang, nông nghiệp hữu cơ, nông nghiệp công nghệ cao, sản xuất hữu cơ, nông nghiệp bền vững, IoT nông nghiệp, robot nông nghiệp, Net Zero 2050, rau hữu cơ Bắc Giang, nông nghiệp thông minh Việt Nam"
        />
        <meta name="author" content="Eco Bắc Giang" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="Vietnamese" />
        <meta name="revisit-after" content="7 days" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Canonical URL */}
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/gioi-thieu-ecobacgiang`}
        />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/gioi-thieu-ecobacgiang`}
        />
        <meta
          property="og:title"
          content="Giới Thiệu Eco Bắc Giang | Nông Nghiệp Hữu Cơ Bền Vững"
        />
        <meta
          property="og:description"
          content="Eco Bắc Giang - Tiên phong trong nông nghiệp hữu cơ và công nghệ cao tại Việt Nam. Khám phá tầm nhìn, sứ mệnh và triết lý sản xuất hữu cơ thuận tự nhiên, hướng tới mục tiêu Net Zero 2050."
        />
        <meta
          property="og:image"
          content={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/baner.webp`}
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Eco Bắc Giang - Nông nghiệp hữu cơ bền vững" />
        <meta property="og:locale" content="vi_VN" />
        <meta property="og:site_name" content="Eco Bắc Giang" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:url"
          content={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/gioi-thieu-ecobacgiang`}
        />
        <meta
          name="twitter:title"
          content="Giới Thiệu Eco Bắc Giang | Nông Nghiệp Hữu Cơ Bền Vững"
        />
        <meta
          name="twitter:description"
          content="Eco Bắc Giang - Tiên phong trong nông nghiệp hữu cơ và công nghệ cao tại Việt Nam. Khám phá tầm nhìn, sứ mệnh và triết lý sản xuất hữu cơ thuận tự nhiên."
        />
        <meta
          name="twitter:image"
          content={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/baner.webp`}
        />
        <meta name="twitter:image:alt" content="Eco Bắc Giang - Nông nghiệp hữu cơ bền vững" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Eco Bắc Giang",
              "description": "Tiên phong trong nông nghiệp hữu cơ và công nghệ cao tại Việt Nam, hướng tới mục tiêu Net Zero 2050",
              "url": `${process.env.NEXT_PUBLIC_BASE_URL || ''}/gioi-thieu-ecobacgiang`,
              "logo": `${process.env.NEXT_PUBLIC_BASE_URL || ''}/baner.webp`,
              "address": {
                "@type": "PostalAddress",
                "addressRegion": "Bắc Giang",
                "addressCountry": "VN"
              },
              "sameAs": [
                // Có thể thêm các mạng xã hội nếu có
              ]
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
              <div className="inline-flex items-center  px-4 py-2 bg-green-600 text-white text-base font-bold rounded-full shadow-lg hover:bg-green-700 transition-colors duration-300">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                Nông Nghiệp Bền Vững
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-2xl md:text-3xl font-bold leading-tight font-heading">
                  <span className="text-green-700">
                    Eco Bắc Giang
                  </span>
                  <br />
                  <span className="text-gray-800">
                    Tương Lai Của Nông Nghiệp Bền Vững
                  </span>
                </h1>
              </div>

              {/* Description */}
              <div className="space-y-6 text-base text-gray-700 leading-relaxed">
                <p className="border-l-4 border-green-600 pl-6 bg-white/50 backdrop-blur-base rounded-r-lg py-4 text-base">
                  <strong className="text-green-700 font-semibold">Khởi Nguồn Từ Một Tầm Nhìn: </strong>
                  Giữa vùng đất trù phú của Bắc Giang, Eco Bắc Giang không chỉ đơn thuần là một công ty nông nghiệp, mà còn là biểu tượng của sự đổi mới trong ngành nông nghiệp Việt Nam.
                </p>
                
                <p className="bg-white/70 backdrop-blur-base rounded-lg p-6 shadow-lg text-base">
                  Với tầm nhìn rõ ràng và đầy tham vọng, <strong className="text-green-700 font-semibold">Eco Bắc Giang</strong> hướng tới trở thành người tiên phong trong lĩnh vực nông nghiệp thông minh và sản xuất hữu cơ bền vững. Được thành lập dựa trên nền tảng của tri thức hiện đại và tình yêu thiên nhiên, Eco Bắc Giang cam kết xây dựng một hệ sinh thái nông nghiệp hài hòa giữa con người và môi trường, đồng thời góp phần vào mục tiêu <strong className="text-green-700 font-semibold">Net Zero 2050</strong>.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">100%</div>
                  <div className="text-base text-gray-600">Hữu Cơ</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">2050</div>
                  <div className="text-base text-gray-600">Net Zero</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">24/7</div>
                  <div className="text-base text-gray-600">Giám Sát</div>
                </div>
              </div>
            </div>

            {/* Video Section */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
                  <iframe
                    className="w-full h-full rounded-2xl"
                    src="https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1&mute=1&loop=1&playlist=YOUR_VIDEO_ID&controls=1&modestbranding=1&rel=0"
                    title="Video giới thiệu nông trại Eco Bắc Giang"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="bg-white">
        <BusinessPhilosophy />
        <Intro />
        <QualityPolicy />
      </div>
    </DefaultLayout>
  );
}