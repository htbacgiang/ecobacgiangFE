/**
 * Auth Helper - Hỗ trợ authentication với API server mới
 * Tương thích với NextAuth để có thể dùng song song
 */

import { authService } from './api-services';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, getSession } from 'next-auth/react';
import { syncCartAfterLogin } from './cart-sync';

/**
 * Đăng nhập với API server mới
 * Lưu token vào localStorage và sync với NextAuth để dashboard hoạt động
 */
export const signInWithApiServer = async (email, password) => {
  // Đăng nhập bằng Next.js API (signin route)
  const response = await authService.signin(email, password);
  // Token đã được lưu tự động trong authService.signin
  
  // Sau khi đăng nhập thành công, tự động đăng nhập NextAuth
  // để tạo session cho dashboard (dashboard kiểm tra NextAuth session)
  try {
    // Normalize email để đảm bảo match với database
    const normalizedEmail = email.toLowerCase().trim();
    
    const nextAuthResult = await nextAuthSignIn('credentials', {
      email: normalizedEmail,
      password: password,
      redirect: false,
    });
    
    if (nextAuthResult?.error) {
      console.error('NextAuth signin failed:', nextAuthResult.error);
      // Nếu NextAuth fail, vẫn return response nhưng log error
      // Vì dashboard cần NextAuth session, nên đây là vấn đề cần fix
    } else {
      console.log('NextAuth session created successfully');
      // Refresh session để đảm bảo dashboard nhận được session mới
      if (typeof window !== 'undefined') {
        // Trigger session refresh bằng cách gọi getSession
        await getSession();
      }
    }
  } catch (error) {
    console.error('NextAuth signin error:', error);
    // Không throw error vì API đã đăng nhập thành công
    // Nhưng dashboard sẽ không hoạt động nếu không có NextAuth session
  }
  
  // Đồng bộ cart sau khi đăng nhập thành công
  if (response?.user?.id && typeof window !== 'undefined') {
    try {
      // Đợi một chút để đảm bảo Redux state đã sẵn sàng
      setTimeout(async () => {
        await syncCartAfterLogin(response.user.id);
      }, 500);
    } catch (error) {
      console.error('Error syncing cart after login:', error);
      // Không throw error vì đăng nhập đã thành công
    }
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
 * Đăng xuất – xóa token BE và session NextAuth, optional redirect
 * @param {Object} options - { callbackUrl?: string } (NextAuth signOut options)
 */
export const signOut = (options = {}) => {
  authService.logout();
  return nextAuthSignOut({ callbackUrl: '/', ...options });
};

/**
 * Lấy token để dùng trong API calls
 */
export const getAuthToken = () => {
  return authService.getToken();
};

