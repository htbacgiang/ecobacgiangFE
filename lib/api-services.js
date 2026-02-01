/**
 * API Services - Wrapper functions cho các API endpoints
 * Tất cả APIs đều sử dụng Node.js backend server qua apiClient
 */

import { apiClient } from './api-client';

// Auth error từ api-client: thiếu token → redirect đăng nhập (không throw để tránh crash)
const isMissingTokenMessage = (msg) =>
  /token không được cung cấp|missing token|unauthorized/i.test(msg || '');

/** opts.noRedirect = true: khi thiếu token chỉ return false, không redirect (dùng cho wishlist/cart) */
const throwIfAuthError = (result, opts = {}) => {
  if (!result || !result._authError) return true;
  const msg = result.message || '';
  const isTokenError = isMissingTokenMessage(msg);
  if (isTokenError && typeof window !== 'undefined') {
    if (opts.noRedirect) return false;
    const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/dang-nhap?callbackUrl=${callbackUrl}`;
    return false;
  }
  throw new Error(msg || 'Đã xảy ra lỗi.');
};

// ============ AUTHENTICATION ============
// Sử dụng Backend API server
export const authService = {
  signup: async (data) => {
    const result = await apiClient.post('/auth/signup', data);
    throwIfAuthError(result);
    if (!result || result.status === 'error') {
      throw new Error(result?.message || 'Đã xảy ra lỗi khi đăng ký.');
    }
    return result;
  },

  signin: async (email, password) => {
    const result = await apiClient.post('/auth/signin', { email, password });
    throwIfAuthError(result);
    if (!result || result.status === 'error') {
      throw new Error(result?.message || 'Đã xảy ra lỗi khi đăng nhập.');
    }
    if (result.token && typeof window !== 'undefined') {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    return result;
  },

  verifyEmailOTP: async (email, otp) => {
    const result = await apiClient.post('/auth/verify-email-otp', { email, otp });
    throwIfAuthError(result);
    if (!result || result.status === 'error') {
      throw new Error(result?.message || 'Đã xảy ra lỗi khi xác nhận email.');
    }
    return result;
  },

  resendEmailOTP: async (email) => {
    const result = await apiClient.post('/auth/resend-email-otp', { email });
    throwIfAuthError(result);
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

  /** Đồng bộ JWT từ session Google: gọi BE /auth/sync-token, lưu token + user vào localStorage */
  syncTokenFromSession: async (email) => {
    const result = await apiClient.post('/auth/sync-token', { email: email?.toLowerCase?.()?.trim() || email });
    throwIfAuthError(result);
    if (!result || result.status === 'error') {
      throw new Error(result?.message || 'Đồng bộ token thất bại.');
    }
    if (result.token && typeof window !== 'undefined') {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    return result;
  },

  forgotPassword: async (email) => {
    const result = await apiClient.post('/auth/forgot-password', { email });
    throwIfAuthError(result);
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
      confirmPassword,
    });
    throwIfAuthError(result);
    if (!result || result.status === 'error') {
      throw new Error(result?.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu.');
    }
    return result;
  },

  changePassword: async (currentPassword, newPassword, confirmNewPassword) => {
    const result = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
    throwIfAuthError(result);
    if (!result || result.status === 'error') {
      throw new Error(result?.message || 'Đã xảy ra lỗi khi đổi mật khẩu.');
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
    const result = await apiClient.get(`/cart?userId=${userId}`);
    if (!throwIfAuthError(result, { noRedirect: true })) return null;
    return result;
  },

  add: async (data) => {
    const result = await apiClient.post('/cart', data);
    if (!throwIfAuthError(result)) return null;
    return result;
  },

  update: async (userId, productId, quantity) => {
    const result = await apiClient.put(`/cart/${userId}/${productId}`, { quantity });
    if (!throwIfAuthError(result)) return null;
    return result;
  },

  remove: async (userId, productId) => {
    const result = await apiClient.delete(`/cart/${userId}/${productId}`);
    if (!throwIfAuthError(result)) return null;
    return result;
  },

  applyCoupon: async (userId, couponData) => {
    const result = await apiClient.put(`/cart/${userId}/apply-coupon`, couponData);
    if (!throwIfAuthError(result)) return null;
    return result;
  },
};

// ============ ORDERS ============
export const orderService = {
  getAll: async () => {
    const result = await apiClient.get('/orders');
    if (!throwIfAuthError(result)) return null;
    return result;
  },

  getById: async (id) => {
    const result = await apiClient.get(`/orders/${id}`);
    if (!throwIfAuthError(result)) return null;
    return result;
  },

  cancel: async (id) => {
    const result = await apiClient.patch(`/orders/${id}`, { status: 'cancelled' });
    if (!throwIfAuthError(result)) return null;
    return result;
  },

  update: async (id, data) => {
    const result = await apiClient.patch(`/orders/${id}`, data);
    if (!throwIfAuthError(result)) return null;
    return result;
  },
};

// ============ USER ============
export const userService = {
  getAll: async (pageNo = 0, limit = 5) => {
    const result = await apiClient.get(`/user?pageNo=${pageNo}&limit=${limit}`);
    if (!throwIfAuthError(result)) return null;
    return result;
  },

  getMe: async () => {
    const result = await apiClient.get('/user/me');
    if (!throwIfAuthError(result)) return null;
    return result;
  },

  getById: async (userId) => {
    const result = await apiClient.get(`/user/${userId}`);
    if (!throwIfAuthError(result)) return null;
    return result;
  },

  update: async (userId, data) => {
    const result = await apiClient.put(`/user/${userId}`, data);
    if (!throwIfAuthError(result)) return null;
    return result;
  },

  delete: async (userId) => {
    const result = await apiClient.delete(`/user/${userId}`);
    if (!throwIfAuthError(result)) return null;
    return result;
  },
};

// ============ WISHLIST ============
export const wishlistService = {
  getAll: async () => {
    const result = await apiClient.get('/wishlist');
    if (!throwIfAuthError(result, { noRedirect: true })) return [];
    return result;
  },

  add: async (productId, style = null) => {
    const result = await apiClient.post(`/wishlist/${productId}`, { style });
    if (!throwIfAuthError(result)) return null;
    return result;
  },

  remove: async (productId) => {
    const result = await apiClient.delete(`/wishlist/${productId}`);
    if (!throwIfAuthError(result)) return null;
    return result;
  },
};

// ============ ADDRESS ============
export const addressService = {
  getAll: async () => {
    const result = await apiClient.get('/address');
    if (!throwIfAuthError(result)) return null;
    return result;
  },

  add: async (data) => {
    const result = await apiClient.post('/address', data);
    if (!throwIfAuthError(result)) return null;
    return result;
  },

  updateById: async (addressId, data) => {
    const result = await apiClient.put(`/address/${addressId}`, data);
    if (!throwIfAuthError(result)) return null;
    return result;
  },

  removeById: async (addressId) => {
    const result = await apiClient.delete(`/address/${addressId}`);
    if (!throwIfAuthError(result)) return null;
    return result;
  },

  update: async (index, data) => {
    const result = await apiClient.put(`/address/${index}`, data);
    if (!throwIfAuthError(result)) return null;
    return result;
  },

  remove: async (index) => {
    const result = await apiClient.delete(`/address/${index}`);
    if (!throwIfAuthError(result)) return null;
    return result;
  },
};

// ============ CHECKOUT ============
export const checkoutService = {
  create: async (data) => {
    const result = await apiClient.post('/checkout', data);
    if (!throwIfAuthError(result)) return null;
    return result;
  },
};

// ============ PAYMENT ============
export const paymentService = {
  createSepay: async (amount, orderInfo = null) => {
    const result = await apiClient.post('/payment/sepay', { amount, orderInfo });
    if (!throwIfAuthError(result)) return null;
    return result;
  },

  createMomo: async (amount, orderInfo = null) => {
    const result = await apiClient.post('/payment/momo', { amount, orderInfo });
    if (!throwIfAuthError(result)) return null;
    return result;
  },

  refreshSepayQR: async (paymentCode) => {
    const result = await apiClient.post('/payment/sepay/refresh', { paymentCode });
    if (!throwIfAuthError(result)) return null;
    return result;
  },

  checkSepayStatus: async (paymentCode) => {
    const result = await apiClient.get(`/payment/sepay/status?paymentCode=${paymentCode}`);
    if (!throwIfAuthError(result)) return null;
    return result;
  },

  confirmSepayPayment: async (paymentCode, amount = null) => {
    const result = await apiClient.post('/payment/sepay/confirm', { paymentCode, amount });
    if (!throwIfAuthError(result)) return null;
    return result;
  },

  getMethods: async () => {
    const result = await apiClient.get('/payment/methods');
    if (!throwIfAuthError(result)) return null;
    return result;
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
const apiServices = {
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

export default apiServices;

