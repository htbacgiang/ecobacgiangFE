import Image from 'next/image';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Trash2, Edit, Check, X, Package, Truck, CreditCard, Clock, Plus, Minus } from 'lucide-react';
// import { Printer } from 'lucide-react'; // Tạm thời tắt chức năng in hóa đơn
import { toast, Toaster } from 'react-hot-toast';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isEditingPaymentMethod, setIsEditingPaymentMethod] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isEditingOrderItems, setIsEditingOrderItems] = useState(false);
  const [editingOrderItems, setEditingOrderItems] = useState([]);
  const [isSavingOrderItems, setIsSavingOrderItems] = useState(false);
  // const [showInvoice, setShowInvoice] = useState(false); // Tạm thời tắt chức năng in hóa đơn
  const [mounted, setMounted] = useState(false);

  // States for manual order creation
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [customerType, setCustomerType] = useState('existing'); // 'existing' or 'new'
  const [existingCustomers, setExistingCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [newOrderData, setNewOrderData] = useState({
    name: '',
    phone: '',
    address: '',
    note: '',
    paymentMethod: 'COD',
    status: 'pending',
    orderItems: [],
  });

  // Order status options
  const statusOptions = [
    { value: 'pending', label: 'Chờ xử lý', icon: Clock, color: 'bg-yellow-500' },
    { value: 'processing', label: 'Đang xử lý', icon: Package, color: 'bg-blue-500' },
    { value: 'shipped', label: 'Đã gửi hàng', icon: Truck, color: 'bg-purple-500' },
    { value: 'delivered', label: 'Đã giao hàng', icon: Check, color: 'bg-green-500' },
    { value: 'cancelled', label: 'Đã hủy', icon: X, color: 'bg-red-500' },
    { value: 'paid', label: 'Đã thanh toán', icon: CreditCard, color: 'bg-emerald-500' }
  ];

  // Payment method options
  const paymentMethodOptions = [
    { value: 'COD', label: 'COD (Thanh toán khi nhận hàng)' },
    { value: 'BankTransfer', label: 'Chuyển khoản' },
    { value: 'Sepay', label: 'Sepay' },
    { value: 'MoMo', label: 'MoMo' }
  ];

  // Set mounted state for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch orders
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
        
        if (!response.ok) {
          throw new Error('Lỗi khi lấy danh sách đơn hàng');
        }
        const data = await response.json();
        let fetchedOrders = data.orders || [];
        
        // Nếu phương thức thanh toán là Sepay thì trạng thái phải là paid
        fetchedOrders = fetchedOrders.map(order => {
          if (order.paymentMethod === 'Sepay' && order.status !== 'paid') {
            return { ...order, status: 'paid' };
          }
          return order;
        });
        
        setOrders(fetchedOrders);
        setFilteredOrders(fetchedOrders);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        setOrders([]);
        setFilteredOrders([]);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Fetch products when creating order or editing order items
  useEffect(() => {
    const fetchProducts = async () => {
      if (!showCreateOrder && !isEditingOrderItems) return;
      
      try {
        setLoadingProducts(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
        if (!apiBaseUrl) {
          throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
        }
        const response = await fetch(`${apiBaseUrl}/products`);
        
        if (!response.ok) {
          throw new Error('Lỗi khi lấy danh sách sản phẩm');
        }
        const data = await response.json();
        setProducts(data.products || data || []);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    
    fetchProducts();
  }, [showCreateOrder, isEditingOrderItems]);

  // Fetch existing customers from orders
  useEffect(() => {
    const fetchExistingCustomers = async () => {
      if (!showCreateOrder) return;
      
      try {
        setLoadingCustomers(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
        if (!apiBaseUrl) {
          throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
        }
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
        
        if (!response.ok) {
          throw new Error('Lỗi khi lấy danh sách khách hàng');
        }
        
        const data = await response.json();
        const orders = data.orders || [];
        
        // Aggregate customers from orders
        const customerMap = {};
        orders.forEach((order) => {
          // Use phone as unique identifier for customers
          const customerKey = order.phone || order.name;
          if (!customerMap[customerKey]) {
            customerMap[customerKey] = {
              id: customerKey,
              name: order.name,
              phone: order.phone,
              address: order.shippingAddress?.address || '',
              orderCount: 0,
            };
          }
          customerMap[customerKey].orderCount += 1;
        });
        
        const customerList = Object.values(customerMap).sort(
          (a, b) => b.orderCount - a.orderCount
        );
        
        setExistingCustomers(customerList);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách khách hàng:', error);
        setExistingCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
    };
    
    fetchExistingCustomers();
  }, [showCreateOrder]);

  // Close popup with Esc key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setSelectedOrder(null);
        setIsEditingStatus(false);
        setIsEditingPaymentMethod(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Reusable filter logic
  const filterOrders = (orders, filterType, selectedDate) => {
    if (selectedDate) {
      const filterDate = new Date(selectedDate);
      return orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getDate() === filterDate.getDate() &&
          orderDate.getMonth() === filterDate.getMonth() &&
          orderDate.getFullYear() === filterDate.getFullYear()
        );
      });
    }

    const now = new Date();
    if (filterType === 'all') return orders;

    if (filterType === 'day') {
      return orders.filter((order) => {
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

      return orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startOfWeek && orderDate <= endOfWeek;
      });
    } else if (filterType === 'month') {
      return orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      });
    } else if (filterType === 'year') {
      return orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getFullYear() === now.getFullYear();
      });
    }
    return orders;
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const filter = e.target.value;
    setFilterType(filter);
    setSelectedDate(''); // Reset selected date when filter type changes
    setCurrentPage(1);
    let filtered = filterOrders(orders, filter, '');
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.phone.includes(searchQuery)
      );
    }
    setFilteredOrders(filtered);
  };

  // Handle date change
  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setFilterType(''); // Reset filter type when a date is selected
    setCurrentPage(1);
    let filtered = filterOrders(orders, '', date);
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.phone.includes(searchQuery)
      );
    }
    setFilteredOrders(filtered);
  };

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    const filtered = filterOrders(orders, filterType, selectedDate).filter(
      (order) =>
        order.id.toLowerCase().includes(query.toLowerCase()) ||
        order.name.toLowerCase().includes(query.toLowerCase()) ||
        order.phone.includes(query)
    );
    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!newStatus || !selectedOrder) return;
    
    // Với Sepay: chỉ cho phép chuyển từ 'paid' sang 'shipped' hoặc 'delivered'
    // Không cho phép chuyển về 'pending' hoặc các status thấp hơn
    if (selectedOrder.paymentMethod === 'Sepay') {
      const currentStatus = selectedOrder.status;
      // Nếu đơn Sepay đang ở 'paid' và user chọn 'pending' hoặc 'processing', không cho phép
      if (currentStatus === 'paid' && (newStatus === 'pending' || newStatus === 'processing')) {
        toast.error('Đơn hàng Sepay đã thanh toán, không thể chuyển về trạng thái thấp hơn.');
        return;
      }
      // Nếu đơn Sepay đang ở 'shipped' và user chọn 'paid' hoặc 'pending', không cho phép
      if (currentStatus === 'shipped' && (newStatus === 'paid' || newStatus === 'pending' || newStatus === 'processing')) {
        toast.error('Không thể chuyển trạng thái lùi từ shipped về trạng thái thấp hơn.');
        return;
      }
      // Nếu đơn Sepay đang ở 'delivered', không cho phép thay đổi
      if (currentStatus === 'delivered') {
        toast.error('Đơn hàng đã giao thành công, không thể thay đổi trạng thái.');
        return;
      }
    }
    
    try {
      // Chỉ dùng Server API
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL || 'https://ecobacgiang.vn/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${apiBaseUrl}/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Lỗi khi cập nhật trạng thái');
      }

      // Update local state
      const responseData = await response.json();
      const updatedOrder = responseData.order || responseData;
      const newStatusValue = updatedOrder.status || newStatus;
      
      const updatedOrders = orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: newStatusValue }
          : order
      );
      
      setOrders(updatedOrders);
      setFilteredOrders(filterOrders(updatedOrders, filterType, selectedDate));
      setSelectedOrder({ ...selectedOrder, status: newStatusValue });
      setIsEditingStatus(false);
      setNewStatus('');
      
      // Show success message
      toast.success('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      toast.error('Lỗi khi cập nhật trạng thái: ' + error.message);
    }
  };

  // Start editing status
  const startEditStatus = () => {
    setNewStatus(selectedOrder.status);
    setIsEditingStatus(true);
  };

  // Cancel editing status
  const cancelEditStatus = () => {
    setIsEditingStatus(false);
    setNewStatus('');
  };

  // Start editing payment method
  const startEditPaymentMethod = () => {
    // Kiểm tra trạng thái đơn hàng trước khi cho phép chỉnh sửa
    const lockedStatuses = ['paid', 'shipped', 'delivered'];
    if (lockedStatuses.includes(selectedOrder.status)) {
      toast.error('Không thể thay đổi phương thức thanh toán khi đơn hàng đã được xử lý (paid/shipped/delivered)');
      return;
    }
    
    setNewPaymentMethod(selectedOrder.paymentMethod);
    setIsEditingPaymentMethod(true);
  };

  // Cancel editing payment method
  const cancelEditPaymentMethod = () => {
    setIsEditingPaymentMethod(false);
    setNewPaymentMethod('');
  };

  // Handle payment method update
  const handlePaymentMethodUpdate = async () => {
    if (!newPaymentMethod || !selectedOrder) {
      toast.error('Vui lòng chọn phương thức thanh toán');
      return;
    }
    
    // Kiểm tra trạng thái đơn hàng - không cho phép thay đổi paymentMethod khi đã được xử lý
    const lockedStatuses = ['paid', 'shipped', 'delivered'];
    if (lockedStatuses.includes(selectedOrder.status)) {
      toast.error('Không thể thay đổi phương thức thanh toán khi đơn hàng đã được xử lý (paid/shipped/delivered)');
      setIsEditingPaymentMethod(false);
      setNewPaymentMethod('');
      return;
    }
    
    // Prevent updating if payment method hasn't changed
    if (newPaymentMethod === selectedOrder.paymentMethod) {
      setIsEditingPaymentMethod(false);
      setNewPaymentMethod('');
      return;
    }
    
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL || 'https://ecobacgiang.vn/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Nếu phương thức thanh toán là Sepay thì trạng thái phải là paid
      const updateData = {
        paymentMethod: newPaymentMethod
      };
      
      if (newPaymentMethod === 'Sepay') {
        updateData.status = 'paid';
      }
      
      // Use id or _id depending on what the order has
      const orderId = selectedOrder.id || selectedOrder._id;
      
      console.log('Updating payment method:', { orderId, newPaymentMethod, updateData });
      
      const response = await fetch(`${apiBaseUrl}/orders/${orderId}`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify(updateData),
      });

      let responseData = null;
      try {
        responseData = await response.json();
      } catch (e) {
        console.error('Error parsing response:', e);
      }

      if (!response.ok) {
        const errorMessage = responseData?.message || `Lỗi khi cập nhật phương thức thanh toán (Status: ${response.status})`;
        console.error('API Error:', errorMessage, responseData, 'Response status:', response.status);
        throw new Error(errorMessage);
      }

      // Verify that paymentMethod was actually updated in the response
      const orderFromResponse = responseData?.order || responseData;
      if (orderFromResponse && orderFromResponse.paymentMethod !== newPaymentMethod) {
        console.warn('Payment method mismatch:', {
          expected: newPaymentMethod,
          received: orderFromResponse.paymentMethod,
          responseData
        });
      }

      console.log('Payment method updated successfully:', {
        orderId,
        newPaymentMethod,
        responseOrder: orderFromResponse
      });

      // Update selectedOrder IMMEDIATELY with new payment method for UI responsiveness
      // Use order from response if available, otherwise use local update
      const immediateUpdatedOrder = orderFromResponse && orderFromResponse.paymentMethod === newPaymentMethod
        ? {
            ...orderFromResponse,
            id: orderFromResponse.id || orderFromResponse._id,
            paymentMethod: newPaymentMethod,
            ...(newPaymentMethod === 'Sepay' && { status: 'paid' })
          }
        : {
            ...selectedOrder,
            paymentMethod: newPaymentMethod,
            ...(newPaymentMethod === 'Sepay' && { status: 'paid' })
          };
      
      console.log('Updating selectedOrder from:', selectedOrder.paymentMethod, 'to:', newPaymentMethod);
      console.log('New selectedOrder:', immediateUpdatedOrder);
      setSelectedOrder(immediateUpdatedOrder);

      // Also update orders list immediately
      const updatedOrders = orders.map(order => {
        const oId = order.id || order._id;
        const sId = selectedOrder.id || selectedOrder._id;
        if (oId === sId || oId === selectedOrder.id || oId === selectedOrder._id) {
          const updatedOrder = { ...order, paymentMethod: newPaymentMethod };
          if (newPaymentMethod === 'Sepay') {
            updatedOrder.status = 'paid';
          }
          return updatedOrder;
        }
        return order;
      });
      
      setOrders(updatedOrders);
      setFilteredOrders(filterOrders(updatedOrders, filterType, selectedDate));

      // Close edit mode
      setIsEditingPaymentMethod(false);
      setNewPaymentMethod('');
      
      // Show success message
      toast.success('Cập nhật phương thức thanh toán thành công!');

      // Fetch updated orders from server in background to ensure data consistency
      try {
        const ordersResponse = await fetch(`${apiBaseUrl}/orders`, {
          method: 'GET',
          headers: headers,
        });
        
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          let fetchedOrders = ordersData.orders || [];
          
          // Nếu phương thức thanh toán là Sepay thì trạng thái phải là paid
          fetchedOrders = fetchedOrders.map(order => {
            if (order.paymentMethod === 'Sepay' && order.status !== 'paid') {
              return { ...order, status: 'paid' };
            }
            return order;
          });
          
          setOrders(fetchedOrders);
          setFilteredOrders(filterOrders(fetchedOrders, filterType, selectedDate));
          
          // Update selected order with latest data from server
          const selectedOrderId = selectedOrder.id || selectedOrder._id;
          const serverUpdatedOrder = fetchedOrders.find(o => {
            const oId = o.id || o._id;
            return oId === selectedOrderId || 
                   oId === selectedOrder.id || 
                   oId === selectedOrder._id ||
                   (o.id && o.id.toString() === selectedOrderId?.toString()) ||
                   (o._id && o._id.toString() === selectedOrderId?.toString());
          });
          
          if (serverUpdatedOrder) {
            setSelectedOrder(serverUpdatedOrder);
          }
        }
      } catch (fetchError) {
        console.error('Error fetching updated orders:', fetchError);
        // Don't show error to user since we already updated local state
      }
      
    } catch (error) {
      console.error('Lỗi khi cập nhật phương thức thanh toán:', error);
      toast.error('Lỗi khi cập nhật phương thức thanh toán: ' + error.message);
    }
  };

  // Start editing order items
  const startEditOrderItems = () => {
    setEditingOrderItems([...selectedOrder.orderItems || []]);
    setIsEditingOrderItems(true);
  };

  // Cancel editing order items
  const cancelEditOrderItems = () => {
    setEditingOrderItems([]);
    setIsEditingOrderItems(false);
  };

  // Update order item quantity
  const updateOrderItemQuantity = (index, quantity) => {
    if (quantity < 1) return;
    const updatedItems = [...editingOrderItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: parseInt(quantity) || 1,
    };
    setEditingOrderItems(updatedItems);
  };

  // Remove order item
  const removeOrderItem = (index) => {
    const updatedItems = editingOrderItems.filter((_, i) => i !== index);
    setEditingOrderItems(updatedItems);
  };

  // Add product to order items
  const addProductToOrderItems = (product) => {
    const price = product.promotionalPrice || product.price || 0;
    const image = Array.isArray(product.image) ? product.image[0] : product.image;
    const newItem = {
      product: product._id,
      title: product.name,
      quantity: 1,
      price: price,
      image: image,
      unit: product.unit || 'Kg',
    };
    setEditingOrderItems([...editingOrderItems, newItem]);
  };

  // Calculate order totals from edited items
  const calculateOrderTotals = (items) => {
    const totalPrice = items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
    const discount = selectedOrder.discount || 0;
    const totalAfterDiscount = totalPrice - discount;
    const shippingFee = selectedOrder.shippingFee || 30000;
    const finalTotal = totalAfterDiscount + shippingFee;
    return { totalPrice, discount, totalAfterDiscount, shippingFee, finalTotal };
  };

  // Save order items changes
  const saveOrderItems = async () => {
    if (editingOrderItems.length === 0) {
      toast.error('Đơn hàng phải có ít nhất một sản phẩm');
      return;
    }

    try {
      setIsSavingOrderItems(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL || 'https://ecobacgiang.vn/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const { totalPrice, discount, totalAfterDiscount, shippingFee, finalTotal } = calculateOrderTotals(editingOrderItems);
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiBaseUrl}/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({
          orderItems: editingOrderItems.map(item => ({
            product: item.product,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
            unit: item.unit,
          })),
          totalPrice,
          totalAfterDiscount,
          shippingFee,
          finalTotal,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi cập nhật sản phẩm');
      }

      // Update local state
      const updatedOrder = {
        ...selectedOrder,
        orderItems: editingOrderItems,
        totalPrice,
        totalAfterDiscount,
        shippingFee,
        finalTotal,
      };
      
      setSelectedOrder(updatedOrder);
      
      // Update orders list
      const ordersResponse = await fetch(`${apiBaseUrl}/orders`, {
        method: 'GET',
        headers: headers,
      });
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        let fetchedOrders = ordersData.orders || [];
        fetchedOrders = fetchedOrders.map(order => {
          if (order.paymentMethod === 'Sepay' && order.status !== 'paid') {
            return { ...order, status: 'paid' };
          }
          return order;
        });
        setOrders(fetchedOrders);
        setFilteredOrders(filterOrders(fetchedOrders, filterType, selectedDate));
      }
      
      setIsEditingOrderItems(false);
      toast.success('Cập nhật sản phẩm thành công!');
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      toast.error('Lỗi khi cập nhật sản phẩm: ' + error.message);
    } finally {
      setIsSavingOrderItems(false);
    }
  };

  // Handle delete confirmation
  const confirmDelete = (order) => {
    setOrderToDelete(order);
    setShowDeleteConfirm(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!orderToDelete) return;
    
    try {
      // Chỉ dùng Server API
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL || 'https://ecobacgiang.vn/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${apiBaseUrl}/orders/${orderToDelete._id || orderToDelete.id}`, {
        method: 'DELETE',
        headers: headers,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Lỗi khi xóa đơn hàng');
      }
      
      const updatedOrders = orders.filter((order) => order._id !== orderToDelete._id && order.id !== orderToDelete.id);
      setOrders(updatedOrders);
      setFilteredOrders(filterOrders(updatedOrders, filterType, selectedDate));
      setCurrentPage(1);
      
      // Close popup and reset
      setShowDeleteConfirm(false);
      setOrderToDelete(null);
      
      toast.success('Xóa đơn hàng thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa đơn hàng:', error);
      toast.error('Lỗi khi xóa đơn hàng: ' + (error.message || 'Vui lòng thử lại'));
      setError(error.message);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setOrderToDelete(null);
  };

  const getStatusColor = (status) => {
    const statusMap = {
      pending: 'bg-yellow-500 text-white',
      processing: 'bg-blue-500 text-white',
      shipped: 'bg-purple-500 text-white',
      delivered: 'bg-green-500 text-white',
      cancelled: 'bg-red-500 text-white',
      paid: 'bg-emerald-500 text-white',
      default: 'bg-gray-500 text-white',
    };
    return statusMap[status.toLowerCase()] || statusMap.default;
  };

  const getStatusIcon = (status) => {
    const statusOption = statusOptions.find(option => option.value === status.toLowerCase());
    return statusOption ? statusOption.icon : Clock;
  };

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDeliveryTime = (deliveryTime) => {
    if (!deliveryTime) return 'Chưa chọn';
    if (deliveryTime === 'business_hours') return 'Giờ hành chính (8h - 17h)';
    if (deliveryTime === '17-18') return '17h - 18h';
    if (deliveryTime === '18-19') return '18h - 19h';
    if (deliveryTime === '19-20') return '19h - 20h';
    return deliveryTime;
  };

  // Convert number to Vietnamese words
  const numberToVietnameseWords = (num) => {
    if (num === 0) return 'không đồng chẵn';
    
    const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    const tens = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
    
    const convertThreeDigits = (n) => {
      if (n === 0) return '';
      let result = '';
      const h = Math.floor(n / 100);
      const t = Math.floor((n % 100) / 10);
      const o = n % 10;
      
      if (h > 0) {
        result += ones[h] + ' trăm ';
      }
      
      if (t > 0) {
        if (t === 1) {
          result += o > 0 ? 'mười ' : 'mười ';
        } else {
          result += tens[t] + ' ';
        }
      } else if (h > 0 && o > 0) {
        result += 'lẻ ';
      }
      
      if (o > 0) {
        if (t > 1 && o === 1) {
          result += 'mốt';
        } else if (t > 0 && o === 5) {
          result += 'lăm';
        } else if (t === 0 && h > 0 && o === 5) {
          result += 'lăm';
        } else {
          result += ones[o];
        }
      }
      
      return result.trim();
    };
    
    let result = '';
    const numInt = Math.floor(num);
    const numStr = numInt.toString();
    const len = numStr.length;
    
    // Handle millions (triệu)
    if (len > 6) {
      const millions = parseInt(numStr.slice(0, len - 6));
      const millionsText = convertThreeDigits(millions);
      if (millionsText) {
        result += millionsText + ' triệu ';
      }
    }
    
    // Handle thousands (nghìn)
    if (len > 3) {
      const thousands = parseInt(numStr.slice(Math.max(0, len - 6), len - 3));
      if (thousands > 0) {
        const thousandsText = convertThreeDigits(thousands);
        if (thousandsText) {
          result += thousandsText + ' nghìn ';
        }
      } else if (len > 6) {
        result += 'không nghìn ';
      }
    }
    
    // Handle last three digits
    const lastThree = parseInt(numStr.slice(-3));
    if (lastThree > 0) {
      result += convertThreeDigits(lastThree);
    }
    
    return result.trim() + ' đồng chẵn';
  };

  // Handle print invoice - Tạm thời tắt
  // const handlePrintInvoice = () => {
  //   setShowInvoice(true);
  //   setTimeout(() => {
  //     window.print();
  //   }, 100);
  // };

  // Close invoice print view - Tạm thời tắt
  // const closeInvoice = () => {
  //   setShowInvoice(false);
  // };

  // Handle create order modal
  const openCreateOrder = () => {
    setShowCreateOrder(true);
    setCustomerType('existing');
    setSelectedCustomerId('');
    setNewOrderData({
      name: '',
      phone: '',
      address: '',
      note: '',
      paymentMethod: 'COD',
      status: 'pending',
      orderItems: [],
    });
  };

  const closeCreateOrder = () => {
    setShowCreateOrder(false);
    setCustomerType('existing');
    setSelectedCustomerId('');
    setNewOrderData({
      name: '',
      phone: '',
      address: '',
      note: '',
      paymentMethod: 'COD',
      status: 'pending',
      orderItems: [],
    });
  };

  // Handle customer type change
  const handleCustomerTypeChange = (type) => {
    setCustomerType(type);
    setSelectedCustomerId('');
    if (type === 'existing') {
      setNewOrderData({
        ...newOrderData,
        name: '',
        phone: '',
        address: '',
      });
    } else {
      setNewOrderData({
        ...newOrderData,
        name: '',
        phone: '',
        address: '',
      });
    }
  };

  // Handle existing customer selection
  const handleSelectExistingCustomer = (customerId) => {
    setSelectedCustomerId(customerId);
    const customer = existingCustomers.find(c => c.id === customerId);
    if (customer) {
      setNewOrderData({
        ...newOrderData,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
      });
    }
  };

  // Helper functions for 0.5kg logic
  const normalizeUnit = (input) => {
    if (input === null || input === undefined) return input;
    const raw = String(input).trim();
    if (!raw) return raw;
    const lower = raw.toLowerCase();
    if (lower === "gam" || lower === "g" || lower === "gram" || lower === "gr") return "100g";
    if (lower === "100g" || lower === "100 g" || lower === "100gram" || lower === "100 gram") return "100g";
    if (lower === "100gam" || lower === "100 gam") return "100g";
    if (lower === "kg") return "Kg";
    return raw;
  };

  const isKgUnit = (unit) => {
    const normalized = normalizeUnit(unit);
    if (!normalized) return false;
    return normalized.toString().trim().toLowerCase() === "kg";
  };

  const is100gUnit = (unit) => normalizeUnit(unit) === "100g";

  const normalizeQuantity = (qty, unit) => {
    const n = Number(qty ?? 0);
    if (!Number.isFinite(n)) return 0;
    if (isKgUnit(unit)) return Math.round(n * 2) / 2;
    return Math.round(n);
  };

  // Add product to order
  const addProductToOrder = (product) => {
    const existingItem = newOrderData.orderItems.find(
      item => item.product?._id === product._id || item.product === product._id
    );
    
    if (existingItem) {
      // Increase quantity if product already exists
      const currentQty = Number(existingItem.quantity ?? 0);
      const unit = existingItem.unit || product.unit || 'Kg';
      // Nếu đang 0.5kg và bấm "+": tăng lên 1kg trước, sau đó tăng theo 1 như cũ
      const effectiveStep = isKgUnit(unit) && currentQty === 0.5 ? 0.5 : 1;
      let newQuantity = normalizeQuantity(currentQty + effectiveStep, unit);
      if (is100gUnit(unit)) newQuantity = Math.min(9, Math.max(1, Math.round(newQuantity)));
      
      const updatedItems = newOrderData.orderItems.map(item => {
        if (item.product?._id === product._id || item.product === product._id) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      setNewOrderData({ ...newOrderData, orderItems: updatedItems });
    } else {
      // Add new product
      const price = product.promotionalPrice || product.price || 0;
      const unit = product.unit || 'Kg';
      const initialQuantity = isKgUnit(unit) ? 0.5 : 1;
      const newItem = {
        product: product._id,
        title: product.name,
        quantity: initialQuantity,
        price: price,
        image: Array.isArray(product.image) ? product.image[0] : product.image,
        unit: unit,
      };
      setNewOrderData({
        ...newOrderData,
        orderItems: [...newOrderData.orderItems, newItem],
      });
    }
  };

  // Remove product from order
  const removeProductFromOrder = (index) => {
    const updatedItems = newOrderData.orderItems.filter((_, i) => i !== index);
    setNewOrderData({ ...newOrderData, orderItems: updatedItems });
  };

  // Handle increase quantity
  const handleIncreaseQuantity = (index) => {
    const item = newOrderData.orderItems[index];
    if (!item) return;
    
    const currentQty = Number(item.quantity ?? 0);
    const unit = item.unit || 'Kg';
    // Nếu đang 0.5kg và bấm "+": tăng lên 1kg trước, sau đó tăng theo 1 như cũ
    const effectiveStep = isKgUnit(unit) && currentQty === 0.5 ? 0.5 : 1;
    let newQuantity = normalizeQuantity(currentQty + effectiveStep, unit);
    if (is100gUnit(unit)) newQuantity = Math.min(9, Math.max(1, Math.round(newQuantity)));
    
    const updatedItems = newOrderData.orderItems.map((it, i) => {
      if (i === index) {
        return { ...it, quantity: newQuantity };
      }
      return it;
    });
    setNewOrderData({ ...newOrderData, orderItems: updatedItems });
  };

  // Handle decrease quantity
  const handleDecreaseQuantity = (index) => {
    const item = newOrderData.orderItems[index];
    if (!item) return;
    
    const currentQty = Number(item.quantity ?? 0);
    const unit = item.unit || 'Kg';
    // Logic giảm xuống 0.5kg khi đang là 1kg
    const effectiveStep = isKgUnit(unit) && currentQty === 1 ? 0.5 : 1;
    let newQuantity = Math.max(0, normalizeQuantity(currentQty - effectiveStep, unit));
    
    if (is100gUnit(unit)) {
      newQuantity = Math.max(0, Math.round(newQuantity));
    } else if (isKgUnit(unit)) {
      newQuantity = Math.max(0.5, newQuantity); // Minimum là 0.5kg
    } else {
      newQuantity = Math.max(0, Math.round(newQuantity));
    }
    
    if (newQuantity <= 0) {
      // Remove item if quantity is 0
      const updatedItems = newOrderData.orderItems.filter((_, i) => i !== index);
      setNewOrderData({ ...newOrderData, orderItems: updatedItems });
    } else {
      const updatedItems = newOrderData.orderItems.map((it, i) => {
        if (i === index) {
          return { ...it, quantity: newQuantity };
        }
        return it;
      });
      setNewOrderData({ ...newOrderData, orderItems: updatedItems });
    }
  };

  // Update product quantity (for manual input)
  const updateProductQuantity = (index, quantity) => {
    const item = newOrderData.orderItems[index];
    if (!item) return;
    
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 0) return;
    
    const unit = item.unit || 'Kg';
    let normalizedQty = normalizeQuantity(qty, unit);
    
    if (is100gUnit(unit)) {
      normalizedQty = Math.min(9, Math.max(0, Math.round(normalizedQty)));
    } else if (isKgUnit(unit)) {
      normalizedQty = Math.max(0.5, normalizedQty); // Minimum là 0.5kg
    } else {
      normalizedQty = Math.max(0, Math.round(normalizedQty));
    }
    
    if (normalizedQty <= 0) {
      // Remove item if quantity is 0
      const updatedItems = newOrderData.orderItems.filter((_, i) => i !== index);
      setNewOrderData({ ...newOrderData, orderItems: updatedItems });
    } else {
      const updatedItems = newOrderData.orderItems.map((it, i) => {
        if (i === index) {
          return { ...it, quantity: normalizedQty };
        }
        return it;
      });
      setNewOrderData({ ...newOrderData, orderItems: updatedItems });
    }
  };

  // Calculate order totals
  const calculateTotals = () => {
    const totalPrice = newOrderData.orderItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
    const discount = 0; // No discount for manual orders
    const totalAfterDiscount = totalPrice - discount;
    const shippingFee = 30000; // No shipping fee for manual orders
    const finalTotal = totalAfterDiscount + shippingFee;
    
    return { totalPrice, discount, totalAfterDiscount, shippingFee, finalTotal };
  };

  // Create order
  const handleCreateOrder = async () => {
    // Validation
    if (customerType === 'existing' && !selectedCustomerId) {
      toast.error('Vui lòng chọn khách hàng');
      return;
    }
    
    if (!newOrderData.name || !newOrderData.phone || !newOrderData.address) {
      toast.error('Vui lòng nhập đầy đủ thông tin khách hàng');
      return;
    }
    
    if (newOrderData.orderItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    try {
      setCreatingOrder(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL || 'https://ecobacgiang.vn/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const { totalPrice, discount, totalAfterDiscount, shippingFee, finalTotal } = calculateTotals();
      
      const orderData = {
        name: newOrderData.name,
        phone: newOrderData.phone,
        shippingAddress: {
          address: newOrderData.address,
        },
        note: newOrderData.note || '',
        paymentMethod: newOrderData.paymentMethod,
        status: newOrderData.paymentMethod === 'Sepay' ? 'paid' : newOrderData.status,
        orderItems: newOrderData.orderItems.map(item => ({
          product: item.product,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          unit: item.unit,
        })),
        totalPrice,
        discount,
        totalAfterDiscount,
        shippingFee,
        finalTotal,
      };

      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // If new customer, just create order without creating user
      // Customer information will be saved in the order only

      const response = await fetch(`${apiBaseUrl}/checkout`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi tạo đơn hàng');
      }

      const data = await response.json();
      
      // Refresh orders list
      const ordersResponse = await fetch(`${apiBaseUrl}/orders`, {
        method: 'GET',
        headers: headers,
      });
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        let fetchedOrders = ordersData.orders || [];
        fetchedOrders = fetchedOrders.map(order => {
          if (order.paymentMethod === 'Sepay' && order.status !== 'paid') {
            return { ...order, status: 'paid' };
          }
          return order;
        });
      setOrders(fetchedOrders);
      setFilteredOrders(filterOrders(fetchedOrders, filterType, selectedDate));
    }
    
    toast.success('Tạo đơn hàng thành công!'
    );
    closeCreateOrder();
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    toast.error('Lỗi khi tạo đơn hàng: ' + error.message);
  } finally {
    setCreatingOrder(false);
  }
};

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

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
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Đơn hàng mới nhất</h2>
        <button
          onClick={openCreateOrder}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Tạo đơn hàng mới
        </button>
      </div>
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
              <span className="text-sm text-gray-600">Đơn hàng</span>
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
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Chọn ngày:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px] max-w-[350px]">
          <label className="text-sm font-medium text-gray-700">Tìm kiếm</label>
          <input
            type="text"
            placeholder="Tìm kiếm ID, tên, số điện thoại..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-4xl mb-4">📋</div>
          <div className="text-lg font-semibold text-gray-900 mb-2">Không có đơn hàng</div>
          <div className="text-sm text-gray-600">
            {selectedDate
              ? 'Chưa có đơn hàng trong ngày đã chọn.'
              : filterType === 'day'
              ? 'Chưa có người đặt hàng hôm nay.'
              : 'Không có đơn hàng nào phù hợp với bộ lọc.'}
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white border border-gray-200 rounded-lg overflow-hidden" aria-label="Danh sách đơn hàng">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID Đơn Hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ngày Đặt</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Khách Hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Số Điện Thoại</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tổng Tiền</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phương Thức</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Thời gian giao hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Trạng Thái</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((order) => {
                  const displayStatus = order.paymentMethod === 'Sepay' ? 'paid' : order.status;
                  const statusColors = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    processing: 'bg-blue-100 text-blue-800',
                    shipped: 'bg-purple-100 text-purple-800',
                    delivered: 'bg-green-100 text-green-800',
                    cancelled: 'bg-red-100 text-red-800',
                    paid: 'bg-emerald-100 text-emerald-800',
                  };
                  return (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <span className="font-semibold text-gray-900 font-mono text-sm">
                          #{order.id.slice(-6)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900 text-sm">{order.name}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">{order.phone}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-gray-900 text-sm">{formatVND(order.finalTotal)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">{order.paymentMethod}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">{formatDeliveryTime(order.deliveryTime)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[displayStatus.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                          {order.paymentMethod === 'Sepay' ? 'paid' : order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2 justify-end items-center">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 border border-gray-300 rounded-md bg-white text-blue-600 hover:bg-blue-50 transition-colors"
                            aria-label="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => confirmDelete(order)}
                            className="p-2 border border-gray-300 rounded-md bg-white text-red-600 hover:bg-red-50 transition-colors"
                            aria-label="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              Tổng số: {filteredOrders.length} đơn hàng
            </span>
          </div>
        </>
      )}

      {/* Enhanced Popup for Order Details - Using Portal */}
      {selectedOrder && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedOrder(null);
              setIsEditingStatus(false);
              setIsEditingPaymentMethod(false);
              setIsEditingOrderItems(false);
              setEditingOrderItems([]);
            }
          }}
        >
          <div className="bg-white rounded-lg w-full max-w-6xl h-[95vh] overflow-hidden flex flex-col shadow-2xl m-4">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Chi tiết đơn hàng</h2>
                  <p className="text-sm text-gray-600 mt-1">#{selectedOrder.id.slice(-6)}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setIsEditingStatus(false);
                    setIsEditingPaymentMethod(false);
                    setIsEditingOrderItems(false);
                    setEditingOrderItems([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
                  aria-label="Đóng"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Body */}
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
                      <span className="font-medium text-sm text-gray-900">{selectedOrder.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Số điện thoại:</span>
                      <span className="font-medium text-sm text-gray-900">{selectedOrder.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Địa chỉ:</span>
                      <span className="font-medium text-sm text-gray-900 text-right max-w-xs">{selectedOrder.shippingAddress?.address || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Ngày đặt:</span>
                      <span className="font-medium text-sm text-gray-900">{new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Thời gian giao hàng:</span>
                      <span className="font-medium text-sm text-gray-900">{formatDeliveryTime(selectedOrder.deliveryTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Tổng tiền:</span>
                      <span className="font-bold text-green-600 text-sm">
                        {formatVND(isEditingOrderItems 
                          ? calculateOrderTotals(editingOrderItems).finalTotal 
                          : selectedOrder.finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Status */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-base font-semibold mb-3 flex items-center text-gray-900">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Trạng thái đơn hàng
                  </h3>
                  
                  {isEditingStatus ? (
                    <div className="mt-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chọn trạng thái mới:
                        </label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent mb-3"
                        >
                          {statusOptions
                            .filter((option) => {
                              // Với Sepay: chỉ cho phép chọn các status hợp lệ
                              if (selectedOrder.paymentMethod === 'Sepay') {
                                const currentStatus = selectedOrder.status;
                                // Nếu đang ở 'paid', chỉ cho phép chọn 'shipped' hoặc 'delivered'
                                if (currentStatus === 'paid') {
                                  return ['paid', 'shipped', 'delivered'].includes(option.value);
                                }
                                // Nếu đang ở 'shipped', chỉ cho phép chọn 'delivered'
                                if (currentStatus === 'shipped') {
                                  return ['shipped', 'delivered'].includes(option.value);
                                }
                                // Nếu đã 'delivered', không cho phép thay đổi
                                if (currentStatus === 'delivered') {
                                  return false;
                                }
                              }
                              // Với các phương thức khác: cho phép chọn tất cả (trừ khi đã delivered)
                              if (selectedOrder.status === 'delivered') {
                                return false;
                              }
                              return true;
                            })
                            .map((option) => {
                              return (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              );
                            })}
                        </select>
                        {selectedOrder.paymentMethod === 'Sepay' && (
                          <p className="text-xs text-blue-600 mt-1">
                            * Đơn hàng Sepay đã thanh toán. Có thể chuyển sang &quot;Đang giao hàng&quot; hoặc &quot;Đã giao&quot;.
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleStatusUpdate}
                          className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          <Check size={16} className="mr-2" />
                          Cập nhật
                        </button>
                        <button
                          onClick={cancelEditStatus}
                          className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600 transition-colors"
                        >
                          <X size={16} className="mr-2" />
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {(() => {
                            // Hiển thị status thực tế của đơn hàng (bao gồm cả Sepay)
                            const displayStatus = selectedOrder.status;
                            const StatusIcon = getStatusIcon(displayStatus);
                            const statusColors = {
                              pending: 'bg-yellow-100 text-yellow-800',
                              processing: 'bg-blue-100 text-blue-800',
                              shipped: 'bg-purple-100 text-purple-800',
                              delivered: 'bg-green-100 text-green-800',
                              cancelled: 'bg-red-100 text-red-800',
                              paid: 'bg-emerald-100 text-emerald-800',
                            };
                            return (
                              <>
                                <StatusIcon size={20} className="mr-3 text-gray-600" />
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[displayStatus.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                                  {displayStatus}
                                </span>
                                {selectedOrder.paymentMethod === 'Sepay' && (
                                  <span className="ml-2 text-xs text-blue-600">(Sepay)</span>
                                )}
                              </>
                            );
                          })()}
                        </div>
                        {(() => {
                          // Với Sepay: chỉ cho phép chỉnh sửa nếu status chưa phải 'delivered'
                          // Và chỉ cho phép chuyển từ 'paid' sang 'shipped' hoặc 'delivered'
                          if (selectedOrder.paymentMethod === 'Sepay') {
                            const canEdit = selectedOrder.status !== 'delivered';
                            return canEdit ? (
                              <button
                                onClick={startEditStatus}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Chỉnh sửa trạng thái đơn hàng"
                              >
                                <Edit size={16} />
                              </button>
                            ) : (
                              <span className="text-xs text-gray-500 italic">(Đã giao)</span>
                            );
                          }
                          // Với các phương thức khác: luôn cho phép chỉnh sửa (trừ khi đã delivered)
                          return selectedOrder.status !== 'delivered' ? (
                            <button
                              onClick={startEditStatus}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Chỉnh sửa trạng thái đơn hàng"
                            >
                              <Edit size={16} />
                            </button>
                          ) : (
                            <span className="text-xs text-gray-500 italic">(Đã giao)</span>
                          );
                        })()}
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedOrder.paymentMethod === 'Sepay' 
                          ? 'Đơn hàng Sepay đã thanh toán. Có thể chuyển từ "Đã thanh toán" sang "Đang giao hàng" hoặc "Đã giao".'
                          : 'Cập nhật trạng thái đơn hàng để khách hàng theo dõi được tiến trình giao hàng.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-base font-semibold mb-3 flex items-center justify-between text-gray-900">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      Phương thức thanh toán
                    </div>
                    {!isEditingPaymentMethod && !['paid', 'shipped', 'delivered'].includes(selectedOrder.status) && (
                      <button
                        onClick={startEditPaymentMethod}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Chỉnh sửa phương thức thanh toán"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    {['paid', 'shipped', 'delivered'].includes(selectedOrder.status) && (
                      <span className="text-xs text-gray-500 italic">
                        (Đã khóa)
                      </span>
                    )}
                  </h3>
                  
                  {isEditingPaymentMethod ? (
                    <div className="mt-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chọn phương thức thanh toán:
                        </label>
                        <select
                          value={newPaymentMethod}
                          onChange={(e) => {
                            const selectedMethod = e.target.value;
                            setNewPaymentMethod(selectedMethod);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent mb-3"
                        >
                          {paymentMethodOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {newPaymentMethod === 'Sepay' && (
                          <p className="text-xs text-blue-600 mt-1">
                            * Khi chọn Sepay, trạng thái đơn hàng sẽ tự động chuyển thành &quot;Đã thanh toán&quot;
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handlePaymentMethodUpdate}
                          className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          <Check size={16} className="mr-2" />
                          Cập nhật
                        </button>
                        <button
                          onClick={cancelEditPaymentMethod}
                          className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600 transition-colors"
                        >
                          <X size={16} className="mr-2" />
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2" key={`payment-method-${selectedOrder.paymentMethod}-${selectedOrder.id || selectedOrder._id}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Phương thức:</span>
                        <span className="font-medium text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-md" key={`payment-method-display-${selectedOrder.paymentMethod}`}>
                          {(() => {
                            const method = paymentMethodOptions.find(
                              opt => opt.value === selectedOrder.paymentMethod
                            );
                            return method ? method.label : selectedOrder.paymentMethod || 'N/A';
                          })()}
                        </span>
                      </div>
                      {selectedOrder.paymentMethod === 'Sepay' && (
                        <p className="text-xs text-blue-600 mt-2">
                          * Đơn hàng thanh toán qua Sepay tự động có trạng thái &quot;Đã thanh toán&quot;
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold flex items-center text-gray-900">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Sản phẩm đã đặt
                  </h3>
                  {!isEditingOrderItems && (
                    <button
                      onClick={startEditOrderItems}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      <Edit size={16} />
                      Chỉnh sửa
                    </button>
                  )}
                </div>

                {isEditingOrderItems ? (
                  <>
                    {/* Edit Mode - Add Product */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thêm sản phẩm
                      </label>
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            const selectedProduct = products.find(p => p._id === e.target.value);
                            if (selectedProduct) {
                              addProductToOrderItems(selectedProduct);
                              e.target.value = '';
                            }
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        disabled={loadingProducts}
                      >
                        <option value="">-- Chọn sản phẩm để thêm --</option>
                        {products.map((product) => {
                          const price = product.promotionalPrice || product.price || 0;
                          const stockStatus = product.stockStatus || 'Còn hàng';
                          const isOutOfStock = stockStatus === 'Hết hàng';
                          return (
                            <option
                              key={product._id}
                              value={product._id}
                              disabled={isOutOfStock}
                            >
                              {product.name} - {formatVND(price)} {isOutOfStock ? '(Hết hàng)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Edit Mode - Order Items List */}
                    <div className="space-y-2 mb-4">
                      {editingOrderItems.map((item, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                              <Image
                                src={item.image || '/images/placeholder.jpg'}
                                alt={item.title}
                                width={48}
                                height={48}
                                className="rounded-md object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate text-sm">{item.title}</h4>
                              <p className="text-xs font-semibold text-green-600 mt-0.5">
                                {formatVND(item.price)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mx-3">
                              <button
                                onClick={() => updateOrderItemQuantity(index, item.quantity - 1)}
                                className="p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={16} />
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateOrderItemQuantity(index, parseInt(e.target.value) || 1)}
                                min="1"
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                              />
                              <button
                                onClick={() => updateOrderItemQuantity(index, item.quantity + 1)}
                                className="p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            <div className="text-right mr-3">
                              <p className="font-bold text-base text-gray-900">
                                {formatVND(item.price * item.quantity)}
                              </p>
                            </div>
                            <button
                              onClick={() => removeOrderItem(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Edit Mode - Summary */}
                    {(() => {
                      const { totalPrice, discount, totalAfterDiscount, shippingFee, finalTotal } = calculateOrderTotals(editingOrderItems);
                      return (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                          <h4 className="text-sm font-semibold mb-3 text-gray-900">Tóm tắt đơn hàng</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Tổng tiền sản phẩm:</span>
                              <span className="font-medium text-sm text-gray-900">{formatVND(totalPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Giảm giá:</span>
                              <span className="font-medium text-sm text-gray-900">{formatVND(discount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Phí vận chuyển:</span>
                              <span className="font-medium text-sm text-gray-900">{formatVND(shippingFee)}</span>
                            </div>
                            <div className="border-t border-gray-300 pt-2 mt-2">
                              <div className="flex justify-between">
                                <span className="text-base font-semibold text-gray-900">Tổng cộng:</span>
                                <span className="text-lg font-bold text-green-600">{formatVND(finalTotal)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Edit Mode - Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={saveOrderItems}
                        disabled={isSavingOrderItems || editingOrderItems.length === 0}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check size={16} className="mr-2" />
                        {isSavingOrderItems ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                      <button
                        onClick={cancelEditOrderItems}
                        disabled={isSavingOrderItems}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600 transition-colors disabled:opacity-50"
                      >
                        <X size={16} className="mr-2" />
                        Hủy
                      </button>
                    </div>
                  </>
                ) : (
                  /* View Mode - Order Items List */
                  <div className="space-y-2">
                    {selectedOrder.orderItems?.map((item, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                            <Image
                              src={item.image || '/images/placeholder.jpg'}
                              alt={item.title}
                              width={48}
                              height={48}
                              className="rounded-md object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate text-sm">{item.title}</h4>
                            <p className="text-xs text-gray-600 mt-0.5">Số lượng: {item.quantity}</p>
                            <p className="text-xs font-semibold text-green-600 mt-0.5">
                              {formatVND(item.price)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-base text-gray-900">
                              {formatVND(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Đơn hàng được tạo lúc: {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                </div>
                <div className="flex gap-2">
                  {/* Tạm thời tắt chức năng in hóa đơn */}
                  {/* <button
                    onClick={handlePrintInvoice}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Printer size={16} />
                    In hóa đơn
                  </button> */}
                  <button
                    onClick={() => {
                      setSelectedOrder(null);
                      setIsEditingStatus(false);
                      setIsEditingPaymentMethod(false);
                      setIsEditingOrderItems(false);
                      setEditingOrderItems([]);
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        typeof document !== 'undefined' ? document.body : null
      )}

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={cancelDelete}
            ></div>
            
            {/* Modal */}
            <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl">
              {/* Header */}
              <div className="bg-red-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white bg-opacity-20">
                      <Trash2 size={24} className="text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-white">Xác nhận xóa</h3>
                      <p className="text-sm text-red-100">Bạn có chắc chắn muốn xóa đơn hàng này?</p>
                    </div>
                  </div>
                  <button
                    onClick={cancelDelete}
                    className="rounded-full p-1 text-white hover:bg-white hover:bg-opacity-20 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-6">
                {/* Order Info Card */}
                <div className="mb-6 rounded-lg bg-gray-50 p-4 border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Mã đơn hàng</span>
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        #{orderToDelete?.id?.slice(-6) || orderToDelete?._id?.slice(-6)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Khách hàng</span>
                      <span className="text-sm font-semibold text-gray-900">{orderToDelete?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Tổng tiền</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatVND(orderToDelete?.finalTotal || orderToDelete?.totalAmount || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warning Message */}
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Hành động không thể hoàn tác</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>Đơn hàng sẽ bị xóa vĩnh viễn khỏi hệ thống.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4">
                <div className="flex space-x-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Xóa đơn hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal - Using Portal */}
      {showCreateOrder && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeCreateOrder();
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-6xl w-full h-[95vh] overflow-hidden flex flex-col shadow-2xl m-4">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Tạo đơn hàng mới</h2>
                  <p className="text-sm text-gray-600 mt-1">Nhập thông tin khách hàng và chọn sản phẩm</p>
                </div>
                <button
                  onClick={closeCreateOrder}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
                  aria-label="Đóng"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4 overflow-y-auto flex-1 min-h-0">
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-base font-semibold mb-4 flex items-center text-gray-900">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Thông tin khách hàng
                  </h3>
                  
                  {/* Customer Type Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Loại khách hàng <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="customerType"
                          value="existing"
                          checked={customerType === 'existing'}
                          onChange={(e) => handleCustomerTypeChange(e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Khách hàng có sẵn</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="customerType"
                          value="new"
                          checked={customerType === 'new'}
                          onChange={(e) => handleCustomerTypeChange(e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Khách lạ (mới)</span>
                      </label>
                    </div>
                  </div>

                  {customerType === 'existing' ? (
                    /* Existing Customer Selection */
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chọn khách hàng <span className="text-red-500">*</span>
                      </label>
                      {loadingCustomers ? (
                        <div className="text-sm text-gray-600 py-2">Đang tải danh sách khách hàng...</div>
                      ) : (
                        <>
                          <select
                            value={selectedCustomerId}
                            onChange={(e) => handleSelectExistingCustomer(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                          >
                            <option value="">-- Chọn khách hàng --</option>
                            {existingCustomers.map((customer) => (
                              <option key={customer.id} value={customer.id}>
                                {customer.name} - {customer.phone} {customer.orderCount > 0 && `(${customer.orderCount} đơn)`}
                              </option>
                            ))}
                          </select>
                          {existingCustomers.length === 0 && (
                            <p className="text-xs text-gray-500 mt-2">Chưa có khách hàng nào trong hệ thống</p>
                          )}
                        </>
                      )}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên khách hàng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newOrderData.name}
                        onChange={(e) => setNewOrderData({ ...newOrderData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Nhập tên khách hàng"
                        disabled={customerType === 'existing' && selectedCustomerId}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newOrderData.phone}
                        onChange={(e) => setNewOrderData({ ...newOrderData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Nhập số điện thoại"
                        disabled={customerType === 'existing' && selectedCustomerId}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newOrderData.address}
                        onChange={(e) => setNewOrderData({ ...newOrderData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Nhập địa chỉ giao hàng"
                        disabled={customerType === 'existing' && selectedCustomerId}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ghi chú
                      </label>
                      <textarea
                        value={newOrderData.note}
                        onChange={(e) => setNewOrderData({ ...newOrderData, note: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        placeholder="Nhập ghi chú (nếu có)"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phương thức thanh toán
                      </label>
                      <select
                        value={newOrderData.paymentMethod}
                        onChange={(e) => setNewOrderData({ 
                          ...newOrderData, 
                          paymentMethod: e.target.value,
                          status: e.target.value === 'Sepay' ? 'paid' : newOrderData.status
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      >
                        <option value="COD">COD (Thanh toán khi nhận hàng)</option>
                        <option value="BankTransfer">Chuyển khoản</option>
                        <option value="Sepay">Sepay</option>
                        <option value="MoMo">MoMo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trạng thái đơn hàng
                      </label>
                      <select
                        value={newOrderData.status}
                        onChange={(e) => setNewOrderData({ ...newOrderData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        disabled={newOrderData.paymentMethod === 'Sepay'}
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {newOrderData.paymentMethod === 'Sepay' && (
                        <p className="text-xs text-blue-600 mt-1">
                          * Đơn hàng thanh toán qua Sepay tự động có trạng thái &quot;Đã thanh toán&quot;
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Products Selection */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-base font-semibold mb-4 flex items-center text-gray-900">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Chọn sản phẩm
                  </h3>
                  
                  {loadingProducts ? (
                    <div className="text-center py-4 text-gray-600">Đang tải danh sách sản phẩm...</div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chọn sản phẩm
                        </label>
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              const selectedProduct = products.find(p => p._id === e.target.value);
                              if (selectedProduct) {
                                addProductToOrder(selectedProduct);
                                e.target.value = ''; // Reset dropdown
                              }
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        >
                          <option value="">-- Chọn sản phẩm để thêm --</option>
                          {products.map((product) => {
                            const price = product.promotionalPrice || product.price || 0;
                            const stockStatus = product.stockStatus || 'Còn hàng';
                            const isOutOfStock = stockStatus === 'Hết hàng';
                            return (
                              <option
                                key={product._id}
                                value={product._id}
                                disabled={isOutOfStock}
                              >
                                {product.name} - {formatVND(price)} {isOutOfStock ? '(Hết hàng)' : ''}
                              </option>
                            );
                          })}
                        </select>
                        {products.length === 0 && (
                          <p className="text-xs text-gray-500 mt-1">Không có sản phẩm nào</p>
                        )}
                      </div>

                      {/* Selected Products */}
                      {newOrderData.orderItems.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Sản phẩm đã chọn:</h4>
                          {newOrderData.orderItems.map((item, index) => (
                            <div key={index} className="flex items-center p-3 bg-white border border-gray-200 rounded-md">
                              <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                                <Image
                                  src={item.image || '/images/placeholder.jpg'}
                                  alt={item.title}
                                  width={48}
                                  height={48}
                                  className="rounded-md object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-900 truncate">{item.title}</p>
                                <p className="text-xs text-gray-600">{formatVND(item.price)}</p>
                              </div>
                              <div className="flex items-center gap-2 mx-3">
                                <button
                                  onClick={() => handleDecreaseQuantity(index)}
                                  className="p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                                >
                                  <Minus size={16} />
                                </button>
                                <input
                                  type="number"
                                  step={isKgUnit(item.unit) ? "0.5" : "1"}
                                  value={item.quantity}
                                  onChange={(e) => updateProductQuantity(index, parseFloat(e.target.value) || (isKgUnit(item.unit) ? 0.5 : 1))}
                                  min={isKgUnit(item.unit) ? "0.5" : "1"}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                                />
                                <button
                                  onClick={() => handleIncreaseQuantity(index)}
                                  className="p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                              <div className="text-right mr-3">
                                <p className="font-semibold text-sm text-gray-900">
                                  {formatVND(item.price * item.quantity)}
                                </p>
                              </div>
                              <button
                                onClick={() => removeProductFromOrder(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Order Summary */}
                {newOrderData.orderItems.length > 0 && (() => {
                  const { totalPrice, discount, totalAfterDiscount, shippingFee, finalTotal } = calculateTotals();
                  return (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="text-base font-semibold mb-4 flex items-center text-gray-900">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        Tóm tắt đơn hàng
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tổng tiền sản phẩm:</span>
                          <span className="font-medium text-sm text-gray-900">{formatVND(totalPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Phí vận chuyển:</span>
                          <span className="font-medium text-sm text-gray-900">{formatVND(shippingFee)}</span>
                        </div>
                        <div className="border-t border-gray-300 pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className="text-base font-semibold text-gray-900">Tổng cộng:</span>
                            <span className="text-lg font-bold text-green-600">{formatVND(finalTotal)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeCreateOrder}
                  className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                  disabled={creatingOrder}
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateOrder}
                  disabled={creatingOrder || newOrderData.orderItems.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                >
                  {creatingOrder ? 'Đang tạo...' : 'Tạo đơn hàng'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        typeof document !== 'undefined' ? document.body : null
      )}

      {/* Invoice Print View - Tạm thời tắt chức năng in hóa đơn */}
    </div>
  );
}

