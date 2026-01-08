// pages/index.js

import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import DefaultLayout from "../components/layout/DefaultLayout";
import SubscribeSection from "../components/about/SubscribeSection";
import AboutUsSection from "../components/about/AboutUsSection";
import OrganicProcess from "../components/about/OrganicProcess";
import PostCard from "../components/common/PostCard";
import CarouselComponent from "../components/ecobacgiang/CarouselComponent";
import VideoHero from "../components/univisport/VideoHero";
import PromoBanner from "../components/ecobacgiang/PromoBanner";
import MonthlySales from "../components/ecobacgiang/MonthlySales";
import CategoryProductSlider from "../components/ecobacgiang/CategoryProductSlider";

// Helper chuyển path Cloudinary
const toCloudinaryUrl = (relativePath) => {
  if (!relativePath || typeof relativePath !== "string") {
    return "/images/placeholder.jpg";
  }
  if (relativePath.includes("/image/upload/")) {
    const parts = relativePath.split("/");
    const vIdx = parts.findIndex((p) => p.startsWith("v") && !isNaN(p.slice(1)));
    if (vIdx !== -1) {
      const clean = parts.slice(vIdx + 1).join("/");
      return `https://res.cloudinary.com/dcgtt1jza/image/upload/v1/${clean}`;
    }
  }
  const clean = relativePath.startsWith("/") ? relativePath.slice(1) : relativePath;
  return `https://res.cloudinary.com/dcgtt1jza/image/upload/v1/${clean}`;
};

export default function Home({ posts, meta }) {
  // JSON-LD Schema.org cho Eco Bắc Giang
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Eco Bắc Giang",
    url: "https://ecobacgiang.vn",
    logo: "https://ecobacgiang.vn/logo.png",
    sameAs: [
      "https://www.facebook.com/ecobacgiang",
      "https://www.linkedin.com/company/ecobacgiang",
    ],
    description:
      "Eco Bắc Giang – thương hiệu dẫn đầu về nông nghiệp thông minh và sản xuất hữu cơ bền vững tại Việt Nam, hướng tới Net Zero 2050.",
  };

  return (
    <DefaultLayout meta={meta}>
      <Head>
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <h1 className="hidden">
        Eco Bắc Giang - Nông nghiệp hữu cơ - Ứng dụng IoT, AI và Robot trong nông nghiệp
      </h1>
      <CarouselComponent />
      <MonthlySales />
      <PromoBanner />
      <CategoryProductSlider categoryName="rau-an-la" categoryTitle="Rau ăn lá" />
      <CategoryProductSlider categoryName="cu-qua-hat" categoryTitle="Củ - quả" />
      <CategoryProductSlider categoryName="rau-gia-vi" categoryTitle="Rau gia vị" />
      <CategoryProductSlider categoryName="thuc-pham-kho" categoryTitle="Thực phẩm khô" />
      <CategoryProductSlider categoryName="san-pham-ocop" categoryTitle="Sản phẩm OCOP" />
      <VideoHero />
      <OrganicProcess />
      <AboutUsSection />
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Bài viết mới nhất</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-2 pb-6">
          {posts.slice(0, 3).map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <Link 
            href="/bai-viet" 
            className="text-green-600 text-base font-medium hover:underline"
          >
            Xem tất cả bài viết
          </Link>
        </div>
      </div>
      <SubscribeSection />
    </DefaultLayout>
  );
}

export async function getServerSideProps() {
  // Chỉ dùng Server API
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
  }
  let posts = [];
  
  try {
    const response = await fetch(`${apiBaseUrl}/posts?limit=8&skip=0&includeDrafts=false`);
    if (response.ok) {
      const data = await response.json();
      // Format posts từ Server API response và filter draft để đảm bảo
      const allPosts = data.posts || [];
      // Filter draft posts
      const publishedPosts = allPosts.filter(post => 
        post.isDraft !== true && post.isDraft !== null && post.isDraft !== undefined
      );
      posts = publishedPosts.map(post => ({
        id: post._id || post.id,
        title: post.title,
        slug: post.slug,
        category: post.category,
        createdAt: post.createdAt,
        thumbnail: post.thumbnail?.url || post.thumbnail || "",
        meta: post.meta,
        tags: post.tags || [],
        isDraft: post.isDraft || false,
      }));
    }
  } catch (error) {
    console.error('Error fetching posts from Server API:', error);
    // Fallback về empty array nếu Server API không chạy
    posts = [];
  }

  // SEO meta cho Eco Bắc Giang
  const meta = {
    title: "Eco Bắc Giang – Nông nghiệp thông minh & sản xuất hữu cơ bền vững",
    description:
      "Eco Bắc Giang ứng dụng công nghệ IoT, tự động hóa và giải pháp xanh để phát triển nông nghiệp hữu cơ chất lượng cao, hướng tới Net Zero 2050.",
    keywords:
      "Eco Bắc Giang, nông nghiệp thông minh, hữu cơ, bền vững, IoT, tự động hóa, Net Zero 2050",
    robots: "index, follow",
    author: "Eco Bắc Giang",
    canonical: "https://ecobacgiang.vn",
    og: {
      title: "Eco Bắc Giang – Nông nghiệp thông minh & hữu cơ bền vững",
      description:
        "Eco Bắc Giang ứng dụng công nghệ cao để sản xuất nông sản hữu cơ đạt chuẩn, hướng tới phát triển bền vững.",
      type: "website",
      image: "https://ecobacgiang.vn/baner.webp",
      imageWidth: "1200",
      imageHeight: "630",
      url: "https://ecobacgiang.vn",
    },
    twitter: {
      card: "summary_large_image",
      title: "Eco Bắc Giang – Nông nghiệp thông minh & hữu cơ bền vững",
      description:
        "Thương hiệu Eco Bắc Giang dẫn đầu về nông nghiệp hữu cơ và công nghệ xanh tại Việt Nam.",
      image: "https://ecobacgiang.vn/baner.webp",
    },
  };

  return {
    props: { posts, meta },
  };
}
