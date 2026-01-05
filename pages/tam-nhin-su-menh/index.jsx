
import React from "react";
import Head from "next/head";
import DefaultLayout from "../../components/layout/DefaultLayout";
import CoreValues from "../../components/about/CoreValues";
import VisionComponent from "../../components/about/VisionComponent";

const VisionMissionCoreValues = () => {
  return (
    <DefaultLayout>
      <Head>
        <title>Tầm Nhìn - Sứ Mệnh - Giá Trị Cốt Lõi | Eco Bắc Giang</title>
        <meta name="title" content="Tầm Nhìn - Sứ Mệnh - Giá Trị Cốt Lõi | Eco Bắc Giang" />
        <meta name="description" content="Khám phá tầm nhìn, sứ mệnh và giá trị cốt lõi của Eco Bắc Giang - thương hiệu hàng đầu trong nông nghiệp thông minh và sản xuất hữu cơ bền vững tại Việt Nam. Hướng tới mục tiêu Net Zero 2050 với 8 giá trị cốt lõi: Bền vững, Thuận tự nhiên, Đổi mới, Chất lượng, Trách nhiệm xã hội, Đồng hành, Tận tâm và Hướng đến tương lai." />
        <meta name="keywords" content="Eco Bắc Giang, tầm nhìn Eco Bắc Giang, sứ mệnh Eco Bắc Giang, giá trị cốt lõi, nông nghiệp thông minh, sản xuất hữu cơ, kinh tế xanh, Net Zero 2050, ESG framework, bảo vệ môi trường, trách nhiệm xã hội, IoT nông nghiệp, nông nghiệp bền vững Việt Nam, rau hữu cơ Bắc Giang" />
        <meta name="author" content="Eco Bắc Giang" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="Vietnamese" />
        <meta name="revisit-after" content="7 days" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/tam-nhin-su-menh`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/tam-nhin-su-menh`} />
        <meta property="og:title" content="Tầm Nhìn - Sứ Mệnh - Giá Trị Cốt Lõi | Eco Bắc Giang" />
        <meta property="og:description" content="Khám phá tầm nhìn, sứ mệnh và giá trị cốt lõi của Eco Bắc Giang - thương hiệu hàng đầu trong nông nghiệp thông minh và sản xuất hữu cơ bền vững tại Việt Nam. Hướng tới mục tiêu Net Zero 2050." />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/images/slide.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Eco Bắc Giang - Tầm nhìn, Sứ mệnh và Giá trị cốt lõi" />
        <meta property="og:locale" content="vi_VN" />
        <meta property="og:site_name" content="Eco Bắc Giang" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/tam-nhin-su-menh`} />
        <meta name="twitter:title" content="Tầm Nhìn - Sứ Mệnh - Giá Trị Cốt Lõi | Eco Bắc Giang" />
        <meta name="twitter:description" content="Khám phá tầm nhìn, sứ mệnh và giá trị cốt lõi của Eco Bắc Giang - thương hiệu hàng đầu trong nông nghiệp thông minh và sản xuất hữu cơ bền vững tại Việt Nam." />
        <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/images/slide.jpg`} />
        <meta name="twitter:image:alt" content="Eco Bắc Giang - Tầm nhìn, Sứ mệnh và Giá trị cốt lõi" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
    <div className="h-[80px]"></div>
      <div className="mx-auto p-4 md:max-w-7xl">
        <div className="text-center mt-6">
          <h1 className="md:text-2xl text-xl font-bold text-green-800 mb-2">
            Tầm Nhìn - Sứ Mệnh - Giá Trị Cốt Lõi
          </h1>
          <p className="text-gray-600">
            Khám phá giá trị và định hướng phát triển Eco Bắc Giang – nông nghiệp thông minh, hữu cơ, bền vững.
          </p>
        </div>

        <div className="mb-8">
          <VisionComponent />
        </div>

        <div className="mb-8">
          <h2 className="md:text-2xl text-xl font-bold text-green-800 mb-2">2. Sứ Mệnh</h2>
          <p className="text-gray-600 mb-6 ">
            Chúng tôi cam kết thực hiện những sứ mệnh quan trọng để xây dựng tương lai nông nghiệp bền vững
          </p>

          <div className="space-y-4 mb-6">
            {[
              {
                title: "Sản xuất hữu cơ chất lượng cao",
                description: "Cung cấp các loại rau củ hữu cơ sạch, an toàn, đảm bảo tiêu chuẩn quốc tế và bảo vệ tài nguyên thiên nhiên."
              },
              {
                title: "Thuận tự nhiên",
                description: "Địa phương canh tác được quy hoạch theo quy luật tự nhiên, giảm thiểu tác động xấu đến môi trường và tôn trọng sự cân bằng sinh thái."
              },
              {
                title: "Ứng dụng công nghệ thông minh",
                description: "Phát triển và triển khai các giải pháp IoT, hệ thống tự động hóa và robot để tối ưu hóa quy trình sản xuất, tiết kiệm tài nguyên và nâng cao hiệu quả."
              },
              {
                title: "Phát triển kinh tế xanh",
                description: "Thực hiện nguyên tắc ESG (Môi trường, Xã hội và Quản trị), góp phần đối phó biến đổi khí hậu và tăng cường trách nhiệm xã hội."
              },
              {
                title: "Hỗ trợ cộng đồng nông nghiệp",
                description: "Đồng hành cùng nông dân và các doanh nghiệp nhỏ trong chuyển đổi từ sản xuất truyền thống sang nông nghiệp thông minh, tăng thu nhập và giảm thiểu rủi ro."
              }
            ].map((mission, index) => (
              <div key={index} className="flex gap-4 p-4 bg-gray-50">
                <div className="w-8 h-8 bg-green-200 flex items-center justify-center font-bold text-green-700 text-sm">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-1">{mission.title}</h3>
                  <p className="text-gray-600 text-base">{mission.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <CoreValues />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default VisionMissionCoreValues;
