/**
 * API trả sitemap.xml động - lấy sản phẩm & bài viết từ API mỗi khi có request
 * Truy cập: /sitemap.xml (qua rewrite trong next.config.js) hoặc /api/sitemap
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.BASE_URL ||
  "https://ecobacgiang.vn";
const API_BASE =
  process.env.NEXT_PUBLIC_API_SERVER_URL || "http://localhost:5000/api";

// Các đường tĩnh cần index (trang công khai)
const STATIC_PATHS = [
  { path: "", changefreq: "daily", priority: "1.0" },
  { path: "san-pham", changefreq: "daily", priority: "0.9" },
  { path: "bai-viet", changefreq: "daily", priority: "0.9" },
  { path: "gioi-thieu-ecobacgiang", changefreq: "monthly", priority: "0.8" },
  { path: "lien-he", changefreq: "monthly", priority: "0.8" },
  { path: "tam-nhin-su-menh", changefreq: "monthly", priority: "0.7" },
  { path: "y-nghia-logo-ecobacgiang", changefreq: "monthly", priority: "0.6" },
  { path: "chinh-sach-bao-mat", changefreq: "monthly", priority: "0.5" },
  { path: "chinh-sach-doi-tra", changefreq: "monthly", priority: "0.5" },
  { path: "chinh-sach-giao-hang", changefreq: "monthly", priority: "0.5" },
  { path: "dieu-khoan-su-dung", changefreq: "monthly", priority: "0.5" },
  { path: "tuyen-dung", changefreq: "monthly", priority: "0.6" },
];

async function fetchJson(endpoint) {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("[sitemap] fetch error:", e.message);
    return [];
  }
}

function escapeXml(str) {
  if (str == null || typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlElement(loc, lastmod, changefreq, priority) {
  let lastmodTag = "";
  if (lastmod) {
    const date = new Date(lastmod);
    if (!isNaN(date.getTime())) {
      lastmodTag = `<lastmod>${date.toISOString().split("T")[0]}</lastmod>`;
    }
  }
  return `<url><loc>${escapeXml(loc)}</loc>${lastmodTag}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  const [productsRes, postsRes] = await Promise.all([
    fetchJson("products"),
    fetchJson("posts?limit=1000&skip=0&includeDrafts=false"),
  ]);

  const products = productsRes.products || productsRes || [];
  const posts = (postsRes.posts || postsRes || []).filter(
    (p) => p.slug && p.isDraft !== true && !p.deletedAt
  );

  const today = new Date().toISOString().split("T")[0];
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Trang tĩnh
  for (const { path, changefreq, priority } of STATIC_PATHS) {
    const loc = path ? `${BASE_URL}/${path}` : BASE_URL;
    xml += urlElement(loc, today, changefreq, priority);
  }

  // Sản phẩm
  for (const p of products) {
    if (p.slug) {
      xml += urlElement(
        `${BASE_URL}/san-pham/${encodeURIComponent(p.slug)}`,
        p.updatedAt || p.createdAt,
        "weekly",
        "0.8"
      );
    }
  }

  // Bài viết
  for (const p of posts) {
    if (p.slug) {
      xml += urlElement(
        `${BASE_URL}/bai-viet/${encodeURIComponent(p.slug)}`,
        p.updatedAt || p.createdAt,
        "weekly",
        "0.7"
      );
    }
  }

  xml += "</urlset>";

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate");
  res.status(200).send(xml);
}
