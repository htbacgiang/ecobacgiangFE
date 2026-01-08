import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

// TypeScript-like interface for type safety
const Coupon = {
  _id: String,
  coupon: String,
  startDate: String,
  endDate: String,
  discount: Number,
};

const CouponForm = () => {
  const [coupon, setCoupon] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [discount, setDiscount] = useState("");
  const [globalUsageLimit, setGlobalUsageLimit] = useState("");
  const [perUserUsageLimit, setPerUserUsageLimit] = useState("");
  const [loading, setLoading] = useState(false);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Format date utility
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Fetch coupons
  const fetchCoupons = async () => {
    setCouponsLoading(true);
    try {
      // Chỉ dùng Server API
      const { couponService } = await import("../../lib/api-services");
      const response = await couponService.getAll();
      setCoupons(response.coupons || response || []);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi lấy danh sách phiếu giảm giá");
    } finally {
      setCouponsLoading(false);
    }
  };

  // Auto-fetch coupons on mount
  useEffect(() => {
    fetchCoupons();
  }, []);

  // Handle edit
  const handleEdit = (couponData) => {
    setEditingId(couponData._id);
    setCoupon(couponData.coupon);
    setDiscount(String(couponData.discount));
    setStartDate(formatDateForInput(couponData.startDate));
    setEndDate(formatDateForInput(couponData.endDate));
    setGlobalUsageLimit(couponData.globalUsageLimit == null ? "" : String(couponData.globalUsageLimit));
    setPerUserUsageLimit(couponData.perUserUsageLimit == null ? "" : String(couponData.perUserUsageLimit));
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditingId(null);
    setCoupon("");
    setStartDate("");
    setEndDate("");
    setDiscount("");
    setGlobalUsageLimit("");
    setPerUserUsageLimit("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Input validation
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }
    if (Number(discount) <= 0 || Number(discount) > 100) {
      toast.error("Giảm giá phải từ 1 đến 100");
      return;
    }
    const globalLimitNum = globalUsageLimit === "" ? null : Number(globalUsageLimit);
    const perUserLimitNum = perUserUsageLimit === "" ? null : Number(perUserUsageLimit);
    if (globalLimitNum != null && (!Number.isFinite(globalLimitNum) || globalLimitNum < 0)) {
      toast.error("Số lượng mã (global) phải là số >= 0 hoặc để trống");
      return;
    }
    if (perUserLimitNum != null && (!Number.isFinite(perUserLimitNum) || perUserLimitNum < 0)) {
      toast.error("Số lượt / user phải là số >= 0 hoặc để trống");
      return;
    }

    setLoading(true);
    try {
      const { couponService } = await import("../../lib/api-services");
      
      if (editingId) {
        // Update existing coupon
        await couponService.update(editingId, {
          coupon,
          startDate,
          endDate,
          discount: Number(discount),
          globalUsageLimit: globalUsageLimit === "" ? null : Number(globalUsageLimit),
          perUserUsageLimit: perUserUsageLimit === "" ? null : Number(perUserUsageLimit),
        });
        toast.success("Cập nhật mã giảm giá thành công!");
      } else {
        // Create new coupon
        await couponService.create({
          coupon,
          startDate,
          endDate,
          discount: Number(discount),
          globalUsageLimit: globalUsageLimit === "" ? null : Number(globalUsageLimit),
          perUserUsageLimit: perUserUsageLimit === "" ? null : Number(perUserUsageLimit),
        });
        toast.success("Tạo mã giảm giá thành công!");
      }
      
      // Reset form
      setCoupon("");
      setStartDate("");
      setEndDate("");
      setDiscount("");
      setGlobalUsageLimit("");
      setPerUserUsageLimit("");
      setEditingId(null);
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || (editingId ? "Lỗi khi cập nhật mã giảm giá" : "Lỗi khi tạo mã giảm giá"));
    } finally {
      setLoading(false);
    }
  };

  // Handle coupon deletion
  const handleDelete = async (couponId) => {
    try {
      // Chỉ dùng Server API
      const { couponService } = await import("../../lib/api-services");
      await couponService.delete(couponId);
      toast.success("Đã xóa phiếu giảm giá!");
      fetchCoupons();
    } catch (error) {
      toast.error("Lỗi khi xóa phiếu giảm giá");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Quản lý mã giảm giá</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tạo và quản lý các mã giảm giá</p>
      </div>

      {/* Form Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
            <svg className={`w-4 h-4 ${editingId ? 'text-blue-500' : 'text-green-500'} mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {editingId ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              )}
            </svg>
            {editingId ? "Sửa mã giảm giá" : "Tạo mã giảm giá mới"}
          </h3>
          {editingId && (
            <button
              onClick={handleCancel}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              Hủy
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Mã giảm giá
            </label>
            <div className="relative">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                placeholder="Nhập mã..."
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Giảm giá (%)
            </label>
            <div className="relative">
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                placeholder="1-100"
                min="1"
                max="100"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Ngày bắt đầu
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Ngày kết thúc
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Số lượng mã có thể áp dụng (Global)
            </label>
            <input
              type="number"
              value={globalUsageLimit}
              onChange={(e) => setGlobalUsageLimit(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              placeholder="Để trống = không giới hạn"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Số lượt áp dụng tối đa / user
            </label>
            <input
              type="number"
              value={perUserUsageLimit}
              onChange={(e) => setPerUserUsageLimit(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              placeholder="Để trống = không giới hạn"
              min="0"
            />
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`${editingId ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'} text-white text-sm font-medium py-2 px-4 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {editingId ? "Đang cập nhật..." : "Đang tạo..."}
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {editingId ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  )}
                </svg>
                {editingId ? "Cập nhật mã giảm giá" : "Tạo mã giảm giá"}
              </div>
            )}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-700 dark:text-gray-200 text-sm font-medium py-2 px-4 rounded-md transition-all duration-200"
            >
              Hủy
            </button>
          )}
        </div>
      </div>

      {/* Coupons List Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-gray-50 dark:bg-slate-700 px-4 py-2.5 border-b border-gray-200 dark:border-slate-600">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Danh sách mã giảm giá ({coupons.length})
          </h3>
        </div>

        {couponsLoading ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-full mb-3">
              <svg className="animate-spin h-5 w-5 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có mã giảm giá nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {coupons.map((c) => (
              <div key={c._id} className="p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-2 py-0.5 rounded">
                        {c.discount}%
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                        {c.coupon}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <svg className="w-3.5 h-3.5 text-green-500 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(c.startDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-3.5 h-3.5 text-red-500 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(c.endDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-700">
                          Global: {c.globalUsageLimit == null ? "∞" : c.globalUsageLimit} | Used: {c.usedCount || 0} | Reserved: {c.reservedCount || 0}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-700">
                          /User: {c.perUserUsageLimit == null ? "∞" : c.perUserUsageLimit}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(c)}
                      className="flex-shrink-0 p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-all group"
                      title="Sửa"
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="flex-shrink-0 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all group"
                      title="Xóa"
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponForm;