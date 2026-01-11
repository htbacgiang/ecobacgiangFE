/**
 * API Services - Wrapper functions cho các API endpoints
 * Tất cả APIs đều sử dụng Node.js backend server qua apiClient
 */

import { apiClient } from './api-client';

// ============ AUTHENTICATION ============
// Sử dụng Backend API server
export const authService = {
  signup: async (data) => {
    const result = await apiClient.post('/auth/signup', data);
    
    if (!result || result.status === 'error') {
      throw new Error(result?.message || 'Đã xảy ra lỗi khi đăng ký.');
    }
    
    return result;
  },

  signin: async (email, password) => {
    const result = await apiClient.post('/auth/signin', { email, password });
    
    if (!result || result.status === 'error') {
      throw new Error(result?.message || 'Đã xảy ra lỗi khi đăng nhập.');
    }
    
    // Lưu token vào localStorage
    if (result.token && typeof window !== 'undefined') {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    
    return result;
  },

  verifyEmailOTP: async (email, otp) => {
    const result = await apiClient.post('/auth/verify-email-otp', { email, otp });
    
    if (!result || result.status === 'error') {
      throw new Error(result?.message || 'Đã xảy ra lỗi khi xác nhận email.');
    }
    
    return result;
  },

  resendEmailOTP: async (email) => {
    const result = await apiClient.post('/auth/resend-email-otp', { email });
    
    if (!result || result.status === 'error') {
      throw new Error(result?.message || 'Đã xảy ra lỗi khi gửi lại mã OTP.');
    }
    
    return result;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  forgotPassword: async (email) => {
    const result = await apiClient.post('/auth/forgot-password', { email });
    
    if (!result || result.status === 'error') {
      throw new Error(result?.message || 'Đã xảy ra lỗi khi gửi mã OTP.');
    }
    
    return result;
  },

  resetPassword: async (email, otp, newPassword, confirmPassword) => {
    const result = await apiClient.post('/auth/reset-password', { 
      email, 
      otp, 
      newPassword, 
      confirmPassword 
    });
    
    if (!result || result.status === 'error') {
      throw new Error(result?.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu.');
    }
    
    return result;
  },
};

// ============ PRODUCTS ============
export const productService = {
  getAll: async (category = null) => {
    const endpoint = category ? `/products?category=${category}` : '/products';
    return apiClient.get(endpoint);
  },

  getBySlug: async (slug) => {
    return apiClient.get(`/products/${slug}`);
  },

  getById: async (id) => {
    return apiClient.get(`/products?_id=${id}`);
  },

  create: async (data) => {
    return apiClient.post('/products', data);
  },

  update: async (id, data) => {
    return apiClient.put(`/products/${id}`, data);
  },

  delete: async (id) => {
    return apiClient.delete(`/products/${id}`);
  },

  checkSlug: async (slug, excludeId = null) => {
    return apiClient.post('/products/check-slug', { slug, _id: excludeId });
  },

  search: async (query) => {
    return apiClient.get(`/products?search=${encodeURIComponent(query)}`);
  },
};

// ============ CART ============
export const cartService = {
  get: async (userId) => {
    return apiClient.get(`/cart?userId=${userId}`);
  },

  add: async (data) => {
    return apiClient.post('/cart', data);
  },

  update: async (userId, productId, quantity) => {
    return apiClient.put(`/cart/${userId}/${productId}`, { quantity });
  },

  remove: async (userId, productId) => {
    return apiClient.delete(`/cart/${userId}/${productId}`);
  },

  applyCoupon: async (userId, couponData) => {
    return apiClient.put(`/cart/${userId}/apply-coupon`, couponData);
  },
};

// ============ ORDERS ============
export const orderService = {
  getAll: async () => {
    return apiClient.get('/orders');
  },

  getById: async (id) => {
    return apiClient.get(`/orders/${id}`);
  },

  cancel: async (id) => {
    return apiClient.patch(`/orders/${id}`, { status: 'cancelled' });
  },

  update: async (id, data) => {
    return apiClient.patch(`/orders/${id}`, data);
  },
};

// ============ USER ============
export const userService = {
  getAll: async (pageNo = 0, limit = 5) => {
    return apiClient.get(`/user?pageNo=${pageNo}&limit=${limit}`);
  },

  getMe: async () => {
    return apiClient.get('/user/me');
  },

  getById: async (userId) => {
    return apiClient.get(`/user/${userId}`);
  },

  update: async (userId, data) => {
    return apiClient.put(`/user/${userId}`, data);
  },

  delete: async (userId) => {
    return apiClient.delete(`/user/${userId}`);
  },
};

// ============ WISHLIST ============
export const wishlistService = {
  getAll: async () => {
    return apiClient.get('/wishlist');
  },

  add: async (productId, style = null) => {
    return apiClient.post(`/wishlist/${productId}`, { style });
  },

  remove: async (productId) => {
    return apiClient.delete(`/wishlist/${productId}`);
  },
};

// ============ ADDRESS ============
export const addressService = {
  getAll: async () => {
    return apiClient.get('/address');
  },

  add: async (data) => {
    return apiClient.post('/address', data);
  },

  // Recommended: update/remove by address subdocument _id
  updateById: async (addressId, data) => {
    return apiClient.put(`/address/${addressId}`, data);
  },

  removeById: async (addressId) => {
    return apiClient.delete(`/address/${addressId}`);
  },

  // Legacy: update/remove by index in address array
  update: async (index, data) => {
    return apiClient.put(`/address/${index}`, data);
  },

  remove: async (index) => {
    return apiClient.delete(`/address/${index}`);
  },
};

// ============ CHECKOUT ============
export const checkoutService = {
  create: async (data) => {
    return apiClient.post('/checkout', data);
  },
};

// ============ PAYMENT ============
export const paymentService = {
  createSepay: async (amount, orderInfo = null) => {
    return apiClient.post('/payment/sepay', { amount, orderInfo });
  },

  createMomo: async (amount, orderInfo = null) => {
    return apiClient.post('/payment/momo', { amount, orderInfo });
  },

  refreshSepayQR: async (paymentCode) => {
    return apiClient.post('/payment/sepay/refresh', { paymentCode });
  },

  checkSepayStatus: async (paymentCode) => {
    return apiClient.get(`/payment/sepay/status?paymentCode=${paymentCode}`);
  },

  confirmSepayPayment: async (paymentCode, amount = null) => {
    return apiClient.post('/payment/sepay/confirm', { paymentCode, amount });
  },

  getMethods: async () => {
    return apiClient.get('/payment/methods');
  },
};

// ============ COUPON ============
export const couponService = {
  getAll: async () => {
    return apiClient.get('/coupon');
  },

  validate: async (code) => {
    return apiClient.get(`/coupon?coupon=${code}`);
  },

  create: async (data) => {
    return apiClient.post('/coupon', data);
  },

  update: async (couponId, data) => {
    return apiClient.put(`/coupon/${couponId}`, data);
  },

  delete: async (couponId) => {
    return apiClient.delete(`/coupon/${couponId}`);
  },
};

// ============ SUBSCRIPTION ============
export const subscriptionService = {
  subscribe: async (email) => {
    return apiClient.post('/subscription', { email });
  },

  unsubscribe: async (email) => {
    return apiClient.post('/subscription/unsubscribe', { email });
  },
};

// ============ SURVEY ============
export const surveyService = {
  submit: async (data) => {
    return apiClient.post('/survey', data);
  },
};

// ============ IMAGE ============
export const imageService = {
  getAll: async (type = null) => {
    const endpoint = type ? `/image?type=${type}` : '/image';
    return apiClient.get(endpoint);
  },

  upload: async (file, altText = '', folder = 'ecobacgiang') => {
    // Sử dụng FormData cho file upload
    const formData = new FormData();
    formData.append('image', file);
    formData.append('altText', altText);
    formData.append('folder', folder);
    
    // apiClient không hỗ trợ FormData trực tiếp, cần dùng fetch
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
    if (!apiBaseUrl) {
      throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // KHÔNG set Content-Type - browser sẽ tự động set với boundary
    
    const response = await fetch(`${apiBaseUrl}/image`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to upload image`);
    }
    
    return await response.json();
  },

  updateAltText: async (publicId, altText) => {
    return apiClient.put('/image/alt-text', { publicId, altText });
  },
};

// ============ POSTS ============
export const postService = {
  getAll: async () => {
    return apiClient.get('/posts');
  },

  getById: async (postId) => {
    return apiClient.get(`/posts/${postId}`);
  },
};

// ============ RECRUITMENT ============
export const recruitmentService = {
  apply: async (formData) => {
    // Sử dụng FormData cho file upload
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
    if (!apiBaseUrl) {
      throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // KHÔNG set Content-Type - browser sẽ tự động set với boundary
    
    const response = await fetch(`${apiBaseUrl}/recruitment/apply`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to submit application`);
    }
    
    return await response.json();
  },

  list: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.jobTitle) queryParams.append('jobTitle', params.jobTitle);
    
    const endpoint = `/recruitment/list${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiClient.get(endpoint);
  },

  stats: async () => {
    return apiClient.get('/recruitment/stats');
  },

  updateStatus: async (applicationId, status, notes) => {
    return apiClient.put('/recruitment/update-status', { applicationId, status, notes });
  },
};

// ============ PROMO BANNER ============
export const promoBannerService = {
  get: async () => {
    return apiClient.get('/promo-banner');
  },

  update: async (data) => {
    return apiClient.put('/promo-banner', data);
  },
};

// Export all services
export default {
  auth: authService,
  product: productService,
  cart: cartService,
  order: orderService,
  user: userService,
  wishlist: wishlistService,
  address: addressService,
  checkout: checkoutService,
  coupon: couponService,
  subscription: subscriptionService,
  survey: surveyService,
  post: postService,
  recruitment: recruitmentService,
  promoBanner: promoBannerService,
};

