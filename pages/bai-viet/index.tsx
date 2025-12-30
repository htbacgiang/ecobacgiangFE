import { useState, useEffect } from "react";
import type { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { FaCalendarAlt, FaUser, FaArrowRight, FaClock, FaTag } from "react-icons/fa";
import { trimText } from "../../utils/helper";
import { formatPosts } from "../../lib/utils";

import DefaultLayout from "../../components/layout/DefaultLayout";
import MainCategories from "../../components/common/MainCategories";

import { PostDetail } from "../../utils/types";

type MetaData = {
  title: string;
  description: string;
  keywords: string;
  author: string;
  robots: string;
  canonical: string;
  og: {
    title: string;
    description: string;
    type: string;
    image: string;
    imageWidth: string;
    imageHeight: string;
    url: string;
    siteName: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    image: string;
  };
};

const meta: MetaData = {
  title: "Tin tức & Chia sẻ Nông nghiệp Hữu cơ - IoT AI và Robot từ Eco Bắc Giang",
  description: "Khám phá tin tức, kiến thức và chia sẻ về nông nghiệp hữu cơ, công nghệ IoT và sản xuất bền vững từ Eco Bắc Giang.",
  keywords: "Eco Bắc Giang, nông nghiệp hữu cơ, nông nghiệp thông minh, IoT nông nghiệp, sản xuất bền vững",
  author: "Eco Bắc Giang",
  robots: "index, follow",
  canonical: "https://ecobacgiang.vn/bai-viet",
  og: {
    title: "Eco Bắc Giang - Tin tức & Kiến thức Nông nghiệp Hữu cơ",
    description: "Khám phá tin tức, kiến thức và chia sẻ về nông nghiệp hữu cơ, công nghệ IoT và sản xuất bền vững.",
    type: "website",
    image: "https://ecobacgiang.vn//baner.webp",
    imageWidth: "1200",
    imageHeight: "630",
    url: "https://ecobacgiang.vn/bai-viet",
    siteName: "Eco Bắc Giang",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eco Bắc Giang - Tin tức & Kiến thức Nông nghiệp Hữu cơ",
    description: "Khám phá tin tức, kiến thức và chia sẻ về nông nghiệp hữu cơ, công nghệ IoT và sản xuất bền vững.",
    image: "https://ecobacgiang.vn//baner.webp",
  },
};

interface Props {
  initialPosts: PostDetail[];
}

const Blogs: NextPage<Props> = ({ initialPosts = [] }) => {
  const [posts, setPosts] = useState<PostDetail[]>(initialPosts);
  const [filteredPosts, setFilteredPosts] = useState<PostDetail[]>(initialPosts);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const recentPostsPerPage = 9; // Recent posts pagination
  const featuredPostsCount = 4; // Always show first 4 as featured

  const formatDate = (date: string): string =>
    new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // Handle category filtering
  const handleCategorySelect = (category: string | null) => {
    console.log("Category selected:", category);
    console.log("Total posts available:", posts.length);
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when filtering
    if (category) {
      // Filter posts by category (case-insensitive, trim whitespace)
      const filtered = posts.filter((post) => {
        const postCategory = post.category?.trim().toLowerCase() || "";
        const selectedCategoryLower = category.trim().toLowerCase();
        return postCategory === selectedCategoryLower;
      });
      console.log(`Filtered posts for "${category}":`, filtered.length, filtered.map(p => ({ title: p.title, category: p.category })));
      setFilteredPosts(filtered);
    } else {
      console.log("Showing all posts");
      setFilteredPosts(posts);
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Featured posts: Chỉ lấy 4 bài viết có isFeatured = true (sắp xếp theo ngày tạo mới nhất)
  // - Nếu có category được chọn: lấy từ filtered posts
  // - Nếu không có category: lấy từ tất cả posts
  const postsToCheck = selectedCategory ? filteredPosts : posts;
  const featuredPosts = postsToCheck
    .filter(post => post.isFeatured === true)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sắp xếp mới nhất trước
    .slice(0, featuredPostsCount); // Chỉ lấy tối đa 4 bài
  
  // Recent posts: Tất cả bài viết không phải featured (hoặc featured nhưng không trong top 4)
  // Loại bỏ các bài đã hiển thị ở featured
  const featuredPostIds = new Set(featuredPosts.map(p => p.id));
  const recentPostsAll = filteredPosts.filter(post => !featuredPostIds.has(post.id));
  
  // Pagination cho recent posts
  const filteredRecentPosts = recentPostsAll;
  
  const recentStartIndex = (currentPage - 1) * recentPostsPerPage;
  const recentEndIndex = recentStartIndex + recentPostsPerPage;
  const recentPosts = filteredRecentPosts.slice(recentStartIndex, recentEndIndex);
  
  // Recalculate total pages based on filtered recent posts
  const totalRecentPosts = filteredRecentPosts.length;
  const calculatedTotalPages = Math.ceil(totalRecentPosts / recentPostsPerPage);
  const actualTotalPages = Math.max(1, calculatedTotalPages);
  
  // Debug logging
  console.log("Posts state:", {
    totalPosts: posts.length,
    filteredPosts: filteredPosts.length,
    selectedCategory,
    featuredPosts: featuredPosts.length,
    filteredRecentPosts: filteredRecentPosts.length,
    recentPosts: recentPosts.length,
    currentPage,
    actualTotalPages,
    postsSample: posts.slice(0, 3).map(p => ({ title: p.title, category: p.category, isDraft: p.isDraft }))
  });

  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="keywords" content={meta.keywords} />
        <meta name="author" content={meta.author} />
        <meta name="robots" content={meta.robots} />
        <link rel="canonical" href={meta.canonical} />
        
        {/* Open Graph */}
        <meta property="og:title" content={meta.og.title} />
        <meta property="og:description" content={meta.og.description} />
        <meta property="og:type" content={meta.og.type} />
        <meta property="og:image" content={meta.og.image} />
        <meta property="og:image:width" content={meta.og.imageWidth} />
        <meta property="og:image:height" content={meta.og.imageHeight} />
        <meta property="og:url" content={meta.og.url} />
        <meta property="og:site_name" content={meta.og.siteName} />
        
        {/* Twitter */}
        <meta name="twitter:card" content={meta.twitter.card} />
        <meta name="twitter:title" content={meta.twitter.title} />
        <meta name="twitter:description" content={meta.twitter.description} />
        <meta name="twitter:image" content={meta.twitter.image} />
      </Head>

    <DefaultLayout>
        <div className="h-[80px]"></div>
        <div className="pb-12 mt-6 max-w-8xl mx-3">
          <div className="flex flex-col gap-4 justify-center w-full">
          {/* Breadcrumb */}
          <div className="flex gap-2 px-4 lg:px-12 ">
              <Link href="/" className="hover:text-green-800 transition-colors">
                Trang chủ
              </Link>
            <span>•</span>
            <Link href="/bai-viet" className="text-green-800 ">
              Bài viết & Chia Sẻ
            </Link>
          </div>

            {/* Content */}
            <>
          {/* Featured Posts */}
            {featuredPosts.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-6 justify-between px-4 lg:px-12">
            {/* Main Featured */}
            {featuredPosts[0]?.thumbnail && (
              <div className="w-full lg:w-8/12 flex flex-col gap-2">
                <Link href={`/bai-viet/${featuredPosts[0].slug}`}>
                    <div className="aspect-video relative cursor-pointer rounded shadow-sm shadow-secondary-dark overflow-hidden group">
                    <Image
                        src={featuredPosts[0].thumbnail}
                      layout="fill"
                        className="object-cover group-hover:scale-105 transition-all ease duration-300"
                      alt={featuredPosts[0].title}
                    />
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/bai-viet/${featuredPosts[0].slug}`}
                      className="text-green-800 lg:text-lg  font-bold hover:text-green-700 transition-colors"
                  >
                    {featuredPosts[0].title}
                  </Link>
                </div>
                  <p className="text-base font-medium line-clamp-2 text-gray-600">
                  {trimText(featuredPosts[0].meta, 160)}
                </p>
                  <div className="text-sm text-gray-500">
                    {formatDate(featuredPosts[0].createdAt)}
                  </div>
              </div>
            )}

            {/* Secondary Featured */}
            <div className="w-full lg:w-6/12 flex flex-col gap-4">
              {featuredPosts.slice(1, 4).map((post, idx) => (
                post.thumbnail && (
                    <div key={post.id} className="flex justify-between gap-4 h-auto lg:h-1/3">
                      <Link href={`/bai-viet/${post.slug}`} className="w-1/3 aspect-video relative cursor-pointer rounded shadow-sm shadow-secondary-dark overflow-hidden group">
                      <Image
                          src={post.thumbnail}
                        layout="fill"
                          className="object-cover group-hover:scale-105 transition-all ease duration-300"
                        alt={post.title}
                      />
                    </Link>
                    <div className="w-2/3 flex flex-col justify-center">
                      <div className="flex items-center gap-2 text-sm lg:text-base mb-1">
                          <Link href={`/bai-viet/${post.slug}`} className="text-green-800 font-bold hover:text-green-700 transition-colors">
                          {post.title}
                        </Link>
                      </div>
                        <p className="text-sm font-medium line-clamp-2 text-gray-600">
                        {trimText(post.meta, 100)}
                      </p>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(post.createdAt)}
                        </div>
                      </div>
                  </div>
                )
              ))}
            </div>
          </div>
            )}

                {/* Category Filter */}
          <MainCategories onCategorySelect={handleCategorySelect} />

                {/* Recent Posts Grid */}
                {recentPosts.length > 0 && (
                  <div className="px-4 lg:px-12 mb-12">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-gray-900">Bài viết gần đây</h2>
                      <p className="text-gray-600">
                        {recentPosts.length} bài viết
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {recentPosts.map((post) => (
                        <article 
                          key={post.id} 
                          className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                        >
                          {/* Post Image */}
                          <div className="relative aspect-video overflow-hidden">
                            {post.thumbnail ? (
                              <Image
                                src={post.thumbnail}
                                alt={post.title}
                                layout="fill"
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                                <span className="text-green-500 text-3xl">📝</span>
                              </div>
                            )}
                            
                            {/* Category Badge */}
                            {post.category && (
                              <div className="absolute top-4 left-4">
                                <span className="bg-green-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                                  {post.category}
                                </span>
                              </div>
                            )}

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>

                          {/* Post Content */}
                          <div className="p-6">
                            {/* Title */}
                            <h3 className="text-lg font-bold text-gray-900  leading-tight group-hover:text-green-800 transition-colors line-clamp-2">
                              <Link href={`/bai-viet/${post.slug}`}>
                                {post.title}
                              </Link>
                            </h3>

                            {/* Excerpt */}
                            <p className="text-gray-600 leading-relaxed  line-clamp-3 text-sm">
                              {trimText(post.meta, 100)}
                            </p>

                            {/* Meta Info */}
                            <div className="flex items-center justify-between text-sm text-gray-500 ">
                              <div className="flex items-center">
                                <FaCalendarAlt className="mr-1" />
                                <span>{formatDate(post.createdAt)}</span>
                              </div>
                              <div className="flex items-center">
                                <FaClock className="mr-1" />
                                <span>5 phút đọc</span>
                              </div>
                            </div>

                            {/* Read More */}
                            <Link 
                              href={`/bai-viet/${post.slug}`}
                              className="inline-flex items-center text-green-800 hover:text-green-700 font-medium transition-colors group/link"
                            >
                              Đọc thêm
                              <FaArrowRight className="ml-2 transition-transform group-hover/link:translate-x-1" />
                            </Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Posts Message */}
                {(filteredPosts.length === 0 || (recentPosts.length === 0 && featuredPosts.length === 0)) && (
                  <div className="text-center py-16 px-4">
                    <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-4xl">📝</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {selectedCategory ? 'Không có bài viết nào trong danh mục này' : 'Chưa có bài viết nào'}
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      {selectedCategory ? 'Hãy thử chọn danh mục khác hoặc quay lại sau để xem nội dung mới.' : 'Chúng tôi đang chuẩn bị những nội dung thú vị. Hãy quay lại sau nhé!'}
                    </p>
                    {selectedCategory && (
                      <button
                        onClick={() => handleCategorySelect(null)}
                        className="inline-flex items-center px-8 py-4 bg-green-800 hover:bg-green-700 text-white font-bold rounded-full transition-colors duration-300"
                      >
                        Xem tất cả bài viết
                        <FaArrowRight className="ml-2" />
                      </button>
                    )}
                  </div>
                )}

                {/* Enhanced Pagination */}
                <div className="flex flex-col items-center gap-6 mt-12 px-4 lg:px-12">

                  {/* Pagination Controls - Show if we have recent posts */}
                  {actualTotalPages > 1 && (
                    <div className="flex justify-center items-center gap-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white text-green-700 rounded-full border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-50 hover:text-green-900 hover:border-green-300 transition-colors font-medium flex items-center gap-2"
                      >
                        <FaArrowRight className="rotate-180 text-sm" />
                        Trước
                      </button>
                      
                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {(() => {
                          const pages = [];
                          const maxVisiblePages = 5;
                          let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                          let endPage = Math.min(actualTotalPages, startPage + maxVisiblePages - 1);
                          
                          // Adjust start if we're near the end
                          if (endPage - startPage + 1 < maxVisiblePages) {
                            startPage = Math.max(1, endPage - maxVisiblePages + 1);
                          }
                          
                          // Always show page 1
                          if (startPage > 1) {
                            pages.push(
                              <button
                                key={1}
                                onClick={() => handlePageChange(1)}
                                className="w-10 h-10 bg-white text-green-700 rounded-full border border-green-200 hover:bg-green-50 transition-colors font-medium flex items-center justify-center"
                              >
                                1
                              </button>
                            );
                            
                            if (startPage > 2) {
                              pages.push(
                                <span key="start-ellipsis" className="px-2 text-gray-400">...</span>
                              );
                            }
                          }
                          
                          // Show pages in range
                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <button
                                key={i}
                                onClick={() => handlePageChange(i)}
                                className={`w-10 h-10 rounded-full font-medium transition-colors flex items-center justify-center ${
                                  i === currentPage
                                    ? "bg-green-800 text-white shadow-lg"
                                    : "bg-white text-green-700 border border-green-200 hover:bg-green-50"
                                }`}
                              >
                                {i}
                              </button>
                            );
                          }
                          
                          // Always show last page
                          if (endPage < actualTotalPages) {
                            if (endPage < actualTotalPages - 1) {
                              pages.push(
                                <span key="end-ellipsis" className="px-2 text-gray-400">...</span>
                              );
                            }
                            
                            pages.push(
                              <button
                                key={actualTotalPages}
                                onClick={() => handlePageChange(actualTotalPages)}
                                className="w-10 h-10 bg-white text-green-700 rounded-full border border-green-200 hover:bg-green-50 transition-colors font-medium flex items-center justify-center"
                              >
                                {actualTotalPages}
                              </button>
                            );
                          }
                          
                          return pages;
                        })()}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === actualTotalPages}
                        className="px-4 py-2 bg-white text-green-700 rounded-full border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-50 hover:text-green-900 hover:border-green-300 transition-colors font-medium flex items-center gap-2"
                      >
                        Sau
                        <FaArrowRight className="text-sm" />
                      </button>
                    </div>
                  )}
                </div>
                </>
        </div>
      </div>
    </DefaultLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Chỉ dùng Server API
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
    if (!apiBaseUrl) {
      throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
    }
    let formattedPosts: PostDetail[] = [];
    
    try {
      // Fetch all posts (không giới hạn limit để lấy tất cả)
      const response = await fetch(`${apiBaseUrl}/posts?limit=1000&skip=0&includeDrafts=false`);
      if (response.ok) {
        const data = await response.json();
        // Format posts từ Server API response và filter draft để đảm bảo
        formattedPosts = formatPosts(data.posts || [], true); // excludeDrafts = true
      }
    } catch (error) {
      console.error('Error fetching posts from Server API:', error);
      formattedPosts = [];
    }

    console.log("📊 Server-side: Fetched posts:", {
      total: formattedPosts.length,
      sample: formattedPosts.slice(0, 3).map(p => ({ 
        title: p.title, 
        category: p.category, 
        isDraft: p.isDraft,
        isFeatured: p.isFeatured,
        hasThumbnail: !!p.thumbnail 
      }))
    });

    return {
      props: {
        initialPosts: formattedPosts,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    return {
      props: {
        initialPosts: [],
      },
    };
  }
};

export default Blogs;
