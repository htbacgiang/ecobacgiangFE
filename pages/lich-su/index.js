import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import db from "../../utils/db";
import Order from "../../models/Order";
import DefaultLayout from "../../components/layout/DefaultLayout";
import OrderDetailsPopup from "../../components/users/OrderDetailsPopup";
import { paymentMethodText, orderStatusText, orderStatusColors } from "../../utils/mappings";
import { Package, Calendar, Clock, CreditCard, Eye, ShoppingBag } from "lucide-react";

function formatCurrency(amount) {
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
}

export default function OrderHistory({ orders: initialOrders }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders || []);
  const [filteredOrders, setFilteredOrders] = useState(initialOrders || []);
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const ordersPerPage = 10;

  useEffect(() => {
    applyFilter(orders, filterType);
  }, [filterType, orders]);

  const applyFilter = (ordersList, filter) => {
    if (filter === 'all') {
      setFilteredOrders(ordersList);
      setCurrentPage(1);
      return;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let filtered = [];

    switch (filter) {
      case 'today':
        filtered = ordersList.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= today;
        });
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = ordersList.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= weekAgo;
        });
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = ordersList.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= monthAgo;
        });
        break;
      default:
        filtered = ordersList;
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter) => {
    setFilterType(filter);
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  return (
    <DefaultLayout>
      <Head>
        <title>Lịch sử đơn hàng | Eco Bắc Giang</title>
        <meta name="description" content="Xem lịch sử đơn hàng của bạn tại Eco Bắc Giang" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Lịch sử đơn hàng
              </h1>
            </div>
            <p className="text-gray-600 ml-4">Theo dõi và quản lý đơn hàng của bạn</p>
          </div>

          {/* Filter Buttons */}
          {orders.length > 0 && (
            <div className="mb-6 bg-white rounded-2xl p-4 shadow-lg border border-green-100">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                    filterType === 'all'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Package className={`w-4 h-4 ${filterType === 'all' ? 'text-white' : 'text-gray-600'}`} />
                  <span>Tất cả ({orders.length})</span>
                </button>
                <button
                  onClick={() => handleFilterChange('today')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                    filterType === 'today'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Calendar className={`w-4 h-4 ${filterType === 'today' ? 'text-white' : 'text-gray-600'}`} />
                  <span>Hôm nay</span>
                </button>
                <button
                  onClick={() => handleFilterChange('week')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                    filterType === 'week'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Clock className={`w-4 h-4 ${filterType === 'week' ? 'text-white' : 'text-gray-600'}`} />
                  <span>Tuần này</span>
                </button>
                <button
                  onClick={() => handleFilterChange('month')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                    filterType === 'month'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Calendar className={`w-4 h-4 ${filterType === 'month' ? 'text-white' : 'text-gray-600'}`} />
                  <span>Tháng này</span>
                </button>
              </div>
            </div>
          )}

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-green-100 text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Chưa có đơn hàng</h3>
              <p className="text-gray-600 mb-8">Bạn chưa có đơn hàng nào. Hãy mua sắm để tạo đơn hàng đầu tiên!</p>
              <Link 
                href="/san-pham" 
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Mua sắm ngay
              </Link>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-green-100 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Không có đơn hàng</h3>
              <p className="text-gray-600">Không có đơn hàng trong khoảng thời gian này. Vui lòng chọn khoảng thời gian khác.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl border border-green-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-200">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Package className="w-6 h-6 text-green-600 mr-3" />
                  Danh sách đơn hàng ({filteredOrders.length})
                </h3>
              </div>

              {/* Orders */}
              <div className="p-6">
                <div className="space-y-4">
                  {currentOrders.map((order, index) => (
                    <div 
                      key={order._id} 
                      className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-green-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Order Info */}
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
                                <span className="text-green-700 font-bold text-lg">#{index + 1 + indexOfFirstOrder}</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-lg text-gray-900 group-hover:text-green-700 transition-colors duration-300">
                                  Đơn hàng {order._id.slice(-8)}
                                </h4>
                                <p className="text-sm text-gray-500 font-medium">Mã đơn hàng</p>
                              </div>
                            </div>
                            <div className={`px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all duration-300 ${
                              order.status === 'pending' ? 'text-yellow-700 bg-yellow-50' :
                              order.status === 'paid' ? 'text-green-700 bg-green-50' :
                              order.status === 'shipped' ? 'text-blue-700 bg-blue-50' :
                              order.status === 'delivered' ? 'text-gray-700 bg-gray-50' :
                              order.status === 'cancelled' ? 'text-red-700 bg-red-50' :
                              'text-gray-700 bg-gray-50'
                            }`}>
                              {orderStatusText[order.status] || order.status}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Ngày đặt */}
                            <div className="flex items-center space-x-3">
                              <Calendar className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Ngày đặt</p>
                                <p className="font-medium text-gray-900">
                                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                                </p>
                              </div>
                            </div>
                            
                            {/* Giờ đặt */}
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
                            
                            {/* Thanh toán */}
                            <div className="flex items-center space-x-3">
                              <CreditCard className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Thanh toán</p>
                                <p className="font-medium text-gray-900">
                                  {paymentMethodText[order.paymentMethod] || order.paymentMethod}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-500">Phí vận chuyển:</span>
                                <span className="text-sm font-medium text-gray-700">
                                  {formatCurrency(order.shippingFee || 0)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">Tổng thanh toán:</span>
                                <span className="text-xl font-bold text-green-600">
                                  {formatCurrency(order.finalTotal)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => {
                              // Chuẩn bị order data với đầy đủ thông tin cho popup
                              const orderForPopup = {
                                ...order,
                                paymentMethodText,
                                orderStatusText,
                                orderStatusColors,
                                subtotal: order.totalPrice || 0,
                                customerInfo: {
                                  fullName: order.name || '',
                                  phone: order.phone || '',
                                  address: order.shippingAddress?.address || order.shippingAddress || ''
                                }
                              };
                              setSelectedOrder(orderForPopup);
                            }}
                            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Chi tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex justify-center items-center space-x-2 flex-wrap">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                        aria-label="Trang trước"
                      >
                        ← Trước
                      </button>
                      
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-4 py-2 border-2 rounded-xl font-medium transition-all duration-200 ${
                            currentPage === i + 1 
                              ? "border-green-600 bg-green-600 text-white shadow-md" 
                              : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                        aria-label="Trang sau"
                      >
                        Sau →
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
        </div>
      </div>
    </DefaultLayout>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  await db.connectDb();
  const orders = await Order.find({ user: session.user.id }).lean();

  // Làm sạch dữ liệu để đảm bảo JSON-serializable
  const ordersCleaned = orders.map((order) => ({
    ...order,
    _id: order._id.toString(),
    user: order.user ? order.user.toString() : null,
    createdAt: order.createdAt.toString(),
    orderItems: order.orderItems.map((item) => ({
      ...item,
      _id: item._id ? item._id.toString() : null,
      product:
        item.product && typeof item.product === "object" && item.product._id
          ? item.product._id.toString()
          : item.product
          ? item.product.toString()
          : null,
    })),
  }));

  return {
    props: { orders: ordersCleaned },
  };
}
