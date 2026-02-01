/**
 * Cấu hình next-sitemap - Sitemap động với sản phẩm & bài viết từ API
 * Chạy sau build: npm run build && npm run sitemap
 */
const siteUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.BASE_URL ||
  "https://ecobacgiang.vn";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_SERVER_URL || "http://localhost:5000/api";

/** Lấy danh sách slug từ API (products hoặc posts) */
async function fetchSlugsFromApi(endpoint, listKey = "products") {
  try {
    const res = await fetch(`${apiBaseUrl}/${endpoint}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const list = data[listKey] || data.posts || data.products || [];
    return list
      .filter((item) => item.slug && (item.isDraft !== true && !item.deletedAt))
      .map((item) => ({
        slug: item.slug,
        lastmod: item.updatedAt || item.createdAt || new Date().toISOString(),
      }));
  } catch (err) {
    console.warn(`[next-sitemap] Không lấy được ${endpoint}:`, err.message);
    return [];
  }
}

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ["/dashboard/*", "/admin/*", "/api/*", "/tai-khoan", "/checkout", "/san-pham-yeu-thich", "/activate", "/xac-nhan-email", "/unsubscribe", "/auth/*", "/404"],

  additionalPaths: async () => {
    const [productSlugs, postSlugs] = await Promise.all([
      fetchSlugsFromApi("products", "products"),
      fetchSlugsFromApi("posts?limit=1000&skip=0&includeDrafts=false", "posts"),
    ]);

    const paths = [];

    // Sản phẩm
    for (const { slug, lastmod } of productSlugs) {
      paths.push({
        loc: `/san-pham/${slug}`,
        lastmod: lastmod ? new Date(lastmod).toISOString().split("T")[0] : undefined,
        changefreq: "weekly",
        priority: 0.8,
      });
    }

    // Bài viết
    for (const { slug, lastmod } of postSlugs) {
      paths.push({
        loc: `/bai-viet/${slug}`,
        lastmod: lastmod ? new Date(lastmod).toISOString().split("T")[0] : undefined,
        changefreq: "weekly",
        priority: 0.7,
      });
    }

    return paths;
  },
};
