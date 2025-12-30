/**
 * Auth Helper - Hỗ trợ authentication với API server mới
 * Tương thích với NextAuth để có thể dùng song song
 */

import { authService } from './api-services';
import { signIn as nextAuthSignIn, getSession } from 'next-auth/react';

/**
 * Đăng nhập với API server mới
 * Lưu token vào localStorage và sync với NextAuth để dashboard hoạt động
 */
export const signInWithApiServer = async (email, password) => {
  // Đăng nhập bằng Server API
  const response = await authService.signin(email, password);
  // Token đã được lưu tự động trong authService.signin
  
  // Sau khi đăng nhập Server API thành công, tự động đăng nhập NextAuth
  // để tạo session cho dashboard (dashboard kiểm tra NextAuth session)
  try {
    const nextAuthResult = await nextAuthSignIn('credentials', {
      email: email,
      password: password,
      redirect: false,
    });
    
    if (nextAuthResult?.error) {
      console.warn('NextAuth signin failed (non-critical):', nextAuthResult.error);
      // Không throw error vì Server API đã đăng nhập thành công
    }
  } catch (error) {
    console.warn('NextAuth signin error (non-critical):', error);
    // Không throw error vì Server API đã đăng nhập thành công
  }
  
  return response;
};

/**
 * Lấy user hiện tại từ token
 */
export const getCurrentUser = () => {
  return authService.getCurrentUser();
};

/**
 * Kiểm tra user đã đăng nhập chưa
 */
export const isAuthenticated = () => {
  const token = authService.getToken();
  return !!token;
};

/**
 * Đăng xuất
 */
export const signOut = () => {
  authService.logout();
  // Có thể thêm logic để sign out NextAuth nếu cần
};

/**
 * Lấy token để dùng trong API calls
 */
export const getAuthToken = () => {
  return authService.getToken();
};

