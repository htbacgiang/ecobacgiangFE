// Client-side safe imports
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { PostDetail } from "../utils/types";

// Server-side types (chỉ dùng cho type checking, không import runtime)
import type { NextApiRequest } from "next";

// Dynamic import cho formidable - chỉ dùng ở server-side
export const readFile = async <T extends object>(
  req: NextApiRequest
): Promise<{ files: any; body: T }> => {
  // Dynamic import chỉ khi ở server-side
  if (typeof window !== 'undefined') {
    throw new Error('readFile can only be used server-side');
  }
  
  const formidable = await import('formidable');
  const form = formidable.default();
  
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ files, body: fields as T });
    });
  });
};

// readPostsFromDb đã được thay thế bằng Server API
// Giữ lại để tương thích ngược nếu cần, nhưng sẽ throw error
export const readPostsFromDb = async (
  limit: number,
  pageNo: number,
  skip?: number,
  includeDrafts: boolean = false
) => {
  throw new Error('readPostsFromDb is deprecated. Please use Server API instead.');
};

// formatPosts - Client-side safe, nhận bất kỳ object nào có các field tương ứng
// Có thể filter draft nếu cần
export const formatPosts = (posts: any[], excludeDrafts: boolean = false): PostDetail[] => {
  let filteredPosts = posts;
  
  // Filter drafts nếu excludeDrafts = true
  if (excludeDrafts) {
    filteredPosts = posts.filter((post) => {
      // Loại bỏ các bài viết có isDraft = true hoặc null/undefined (coi như draft)
      return post.isDraft !== true && post.isDraft !== null && post.isDraft !== undefined;
    });
  }
  
  return filteredPosts.map((post) => ({
    id: (post._id || post.id)?.toString() || '',
    title: post.title || '',
    slug: post.slug || '',
    category: post.category || '',
    createdAt: post.createdAt?.toString() || new Date().toISOString(),
    thumbnail: post.thumbnail?.url || post.thumbnail || "",
    meta: post.meta || '',
    tags: post.tags || [],
    isDraft: post.isDraft || false,
    isFeatured: post.isFeatured || false, // Bài viết nổi bật
  }));
};

// Removed getLikedByOwner - không còn dùng

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
