import { FinalPost } from "../components/editor";
import { PostDetail } from "./types";

export const generateFormData = (post: FinalPost) => {
  const formData = new FormData();
  for (let key in post) {
    const value = (post as any)[key];
    if (value === undefined) continue;
    if (key === "tags" && typeof value === "string" && value.trim()) {
      const tags = value.split(",").map((tag: string) => tag.trim());
      formData.append("tags", JSON.stringify(tags));
    } else if (key === "isFeatured") {
      formData.append(key, value === true ? "true" : "false");
    } else {
      formData.append(key, value);
    }
  }
  return formData;
};

export const filterPosts = (posts: PostDetail[], postToFilter: PostDetail) => {
  return posts.filter((post) => {
    return post.id !== postToFilter.id;
  });
};

export const trimText = (text: string, trimBy: number) => {
  if (text.length <= trimBy) return text;
  return text.substring(0, trimBy).trim() + "...";
};

/** Loại bỏ HTML, trả về số ký tự văn bản thuần */
const stripHtml = (html: string): string => {
  if (!html || typeof html !== "string") return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

/**
 * Ước tính thời gian đọc (phút) theo số ký tự.
 * Trung bình ~400 ký tự/phút cho tiếng Việt.
 */
export const getReadingTimeMinutes = (htmlOrText: string): number => {
  const text = stripHtml(htmlOrText);
  if (!text.length) return 1;
  return Math.max(1, Math.ceil(text.length / 400));
};
