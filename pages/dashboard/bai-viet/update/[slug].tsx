import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { useState } from "react";
import { toast } from "react-toastify";
import Editor, { FinalPost } from "../../../../components/editor";
import AdminLayout from "../../../../components/layout/AdminLayout";
import { generateFormData } from "../../../../utils/helper";

interface PostResponse extends FinalPost {
  id: string;
}

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

const Update: NextPage<Props> = ({ post }) => {
  const [updating, setUpdating] = useState(false);

  // Debug props to confirm values
  console.log("Update page props:", { post, btnTitle: "Cập nhật" });

  const handleSubmit = async (post: FinalPost) => {
    setUpdating(true);
    try {
      const formData = generateFormData(post);
      // Chỉ dùng Server API
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
      if (!apiBaseUrl) {
        throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
      }
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      // KHÔNG set Content-Type khi dùng FormData - browser sẽ tự động set với boundary
      
      const response = await fetch(`${apiBaseUrl}/posts/${post.id}`, {
        method: 'PUT',
        headers: headers,
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: Failed to update post`);
      }
      
      const data = await response.json();
      console.log("Update response:", data);
      toast.success("Cập nhật bài viết thành công!");
      // Có thể redirect về danh sách hoặc giữ nguyên trang
    } catch (error: any) {
      console.error("Update error:", error);
      const errorMessage = error.message || "Cập nhật bài viết thất bại";
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AdminLayout title="Cập nhật bài viết">
      <div className="max-w-10/12 mx-auto">
        <Editor
          initialValue={post}
          onSubmit={handleSubmit}
          busy={updating}
          btnTitle="Cập nhật"
        />
      </div>
    </AdminLayout>
  );
};

interface ServerSideResponse {
  post: PostResponse;
}

export const getServerSideProps: GetServerSideProps<ServerSideResponse> = async (
  context
): Promise<{ props: ServerSideResponse } | { notFound: true }> => {
  try {
    const slug = context.query.slug as string;
    const apiUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
    if (!apiUrl) {
      console.error("NEXT_PUBLIC_API_SERVER_URL is not set");
      return { notFound: true };
    }

    const res = await fetch(`${apiUrl}/posts/${encodeURIComponent(slug)}`);
    if (!res.ok) return { notFound: true };

    const data = await res.json();
    const post = data.post;
    if (!post) return { notFound: true };

    const tagsStr = Array.isArray(post.tags) ? post.tags.join(", ") : (post.tags || "");
    const thumbnailUrl = post.thumbnail?.url ?? post.thumbnail ?? "";

    return {
      props: {
        post: {
          id: post._id?.toString() || post.id || "",
          title: post.title || "",
          content: post.content || "",
          tags: tagsStr,
          thumbnail: thumbnailUrl,
          slug: post.slug || slug,
          category: post.category || "",
          meta: post.meta || "",
          focusKeyword: "",
          isFeatured: post.isFeatured === true,
        },
      },
    };
  } catch (error) {
    console.error("getServerSideProps error:", error);
    return { notFound: true };
  }
};

export default Update;