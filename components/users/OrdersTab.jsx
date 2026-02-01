import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import Link from "next/link";
import { toast } from "react-hot-toast";
import OrderDetailsPopup from "./OrderDetailsPopup";
import { paymentMethodText, orderStatusText, orderStatusColors } from "../../utils/mappings";
import { Package, Calendar, Clock, CreditCard, Eye, X } from "lucide-react";

function formatCurrency(amount) {
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
}

export default function OrdersTab() {
  const { user, status } = useAuth();
  const userId = user?.id;
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // Lưu tất cả orders để filter
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmCancelOrderId, setConfirmCancelOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('all'); // 'all', 'today', 'week', 'month'

  const ordersPerPage = 5;
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const ordersContainerRef = useRef(null);

  useEffect(() => {
    // Scroll to top when page changes
    if (ordersContainerRef.current) {
      ordersContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  const fetchOrders = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Chỉ dùng Server API
      const { orderService } = await import("../../lib/api-services");
      const response = await orderService.getAll();
      const sortedOrders = (response.orders || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setAllOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Có lỗi khi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (status === "authenticated" && userId) fetchOrders();
  }, [status, userId, fetchOrders]);

  useEffect(() => {
    applyFilter(allOrders, filterType);
  }, [allOrders, filterType]);

  const handleCancelOrder = async (orderId) => {
    try {
      // Chỉ dùng Server API
      const { orderService } = await import("../../lib/api-services");
      await orderService.cancel(orderId);
      toast.success("Đơn hàng đã bị hủy.");
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      const errorMessage = error.response?.data?.error || error.message || "Có lỗi khi hủy đơn hàng";
      toast.error(errorMessage);
    }
  };

  const confirmCancel = async () => {
    if (!confirmCancelOrderId) return;
    await handleCancelOrder(confirmCancelOrderId);
    setConfirmCancelOrderId(null);
  };

  const applyFilter = (ordersList, filter) => {
    if (filter === 'all') {
      setOrders(ordersList);
      setCurrentPage(1);
      return;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let filteredOrders = [];

    switch (filter) {
      case 'today':
        filteredOrders = ordersList.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= today;
        });
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredOrders = ordersList.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= weekAgo;
        });
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filteredOrders = ordersList.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= monthAgo;
        });
        break;
      default:
        filteredOrders = ordersList;
    }

    setOrders(filteredOrders);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter) => {
    setFilterType(filter);
  };

  if (!user) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h3>
          <p className="text-gray-600">Đăng nhập để xem đơn hàng của bạn</p>
        </div>
      </div>
    );
  }

  return (
           <div className="p-0 md:px-3 md:py-6">
      <div className="md:hidden mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Đơn hàng của tôi</h2>
        <p className="text-gray-600">Quản lý và theo dõi đơn hàng</p>
      </div>

      {/* Filter Buttons */}
      {!loading && allOrders.length > 0 && (
        <div className="mb-6 bg-white rounded-2xl p-4 shadow-md border border-gray-100">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleFilterChange("all")}
              aria-pressed={filterType === "all"}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                filterType === "all"
                  ? "bg-green-600 text-white border-green-600 shadow-sm"
                  : "bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50"
              }`}
            >
              <Package className={`w-4 h-4 ${filterType === "all" ? "text-white" : "text-green-600"}`} />
              Tất cả
            </button>

            <button
              type="button"
              onClick={() => handleFilterChange("today")}
              aria-pressed={filterType === "today"}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                filterType === "today"
                  ? "bg-green-600 text-white border-green-600 shadow-sm"
                  : "bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50"
              }`}
            >
              <Calendar className={`w-4 h-4 ${filterType === "today" ? "text-white" : "text-green-600"}`} />
              Hôm nay
            </button>

            <button
              type="button"
              onClick={() => handleFilterChange("week")}
              aria-pressed={filterType === "week"}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                filterType === "week"
                  ? "bg-green-600 text-white border-green-600 shadow-sm"
                  : "bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50"
              }`}
            >
              <Clock className={`w-4 h-4 ${filterType === "week" ? "text-white" : "text-green-600"}`} />
              Tuần này
            </button>

            <button
              type="button"
              onClick={() => handleFilterChange("month")}
              aria-pressed={filterType === "month"}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                filterType === "month"
                  ? "bg-green-600 text-white border-green-600 shadow-sm"
                  : "bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50"
              }`}
            >
              <Package className={`w-4 h-4 ${filterType === "month" ? "text-white" : "text-green-600"}`} />
              Tháng này
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Đang tải đơn hàng...</h3>
          <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {allOrders.length === 0 ? 'Chưa có đơn hàng' : 'Không có đơn hàng trong khoảng thời gian này'}
          </h3>
          <p className="text-gray-600 mb-6">
            {allOrders.length === 0 
              ? 'Bạn chưa có đơn hàng nào. Hãy mua sắm để tạo đơn hàng đầu tiên!' 
              : 'Vui lòng chọn khoảng thời gian khác để xem đơn hàng.'}
          </p>
          {allOrders.length === 0 && (
            <Link 
              href="/san-pham" 
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors duration-200"
            >
              Mua sắm ngay
            </Link>
          )}
        </div>
      ) : (
        <div ref={ordersContainerRef} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Package className="w-6 h-6 text-green-600 mr-3" />
              Danh sách đơn hàng 
            </h3>
          </div>

          {/* Orders List */}
          <div className="p-3">
            <div className="space-y-4">
              {currentOrders.map((order, index) => (
                <div key={order._id} className="bg-white border-2 border-gray-100 rounded-3xl p-6 hover:border-green-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Order Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
                            <span className="text-green-700 font-bold text-lg">#{index + 1 + indexOfFirstOrder}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-gray-900 group-hover:text-green-700 transition-colors duration-300">Đơn hàng {order._id.slice(-8)}</h4>
                            <p className="text-sm text-gray-500 font-medium">Mã đơn hàng</p>
                          </div>
                        </div>
                        <div className={`self-start md:self-auto px-5 py-2.5 rounded-2xl text-sm font-semibold shadow-sm ${orderStatusColors[order.status]} transition-all duration-300 hover:scale-105`}>
                          {orderStatusText[order.status]}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Ngày đặt - Mobile: cùng hàng với giờ, Desktop: cột riêng */}
                        <div className="md:col-span-1 col-span-2">
                          <div className="md:block hidden">
                            <div className="flex items-center space-x-3">
                              <Calendar className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Ngày đặt</p>
                                <p className="font-medium text-gray-900">
                                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                                </p>
                              </div>
                            </div>
                          </div>
                          {/* Mobile: Ngày và giờ cùng hàng */}
                          <div className="md:hidden grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3">
                              <Calendar className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Ngày đặt</p>
                                <p className="font-medium text-gray-900">
                                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Clock className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Giờ đặt</p>
                                <p className="font-medium text-gray-900">
                                  {new Date(order.createdAt).toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Giờ đặt - Chỉ hiển thị trên Desktop */}
                        <div className="hidden md:flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Giờ đặt</p>
                            <p className="font-medium text-gray-900">
                              {new Date(order.createdAt).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        
                        {/* Thanh toán */}
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Thanh toán</p>
                            <p className="font-medium text-gray-900">
                              {paymentMethodText[order.paymentMethod]}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Tổng thanh toán:</span>
                          <span className="text-xl font-bold text-green-600">
                            {formatCurrency(order.finalTotal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
                        aria-label={`Xem chi tiết đơn hàng ${order._id}`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Chi tiết
                      </button>
                      {order.status === "pending" && (
                        <button
                          onClick={() => setConfirmCancelOrderId(order._id)}
                          className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 font-medium"
                          aria-label={`Hủy đơn hàng ${order._id}`}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Hủy đơn
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex justify-center items-center space-x-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(currentPage - 1);
                    }}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                    aria-label="Trang trước"
                  >
                    Trước
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => {
                        setCurrentPage(i + 1);
                      }}
                      className={`px-4 py-2 border-2 rounded-xl font-medium transition-all duration-200 ${
                        currentPage === i + 1 
                          ? "border-green-600 bg-green-600 text-white" 
                          : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                      }`}
                      aria-label={`Trang ${i + 1}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage(currentPage + 1);
                    }}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                    aria-label="Trang tiếp theo"
                  >
                    Tiếp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Details Popup */}
      {selectedOrder && (
        <OrderDetailsPopup
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Confirm Cancel Modal */}
      {confirmCancelOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận hủy đơn hàng</h3>
              <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.</p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setConfirmCancelOrderId(null)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium"
                  aria-label="Hủy thao tác"
                >
                  Không
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium"
                  aria-label="Xác nhận hủy đơn hàng"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}