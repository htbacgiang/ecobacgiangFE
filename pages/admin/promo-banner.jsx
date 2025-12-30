import { useState, useEffect } from "react";
import Head from "next/head";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PromoBannerAdmin() {
  const [formData, setFormData] = useState({
    countdownDate: "",
    subtitle: "",
    title: "",
    description: "",
    countdownLabel: "",
    buttonText: "",
    buttonLink: "",
    backgroundImage: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_SERVER_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/promo-banner`);
      if (response.ok) {
        const data = await response.json();
        // Format date cho input datetime-local
        const countdownDate = data.countdownDate
          ? new Date(data.countdownDate).toISOString().slice(0, 16)
          : "";
        
        setFormData({
          countdownDate,
          subtitle: data.subtitle || "",
          title: data.title || "",
          description: data.description || "",
          countdownLabel: data.countdownLabel || "",
          buttonText: data.buttonText || "",
          buttonLink: data.buttonLink || "",
          backgroundImage: data.backgroundImage || "",
          isActive: data.isActive !== undefined ? data.isActive : true,
        });
        setPreviewImage(data.backgroundImage || "");
      }
    } catch (error) {
      console.error("Error fetching config:", error);
      toast.error("Không thể tải cấu hình");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Cập nhật preview image khi thay đổi
    if (name === "backgroundImage") {
      setPreviewImage(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_SERVER_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/promo-banner`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Cập nhật thành công!");
      } else {
        toast.error(data.error || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("Error updating config:", error);
      toast.error("Có lỗi xảy ra khi cập nhật!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Quản lý Promo Banner - Eco Bắc Giang</title>
      </Head>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />

      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Quản lý Promo Banner
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Ngày giờ countdown */}
              <div>
                <label
                  htmlFor="countdownDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Ngày giờ kết thúc khuyến mãi
                </label>
                <input
                  type="datetime-local"
                  id="countdownDate"
                  name="countdownDate"
                  value={formData.countdownDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label
                  htmlFor="subtitle"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phụ đề (Subtitle)
                </label>
                <input
                  type="text"
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Khám phá Eco Bắc Giang"
                />
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tiêu đề chính (Title)
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ưu đãi mua rau củ hữu cơ"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mô tả (Description)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Sản phẩm sạch – tươi ngon từ nông trại của chúng tôi"
                />
              </div>

              {/* Countdown Label */}
              <div>
                <label
                  htmlFor="countdownLabel"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nhãn countdown
                </label>
                <input
                  type="text"
                  id="countdownLabel"
                  name="countdownLabel"
                  value={formData.countdownLabel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Thời gian khuyến mãi còn lại"
                />
              </div>

              {/* Button Text */}
              <div>
                <label
                  htmlFor="buttonText"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Text nút bấm
                </label>
                <input
                  type="text"
                  id="buttonText"
                  name="buttonText"
                  value={formData.buttonText}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Mua ngay"
                />
              </div>

              {/* Button Link */}
              <div>
                <label
                  htmlFor="buttonLink"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Link nút bấm
                </label>
                <input
                  type="text"
                  id="buttonLink"
                  name="buttonLink"
                  value={formData.buttonLink}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="# hoặc URL"
                />
              </div>

              {/* Background Image */}
              <div>
                <label
                  htmlFor="backgroundImage"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Hình ảnh nền (URL hoặc đường dẫn)
                </label>
                <input
                  type="text"
                  id="backgroundImage"
                  name="backgroundImage"
                  value={formData.backgroundImage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="/banner.png hoặc https://..."
                />
                {previewImage && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <div
                      className="w-full h-48 rounded-lg border border-gray-300 bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: `url('${previewImage}')` }}
                    />
                  </div>
                )}
              </div>

              {/* Is Active */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Hiển thị banner
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={fetchConfig}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

