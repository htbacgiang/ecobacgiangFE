import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next";
import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import AdminLayout from "../../../components/layout/AdminLayout";
import DashboardPostCard from "../../../components/common/DashboardPostCard";
import Pagination from "../../../components/common/Pagination";
import { formatPosts } from "../../../lib/utils";
import { PostDetail } from "../../../utils/types";
import styles from "../../../styles/posts.module.css";

const limit = 12; // Số bài viết mỗi trang

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

const Posts: NextPage<Props> = ({ initialPosts, totalPages }) => {
  const [posts, setPosts] = useState<PostDetail[]>(initialPosts);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Hàm xử lý đổi trang (server-side pagination)
  const handlePageChange = async (page: number) => {
    try {
      setIsLoading(true);
      setCurrentPage(page);
      const skip = (page - 1) * limit;
      // Chỉ dùng Server API
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL || 'https://ecobacgiang.vn/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${apiBaseUrl}/posts?limit=${limit}&skip=${skip}&includeDrafts=true`, {
        method: 'GET',
        headers: headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch posts`);
      }
      
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu!");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý xoá bài viết theo postId
  const handleDelete = async (postId: string) => {
    try {
      // Chỉ dùng Server API
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL || 'https://ecobacgiang.vn/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${apiBaseUrl}/posts/${postId}`, {
        method: 'DELETE',
        headers: headers,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: Failed to delete post`);
      }
      
      const data = await response.json();
      
      if (data.removed) {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
        toast.success("Bài viết đã được xóa thành công!");
      } else {
        toast.error("Có lỗi xảy ra khi xóa bài viết!");
      }
    } catch (error: any) {
      console.error("Error deleting post:", error);
      const errorMessage = error.message || "Có lỗi xảy ra khi xóa bài viết!";
      toast.error(errorMessage);
    }
  };

  // Xử lý chuyển đổi trạng thái nháp/công khai
  // isDraft là giá trị MỚI (đã được toggle trong DashboardPostCard)
  const handleToggleStatus = async (postId: string, isDraft: boolean) => {
    try {
      // Chỉ dùng Server API
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL || 'https://ecobacgiang.vn/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // isDraft đã là giá trị mới, không cần toggle lại
      const response = await fetch(`${apiBaseUrl}/posts/${postId}/status`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ isDraft }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: Failed to update post`);
      }
      
      const data = await response.json();
      
      // Update local state với giá trị mới
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, isDraft } : post
        )
      );
      // Thông báo đúng: nếu isDraft = false thì đã công khai, nếu isDraft = true thì đã chuyển thành nháp
      toast.success(`Bài viết đã được ${isDraft ? 'chuyển thành nháp' : 'công khai'}!`);
    } catch (error: any) {
      console.error("Error toggling post status:", error);
      const errorMessage = error.message || "Có lỗi xảy ra khi cập nhật trạng thái!";
      toast.error(errorMessage);
    }
  };

  // Lọc bài viết theo search term
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hàm xử lý chuyển đến trang thêm bài viết mới
  const handleAddNewPost = () => {
    router.push("/dashboard/them-bai-viet");
  };


  return (
    <AdminLayout>
      <div className={styles.postsContainer}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Quản lý bài viết</h1>
          <p className={styles.subtitle}>
            Quản lý và tổ chức nội dung website của bạn
            <span className={styles.postCount}>
              ({posts.length} bài viết trên trang {currentPage} / {totalPages} trang)
            </span>
          </p>
        </div>

        {/* Actions Bar */}
        <div className={styles.actionsBar}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className={styles.addButton} onClick={handleAddNewPost}>
            <span>+</span>
            Thêm bài viết mới
          </button>
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <h3 className={styles.emptyTitle}>Không có bài viết nào</h3>
            <p className={styles.emptyDescription}>
              {searchTerm ? 'Không tìm thấy bài viết phù hợp với từ khóa tìm kiếm.' : 'Bắt đầu tạo bài viết đầu tiên của bạn.'}
            </p>
            <button className={styles.addButton} onClick={handleAddNewPost}>
              <span>+</span>
              Tạo bài viết mới
            </button>
          </div>
        ) : (
          <div className={styles.postsGrid}>
            {filteredPosts.map((post) => (
              <DashboardPostCard
                key={post.slug}
                post={post}
                onDeleteClick={() => handleDelete(post.id)}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}

        {/* Pagination Info & Controls */}
        {totalPages > 1 && (
          <div className={styles.paginationSection}>
            <div className={styles.paginationInfo}>
              <span>Trang {currentPage} / {totalPages}</span>
              <span>•</span>
              <span>{posts.length} bài viết trên trang này</span>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps<{
  initialPosts: PostDetail[];
  totalPages: number;
}> = async (context) => {
  try {
    // Lấy dữ liệu từ Server API
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL || 'https://ecobacgiang.vn/api';
    
    // Lấy token từ cookie hoặc header nếu có
    const token = context.req.headers.cookie?.match(/token=([^;]+)/)?.[1] || null;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Lấy bài viết đầu tiên với limit
    const response = await fetch(`${apiBaseUrl}/posts?limit=${limit}&skip=0&includeDrafts=true`, {
      method: 'GET',
      headers: headers,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch posts`);
    }
    
    const data = await response.json();
    const posts = data.posts || [];
    
    // Tính totalPages: nếu API trả về total thì dùng, nếu không thì gọi API với limit lớn để đếm
    let totalPosts = data.total;
    if (!totalPosts) {
      // Nếu không có total, gọi API với limit lớn để lấy tất cả và đếm
      const allPostsResponse = await fetch(`${apiBaseUrl}/posts?limit=10000&skip=0&includeDrafts=true`, {
        method: 'GET',
        headers: headers,
      });
      if (allPostsResponse.ok) {
        const allData = await allPostsResponse.json();
        totalPosts = allData.posts?.length || allData.total || posts.length;
      } else {
        // Fallback: giả sử có nhiều hơn limit nếu số posts trả về = limit
        totalPosts = posts.length === limit ? limit + 1 : posts.length;
      }
    }
    
    const totalPages = Math.ceil(totalPosts / limit);
    
    // Format posts nếu cần
    const formattedPosts = formatPosts(posts);

    return {
      props: {
        initialPosts: formattedPosts,
        totalPages,
      },
    };
  } catch (error) {
    console.error('Error fetching posts in getServerSideProps:', error);
    // Trả về empty data thay vì notFound để trang vẫn load được
    return {
      props: {
        initialPosts: [],
        totalPages: 0,
      },
    };
  }
};

export default Posts;
