import {
  GetServerSideProps,
  NextPage,
} from "next";
import parse from "html-react-parser";
import DefaultLayout from "../../components/layout/DefaultLayout";
import Share from "../../components/common/Share";
import Link from "next/link";
import Image from "next/image";
import { trimText, getReadingTimeMinutes } from "../../utils/helper";

type PostData = {
  id: string;
  title: string;
  content: string;
  meta: string;
  tags: string[];
  slug: string;
  thumbnail: string;
  createdAt: string;
  category: string;
  recentPosts: {
    id: string;
    title: string;
    slug: string;
    category: string;
    thumbnail?: string;
    createdAt: string;
  }[];
};

type MetaData = {
  title: string;
  description: string;
  keywords: string;
  robots: string;
  author: string;
  canonical: string;
  og: {
    title: string;
    description: string;
    type: string;
    image: string;
    imageWidth: string;
    imageHeight: string;
    url: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    image: string;
  };
};

type Props = {
  post?: PostData;
  meta?: MetaData;
};

const SinglePost: NextPage<Props> = ({ post, meta }) => {
  // Add null/undefined checks to prevent errors
  if (!post) {
    const errorMeta = {
      title: "Bài viết không tồn tại | Eco Bắc Giang",
      description: "Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa. Hãy xem các bài viết khác về nông nghiệp hữu cơ từ Eco Bắc Giang.",
      keywords: "bài viết không tồn tại, nông nghiệp hữu cơ, Eco Bắc Giang, IoT nông nghiệp",
      robots: "noindex, follow",
      author: "Eco Bắc Giang",
      canonical: "https://ecobacgiang.vn/bai-viet",
      og: {
        title: "Bài viết không tồn tại | Eco Bắc Giang",
        description: "Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa",
        type: "website",
        image: "https://ecobacgiang.vn//baner.webp",
        imageWidth: "1200",
        imageHeight: "630",
        url: "https://ecobacgiang.vn/bai-viet",
      },
      twitter: {
        card: "summary_large_image",
        title: "Bài viết không tồn tại | Eco Bắc Giang",
        description: "Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa",
        image: "https://ecobacgiang.vn//baner.webp",
      },
    };

    return (
      <DefaultLayout 
        title={errorMeta.title}
        desc={errorMeta.description}
        thumbnail={errorMeta.og.image}
        meta={errorMeta}
      >
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Bài viết không tồn tại</h1>
            <p className="text-gray-600 mt-2">Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Link href="/bai-viet" className="text-green-600 hover:text-green-800 mt-4 inline-block">
              ← Quay lại danh sách bài viết
            </Link>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  const { title, content, meta: postMeta, slug, thumbnail, category, createdAt, recentPosts } = post;
  const host = "https://ecobacgiang.vn";

  // Xử lý content để thêm figcaption cho ảnh có data-show-caption="true"
  const processedContent = (() => {
    if (!content) return content;
    
    let processed = content;
    
    // Tìm tất cả các thẻ img (không nằm trong figure)
    // Regex này sẽ match img không nằm trong figure tag
    processed = processed.replace(
      /(<figure[^>]*>[\s\S]*?<\/figure>)|<img([^>]*)>/gi,
      (match, figureTag, imgAttrs) => {
        // Nếu là figure tag thì giữ nguyên
        if (figureTag) {
          return match;
        }
        
        // Xử lý img tag
        if (!imgAttrs) return match;
        
        // Kiểm tra xem có data-show-caption="true" không
        const showCaptionMatch = imgAttrs.match(/data-show-caption=["']true["']/i);
        if (!showCaptionMatch) {
          return match; // Không có data-show-caption="true", giữ nguyên
        }
        
        // Lấy alt text
        const altMatch = imgAttrs.match(/alt=["']([^"']+)["']/i);
        if (!altMatch || !altMatch[1]) {
          return match; // Không có alt text, giữ nguyên
        }
        
        const altText = altMatch[1];
        
        // Bọc ảnh trong figure và thêm figcaption
        return `<figure><img${imgAttrs}><figcaption>${altText}</figcaption></figure>`;
      }
    );
    
    return processed;
  })();

  return (
    <DefaultLayout 
      title={meta?.title}
      desc={meta?.description}
      thumbnail={meta?.og?.image}
      meta={meta}
    >
      <div className="h-[80px]"></div>
      <div className="container mx-auto py-8 px-4 md:px-0">
        <div className="flex flex-col md:flex-row">
          {/* Main Content - 75% width on md and up */}
          <div className="w-full md:w-3/4 pr-0 md:pr-8 mb-4 md:mb-0">
            <div className="md:pb-20 pb-6 container mx-auto ">
              {/* Breadcrumb */}
              <div className="flex font-bold gap-2 text-base text-gray-600">
                <Link href="/bai-viet" className="hover:text-green-800 whitespace-nowrap">
                  Bài viết
                </Link>
                <span>›</span>
                <span className="flex font-bold gap-2 md:mb-4 mb-1 text-base text-gray-600">
                  {trimText(title, 30)}
                </span>
              </div>

              {/* Tiêu đề bài viết */}
              <h1 className="md:text-3xl text-xl font-bold text-primary-dark dark:text-primary">
                {title}
              </h1>
              <div className="mt-2 mb-2">
                <Share url={`${host}/bai-viet/${slug}`} />
              </div>
              <div className="mt-2 uppercase text-green-800 font-xl">
                <b>{category}</b>
              </div>
              <div className="mt-1 text-sm text-gray-500">
                {getReadingTimeMinutes(content || "")} phút đọc
              </div>
              <div className="blog prose prose-lg dark:prose-invert max-w-2xl md:max-w-4xl lg:max-w-5xl [&_img]:mx-auto">
                <style jsx>{`
                  .blog img {
                    display: block;
                    margin: 1.5em auto;
                  }
                  .blog figure {
                    margin: 1.5em 0;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                  }
                  .blog figure img {
                    display: block;
                    margin: 0 auto;
                  }
                  .blog figcaption {
                    margin-top: 0.5em;
                    font-size: 0.875em;
                    color: #6b7280;
                    font-style: italic;
                    text-align: center;
                    width: 100%;
                    max-width: 100%;
                  }
                  .dark .blog figcaption {
                    color: #9ca3af;
                  }
                `}</style>
                {parse(processedContent || content)}
              </div>
            </div>
          </div>

          {/* Recent Posts Section - 25% width on md and up */}
          <div className="w-full md:w-1/4 px-0.5 ">
            <div className="pt-5">
              <h2 className="text-3xl font-bold text-primary-dark dark:text-primary p-2 mb-4">
                Bài viết gần đây
              </h2>
              <div className="flex flex-col space-y-4">
                {recentPosts && recentPosts.length > 0 ? recentPosts.slice(0, 5).map((p) => (
                  <Link key={p.slug} href={`/bai-viet/${p.slug}`} legacyBehavior>
                    <a className="flex space-x-3 w-full">
                      {p.thumbnail && (
                        <Image
                          src={p.thumbnail}
                          alt={`Thumbnail for ${p.title}`}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex flex-col flex-1">
                        <span className="text-base font-bold text-gray-800">
                          {p.title}
                        </span>
                        <div className="text-base flex items-center mt-1 gap-2">
                          <span className=" text-orange-700">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              ></path>
                            </svg>
                          </span>
                          <span>
                            {new Date(p.createdAt).toLocaleDateString("vi-VN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }).replace("tháng ", "Tháng ")}
                          </span>
                        </div>
                      </div>
                    </a>
                  </Link>
                )) : (
                  <p className="text-gray-600">Không có bài viết gần đây.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default SinglePost;

// Helper function to normalize image URL
const normalizeImageUrl = (imageUrl: string | undefined, baseUrl: string = "https://ecobacgiang.vn"): string => {
  if (!imageUrl) return `${baseUrl}//baner.webp`;
  
  // Check if URL is already absolute (starts with http:// or https://)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If relative path, prepend baseUrl
  return `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
};

export const getServerSideProps: GetServerSideProps<
  { post: PostData; meta: MetaData },
  { slug: string }
> = async ({ params }) => {
  try {
    // Chỉ dùng Server API
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
    if (!apiBaseUrl) {
      throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
    }
    
    if (!params?.slug) {
      console.log('No slug provided');
      return { notFound: true };
    }
    
    // Lấy bài viết theo slug
    const postResponse = await fetch(`${apiBaseUrl}/posts/${params.slug}`);
    
    if (!postResponse.ok) {
      console.log(`Post not found for slug: ${params.slug}, status: ${postResponse.status}`);
      return { notFound: true };
    }
    
    let responseData;
    try {
      responseData = await postResponse.json();
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError);
      return { notFound: true };
    }
    
    const post = responseData?.post;
    
    if (!post) {
      console.log(`Post data is empty for slug: ${params.slug}`);
      return { notFound: true };
    }
    
    // Kiểm tra lại isDraft và deletedAt (phòng trường hợp API không filter)
    if (post.isDraft === true || post.deletedAt) {
      console.log(`Post is draft or deleted for slug: ${params.slug}`);
      return { notFound: true };
    }

    // Chỉ lấy các bài viết đã publish và chưa bị xóa cho recent posts
    const postsResponse = await fetch(`${apiBaseUrl}/posts?limit=6&skip=0&includeDrafts=false`);
    const postsData = postsResponse.ok ? await postsResponse.json() : { posts: [] };
    const recentPosts = (postsData.posts || [])
      .filter((p: any) => {
        // Filter draft và bài viết hiện tại
        const isNotDraft = p.isDraft !== true && p.isDraft !== null && p.isDraft !== undefined;
        const isNotCurrentPost = (p._id || p.id)?.toString() !== (post._id || post.id)?.toString();
        return isNotDraft && isNotCurrentPost;
      })
      .slice(0, 5)
      .map((p: any) => ({
        id: (p._id || p.id)?.toString() || '',
        title: p.title || '',
        slug: p.slug || '',
        category: p.category || "Uncategorized",
        thumbnail: p.thumbnail?.url || p.thumbnail || null,
        createdAt: p.createdAt?.toString() || new Date().toISOString(),
      }));

    const { _id, id, title, content, meta, slug, tags, thumbnail, category, createdAt } = post;
    const baseUrl = "https://ecobacgiang.vn";
    const thumbnailUrl = normalizeImageUrl(thumbnail?.url || thumbnail, baseUrl);

    const metaData = {
      title: `${title} | Eco Bắc Giang`,
      description: meta || `Đọc bài viết "${title}" về nông nghiệp hữu cơ từ chuyên gia Eco Bắc Giang. Kiến thức chuyên môn, xu hướng nông nghiệp mới nhất, giúp bạn sản xuất bền vững.`,
      keywords: `${title}, nông nghiệp hữu cơ, Eco Bắc Giang, IoT nông nghiệp, sản xuất bền vững, ${category}`,
      robots: "index, follow",
      author: "Eco Bắc Giang",
      canonical: `${baseUrl}/bai-viet/${slug}`,
      og: {
        title: `${title} | Eco Bắc Giang`,
        description: meta || `Đọc bài viết "${title}" về nông nghiệp hữu cơ từ chuyên gia Eco Bắc Giang`,
        type: "article",
        image: thumbnailUrl,
        imageWidth: "1200",
        imageHeight: "630",
        url: `${baseUrl}/bai-viet/${slug}`,
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | Eco Bắc Giang`,
        description: meta || `Đọc bài viết "${title}" về nông nghiệp hữu cơ từ chuyên gia Eco Bắc Giang`,
        image: thumbnailUrl,
      },
    };

    const postData: PostData = {
      id: (_id || id)?.toString() || '',
      title: title || '',
      content: content || '',
      meta: meta || '',
      slug: slug || '',
      tags: tags || [],
      category: category || '',
      thumbnail: thumbnail?.url || thumbnail || "",
      createdAt: createdAt?.toString() || new Date().toISOString(),
      recentPosts: recentPosts || [],
    };

    return {
      props: {
        post: postData,
        meta: metaData,
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    return { notFound: true };
  }
};
