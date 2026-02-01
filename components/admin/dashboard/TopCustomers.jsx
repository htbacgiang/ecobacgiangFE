import Image from 'next/image';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Trash2 } from 'lucide-react';

export default function TopCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [mounted, setMounted] = useState(false);

  // Set mounted state for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch orders and aggregate by customer
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Chỉ dùng Server API
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
        if (!apiBaseUrl) {
          throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
        }
        
        // Lấy token từ localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        const headers = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${apiBaseUrl}/orders`, {
          method: 'GET',
          headers: headers,
        });
        
        if (!response.ok) throw new Error('Lỗi khi lấy danh sách đơn hàng');
        const data = await response.json();
        const orders = data.orders || [];

        // Aggregate orders by customer
        const customerMap = {};
        orders.forEach((order) => {
          const customerId = order.customerId || order.name; // Use customerId if available, else name
          if (!customerMap[customerId]) {
            customerMap[customerId] = {
              id: customerId,
              name: order.name,
              phone: order.phone,
              address: order.shippingAddress.address,
              totalOrders: 0,
              totalSpent: 0,
              orders: [],
            };
          }
          customerMap[customerId].totalOrders += 1;
          customerMap[customerId].totalSpent += order.finalTotal;
          customerMap[customerId].orders.push(order);
        });

        const customerList = Object.values(customerMap).sort(
          (a, b) => b.totalOrders - a.totalOrders
        );
        setCustomers(customerList);
        setFilteredCustomers(customerList);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Close popup with Esc key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setSelectedCustomer(null);
        setCustomerToDelete(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Reusable filter logic
  const filterCustomers = (customers, filterType) => {
    if (filterType === 'all') return customers;

    const now = new Date();
    const filtered = customers.map((customer) => {
      let filteredOrders = [];
      if (filterType === 'day') {
        filteredOrders = customer.orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getDate() === now.getDate() &&
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear()
          );
        });
      } else if (filterType === 'week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1);
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        filteredOrders = customer.orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= startOfWeek && orderDate <= endOfWeek;
        });
      } else if (filterType === 'month') {
        filteredOrders = customer.orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear()
          );
        });
      } else if (filterType === 'year') {
        filteredOrders = customer.orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getFullYear() === now.getFullYear();
        });
      }

      return {
        ...customer,
        totalOrders: filteredOrders.length,
        totalSpent: filteredOrders.reduce((sum, order) => sum + order.finalTotal, 0),
        orders: filteredOrders,
      };
    });

    return filtered
      .filter((customer) => customer.totalOrders > 0)
      .sort((a, b) => b.totalOrders - a.totalOrders);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const filter = e.target.value;
    setFilterType(filter);
    setCurrentPage(1);
    let filtered = filterCustomers(customers, filter);
    if (searchQuery) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone.includes(searchQuery) ||
          customer.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredCustomers(filtered);
  };

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    const filtered = filterCustomers(customers, filterType).filter(
      (customer) =>
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.phone.includes(query) ||
        customer.address.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCustomers(filtered);
    setCurrentPage(1);
  };

  // Handle delete customer (remove all their orders)
  const handleDelete = async () => {
    if (!customerToDelete) return;
    
    try {
      setIsDeleting(true);
      // Chỉ dùng Server API
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL || 'https://ecobacgiang.vn/api';
      
      // Lấy token từ localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Tìm khách hàng để lấy danh sách đơn hàng
      const customer = customers.find((c) => c.id === customerToDelete.id);
      if (!customer || !customer.orders || customer.orders.length === 0) {
        throw new Error('Không tìm thấy đơn hàng của khách hàng này');
      }
      
      // Xóa từng đơn hàng
      const deletePromises = customer.orders.map(async (order) => {
        const orderId = order._id || order.id;
        if (!orderId) {
          console.warn('Đơn hàng không có ID:', order);
          return;
        }
        
        const response = await fetch(`${apiBaseUrl}/orders/${orderId}`, {
          method: 'DELETE',
          headers: headers,
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Lỗi khi xóa đơn hàng ${orderId}`);
        }
      });
      
      // Chờ tất cả các đơn hàng được xóa
      await Promise.all(deletePromises);
      
      // Cập nhật danh sách khách hàng
      const updatedCustomers = customers.filter((customer) => customer.id !== customerToDelete.id);
      setCustomers(updatedCustomers);
      setFilteredCustomers(filterCustomers(updatedCustomers, filterType));
      setCurrentPage(1);
      setCustomerToDelete(null);
    } catch (error) {
      console.error('Lỗi khi xóa đơn hàng:', error);
      setError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(itemsPerPage)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-red-50 border border-red-200 rounded-lg text-red-700">
        <div className="mb-4">Lỗi: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div className="flex flex-wrap gap-4 flex-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Hiển thị</label>
            <div className="flex items-center gap-2">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span className="text-sm text-gray-600">Khách hàng</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Lọc theo:</label>
            <select
              value={filterType}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white min-w-[150px] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="day">Ngày</option>
              <option value="week">Tuần</option>
              <option value="month">Tháng</option>
              <option value="year">Năm</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px] max-w-[350px]">
          <label className="text-sm font-medium text-gray-700">Tìm kiếm</label>
          <input
            type="text"
            placeholder="Tìm kiếm tên, số điện thoại, địa chỉ..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
          />
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-4xl mb-4">👥</div>
          <div className="text-lg font-semibold text-gray-900 mb-2">Không có khách hàng</div>
          <div className="text-sm text-gray-600">
            {filterType === 'day'
              ? 'Chưa có người đặt hàng hôm nay.'
              : 'Không có khách hàng nào phù hợp với bộ lọc.'}
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white border border-gray-200 rounded-lg overflow-hidden" aria-label="Danh sách khách hàng đặt hàng nhiều nhất">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Xếp Hạng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tên Khách Hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Số Điện Thoại</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tổng Đơn Hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tổng Chi Tiêu</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((customer, index) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-semibold text-gray-900 font-mono text-sm">
                        #{indexOfFirstItem + index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-medium text-gray-900 text-sm">{customer.name}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{customer.phone}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-gray-900 text-sm">{customer.totalOrders}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-gray-900 text-sm">{formatVND(customer.totalSpent)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 justify-start items-center">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="p-2 border border-gray-300 rounded-md bg-white text-blue-600 hover:bg-blue-50 transition-colors"
                          aria-label="Xem chi tiết đơn hàng"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => setCustomerToDelete(customer)}
                          className="p-2 border border-gray-300 rounded-md bg-white text-red-600 hover:bg-red-50 transition-colors"
                          aria-label="Xóa khách hàng"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-6 p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex gap-2 items-center">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              >
                ← Trước
              </button>
              <span className="text-sm text-gray-600 px-2">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              >
                Sau →
              </button>
            </div>
            <span className="text-sm text-gray-600">
              Tổng số: {filteredCustomers.length} khách hàng
            </span>
          </div>
        </>
      )}

      {/* Popup for Customer Order Details - Using Portal */}
      {selectedCustomer && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedCustomer(null);
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-6xl w-full h-[95vh] overflow-hidden flex flex-col shadow-2xl m-4">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Chi tiết đơn hàng của {selectedCustomer.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">Tổng {selectedCustomer.totalOrders} đơn hàng</p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
                  aria-label="Đóng"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="px-6 py-4 overflow-y-auto flex-1 min-h-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-base font-semibold mb-3 flex items-center text-gray-900">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Thông tin khách hàng
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Tên:</span>
                    <span className="font-medium text-sm text-gray-900">{selectedCustomer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Số điện thoại:</span>
                    <span className="font-medium text-sm text-gray-900">{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Địa chỉ:</span>
                    <span className="font-medium text-sm text-gray-900 text-right max-w-xs">{selectedCustomer.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Tổng đơn hàng:</span>
                    <span className="font-medium text-sm text-gray-900">{selectedCustomer.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Tổng chi tiêu:</span>
                    <span className="font-bold text-green-600 text-sm">{formatVND(selectedCustomer.totalSpent)}</span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-base font-semibold mb-3 flex items-center text-gray-900">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Tóm tắt đơn hàng
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Đơn hàng gần nhất:</span>
                    <span className="font-medium text-sm text-gray-900">
                      {selectedCustomer.orders.length > 0 
                        ? new Date(selectedCustomer.orders[0].createdAt).toLocaleDateString('vi-VN')
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Đơn hàng đầu tiên:</span>
                    <span className="font-medium text-sm text-gray-900">
                      {selectedCustomer.orders.length > 0 
                        ? new Date(selectedCustomer.orders[selectedCustomer.orders.length - 1].createdAt).toLocaleDateString('vi-VN')
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Trung bình/đơn:</span>
                    <span className="font-medium text-sm text-gray-900">
                      {formatVND(selectedCustomer.totalSpent / selectedCustomer.totalOrders)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order History */}
            <div className="mt-4">
              <h3 className="text-base font-semibold mb-3 flex items-center text-gray-900">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Lịch sử đơn hàng
              </h3>
              <div className="space-y-2">
                {selectedCustomer.orders.map((order, index) => {
                  const statusColors = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    processing: 'bg-blue-100 text-blue-800',
                    shipped: 'bg-purple-100 text-purple-800',
                    delivered: 'bg-green-100 text-green-800',
                    cancelled: 'bg-red-100 text-red-800',
                    paid: 'bg-emerald-100 text-emerald-800',
                  };
                  return (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold text-sm text-gray-900">Đơn hàng #{order.id.slice(-6)}</p>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[order.status?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-gray-600">Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                        <p className="text-sm font-semibold text-green-600">Tổng tiền: {formatVND(order.finalTotal)}</p>
                      </div>
                      <div className="mt-2">
                        <h4 className="font-medium text-sm mb-2 text-gray-900">Sản phẩm:</h4>
                        <div className="space-y-1">
                          {order.orderItems?.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center p-2 bg-gray-50 rounded">
                              <div className="relative w-8 h-8 mr-2 flex-shrink-0">
                                <Image
                                  src={item.image || '/images/placeholder.jpg'}
                                  alt={item.title}
                                  width={32}
                                  height={32}
                                  className="rounded object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 truncate">{item.title}</p>
                                <p className="text-xs text-gray-600">Số lượng: {item.quantity}</p>
                                <p className="text-xs font-semibold text-green-600">{formatVND(item.price)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Tổng chi tiêu: {formatVND(selectedCustomer.totalSpent)}
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>,
        typeof document !== 'undefined' ? document.body : null
      )}

      {/* Delete Confirmation Popup - Using Portal */}
      {customerToDelete && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              setCustomerToDelete(null);
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Xác nhận xóa</h2>
                {!isDeleting && (
                  <button
                    onClick={() => setCustomerToDelete(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
                    aria-label="Đóng"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  Bạn có chắc chắn muốn xóa tất cả đơn hàng của khách hàng này?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                  <p className="text-sm font-medium text-gray-900 mb-1">Thông tin khách hàng:</p>
                  <p className="text-sm text-gray-700">Tên: <span className="font-semibold">{customerToDelete.name}</span></p>
                  <p className="text-sm text-gray-700">Số điện thoại: <span className="font-semibold">{customerToDelete.phone}</span></p>
                  <p className="text-sm text-gray-700">Tổng đơn hàng: <span className="font-semibold text-red-600">{customerToDelete.totalOrders} đơn</span></p>
                  <p className="text-sm text-gray-700">Tổng chi tiêu: <span className="font-semibold text-red-600">{formatVND(customerToDelete.totalSpent)}</span></p>
                </div>
                <p className="text-sm text-red-600 font-medium mt-3">
                  ⚠️ Hành động này không thể hoàn tác!
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setCustomerToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xóa...
                  </>
                ) : (
                  'Xóa'
                )}
              </button>
            </div>
          </div>
        </div>,
        typeof document !== 'undefined' ? document.body : null
      )}
    </div>
  );
}