// components/OrderDetailsPopup.jsx
import React from "react";
import Image from "next/image";
import { X, Package, Calendar, Clock, CreditCard, MapPin, Phone, User, Truck } from "lucide-react";

export default function OrderDetailsPopup({ order, onClose }) {
  const itemsSubtotal = Array.isArray(order?.orderItems)
    ? order.orderItems.reduce(
        (sum, item) => sum + (Number(item?.price) || 0) * (Number(item?.quantity) || 0),
        0
      )
    : 0;

  const discountPercent = Number(order?.discount) || 0; // đang dùng theo %
  const shippingFee = Number(order?.shippingFee) || 0;
  const discountAmount = (itemsSubtotal * discountPercent) / 100;
  const computedFinalTotal = Math.max(0, itemsSubtotal - discountAmount) + shippingFee;
  if (!order) return null;

  const formatCurrency = (amount) => {
    return amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 mt-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Chi tiết đơn hàng</h3>
                <p className="text-sm text-green-600 font-medium">Mã: {order._id.slice(-8)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 bg-white rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 shadow-sm"
              aria-label="Đóng popup"
            >
              <X className="w-7 h-7 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-2xl p-2 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 text-green-600 mr-2" />
                  Sản phẩm đã đặt
                </h4>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {order.orderItems.map((item, index) => (
                    <div key={item._id || item.id} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-green-300 transition-colors duration-200">
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <Image
                            src={item.image || "/path/to/fallback-image.jpg"}
                            alt={item.title}
                            width={80}
                            height={80}
                            className="rounded-xl object-cover border border-gray-200"
                            unoptimized={item.image?.startsWith("http")}
                          />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">{item.title}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Đơn giá:</span>
                              <span className="ml-2 font-medium text-gray-900">{formatCurrency(item.price)}</span>
                            </div>
                          </div>
                          <div className="mt-1 border-t border-gray-100">
                            <span className="text-gray-500">Thành tiền:</span>
                            <span className="ml-2 text-lg font-bold text-green-600">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Tóm tắt đơn hàng</h4>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tổng tiền hàng:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(itemsSubtotal || order.subtotal || 0)}
                    </span>
                  </div>
                  {Number(order.discount) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Giảm giá:</span>
                      <span className="font-medium text-red-600">-{Number(order.discount)}%</span>
                    </div>
                  )}
                  {order.shippingFee > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Phí vận chuyển:</span>
                      <span className="font-medium text-gray-900">{formatCurrency(order.shippingFee)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Tổng thanh toán:</span>
                      <span className="text-2xl font-bold text-green-600">{formatCurrency(computedFinalTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Info Sidebar */}
            <div className="space-y-6 hidden md:block">
              {/* Order Status */}
              <div className="bg-white rounded-2xl p-4 border-2 border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Truck className="w-5 h-5 text-green-600 mr-2" />
                  Trạng thái đơn hàng
                </h4>
                <div className="text-center">
                  <div className={`inline-flex items-center px-4 rounded-full text-sm font-medium ${order.orderStatusColors?.[order.status] || 'bg-gray-100 text-gray-800'}`}>
                    {order.orderStatusText?.[order.status] || order.status}
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-white rounded-2xl p-4 border-2 border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Thông tin đơn hàng</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Ngày đặt</p>
                      <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Giờ đặt</p>
                      <p className="font-medium text-gray-900">{formatTime(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phương thức</p>
                      <p className="font-medium text-gray-900">{order.paymentMethodText?.[order.paymentMethod] || order.paymentMethod}</p>
                    </div>
                  </div>
                  {order.deliveryTime && (
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Thời gian giao hàng</p>
                        <p className="font-medium text-gray-900">
                          {order.deliveryTime === 'business_hours' 
                            ? 'Giờ hành chính (8h - 17h)'
                            : order.deliveryTime === '17-18'
                            ? '17h - 18h'
                            : order.deliveryTime === '18-19'
                            ? '18h - 19h'
                            : order.deliveryTime === '19-20'
                            ? '19h - 20h'
                            : order.deliveryTime}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

 
      </div>
    </div>
  );
}
