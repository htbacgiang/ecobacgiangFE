import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";
import Editor, { FinalPost } from "../../../components/editor";
import AdminLayout from "../../../components/layout/AdminLayout";
import { generateFormData } from "../../../utils/helper";
import { Heading } from "../../../components/admin/dashboard";
interface Props {}

const Create: NextPage<Props> = () => {
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const handleSubmit = async (post: FinalPost) => {
    setCreating(true);
    try {
      // we have to generate FormData
      const formData = generateFormData(post);

      // submit our post
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
      
      const response = await fetch(`${apiBaseUrl}/posts`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: Failed to create post`);
      }
      
      const data = await response.json();
      toast.success("Bài viết mới đã được tạo thành công!");
      // Chuyển sang trang danh sách bài viết
      router.push("/dashboard/bai-viet");
    } catch (error: any) {
      console.error("Error creating post:", error);
      const errorMessage = error.message || "Có lỗi xảy ra khi tạo bài viết mới!";
      toast.error(errorMessage);
    }
    setCreating(false);
  };
  return (
    <AdminLayout title="Thêm bài viết mới">
      <div className="add-post-container">
        <div className="add-post-content">
          <Editor onSubmit={handleSubmit} busy={creating} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Create;
