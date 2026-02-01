import Head from "next/head";
import DefaultLayout from "../../components/layout/DefaultLayout";
import ContactPage from "../../components/ecobacgiang/ContactPage";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://ecobacgiang.vn";

export default function LienHe({ meta }) {
  // JSON-LD Schema.org cho trang liên hệ
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Liên hệ Eco Bắc Giang",
    "description": "Liên hệ với Eco Bắc Giang để được tư vấn về sản phẩm nông sản hữu cơ miễn phí. Chúng tôi luôn sẵn sàng hỗ trợ bạn về các sản phẩm nông sản hữu cơ chất lượng cao.",
    "mainEntity": {
      "@type": "Organization",
      "name": "Eco Bắc Giang",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Tân An",
        "addressLocality": "Yên Dũng",
        "addressRegion": "Bắc Giang",
        "postalCode": "220000",
        "addressCountry": "VN"
      },
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+84-969-079-673",
          "contactType": "customer service",
          "availableLanguage": ["Vietnamese"],
          "hoursAvailable": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "opens": "08:00",
            "closes": "18:00"
          }
        },
        {
          "@type": "ContactPoint",
          "email": "lienhe@ecobacgiang.vn",
          "contactType": "customer service"
        }
      ],
      "sameAs": [
        "https://www.facebook.com/ecobacgiang",
        "https://www.instagram.com/ecobacgiang"
      ]
    }
  };

  return (
    <DefaultLayout 
      title={meta?.title}
      desc={meta?.description}
      thumbnail={meta?.og?.image}
      meta={meta}
    >
      <Head>
        {/* JSON-LD Schema.org cho trang Liên hệ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <h1 className="visually-hidden">
        Liên hệ Eco Bắc Giang - Tư vấn sản phẩm nông sản hữu cơ
      </h1>
      <ContactPage />
    </DefaultLayout>
  );
}

export async function getServerSideProps() {
  const meta = {
    title: "Liên hệ Eco Bắc Giang - Tư vấn sản phẩm nông sản hữu cơ miễn phí",
    description:
      "Liên hệ ngay với Eco Bắc Giang để được tư vấn về sản phẩm nông sản hữu cơ miễn phí. Hotline: 0969.079.673. Email: lienhe@ecobacgiang.vn. Chúng tôi luôn sẵn sàng hỗ trợ bạn về các sản phẩm nông sản hữu cơ chất lượng cao.",
    keywords:
      "liên hệ Eco Bắc Giang, tư vấn nông sản hữu cơ, hotline Eco Bắc Giang, địa chỉ Eco Bắc Giang, email Eco Bắc Giang, tư vấn miễn phí, nông sản hữu cơ, sản phẩm hữu cơ",
    robots: "index, follow",
    author: "Eco Bắc Giang",
    canonical: `${BASE_URL}/lien-he`,
    og: {
      title: "Liên hệ Eco Bắc Giang - Tư vấn sản phẩm nông sản hữu cơ miễn phí",
      description:
        "Liên hệ ngay với Eco Bắc Giang để được tư vấn về sản phẩm nông sản hữu cơ miễn phí. Hotline: 0969.079.673. Email: lienhe@ecobacgiang.vn. Chúng tôi luôn sẵn sàng hỗ trợ bạn về các sản phẩm nông sản hữu cơ chất lượng cao.",
      type: "website",
      image: `${BASE_URL}/images/banner.png`,
      imageWidth: "1200",
      imageHeight: "630",
      url: `${BASE_URL}/lien-he`,
      siteName: "Eco Bắc Giang",
      locale: "vi_VN",
    },
    twitter: {
      card: "summary_large_image",
      title: "Liên hệ Eco Bắc Giang - Tư vấn sản phẩm nông sản hữu cơ miễn phí",
      description:
        "Liên hệ ngay với Eco Bắc Giang để được tư vấn về sản phẩm nông sản hữu cơ miễn phí. Hotline: 0969.079.673. Email: lienhe@ecobacgiang.vn. Chúng tôi luôn sẵn sàng hỗ trợ bạn về các sản phẩm nông sản hữu cơ chất lượng cao.",
      image: `${BASE_URL}/images/banner.png`,
      site: "@EcoBacGiang",
    },
  };

  return {
    props: {
      meta,
    },
  };
}
