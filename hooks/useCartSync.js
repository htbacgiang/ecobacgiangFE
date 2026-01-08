/**
 * Hook để tự động đồng bộ cart khi session thay đổi
 * Sync cart từ localStorage với cart từ server khi user đăng nhập
 */

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { syncCartAfterLogin } from '../lib/cart-sync';

export const useCartSync = () => {
  const { data: session, status } = useSession();
  const hasSyncedRef = useRef(false);
  const lastUserIdRef = useRef(null);

  useEffect(() => {
    // Chỉ sync khi:
    // 1. Session đã được load (status === 'authenticated')
    // 2. Có user ID
    // 3. Chưa sync cho user này
    // 4. Đang ở client side
    if (typeof window === 'undefined') return;

    if (status === 'authenticated' && session?.user?.id) {
      const currentUserId = session.user.id;
      
      // Nếu đã sync cho user này rồi, không sync lại
      if (hasSyncedRef.current && lastUserIdRef.current === currentUserId) {
        return;
      }

      // Nếu user thay đổi (đăng nhập user khác), reset và sync lại
      if (lastUserIdRef.current && lastUserIdRef.current !== currentUserId) {
        hasSyncedRef.current = false;
      }

      // Sync cart
      if (!hasSyncedRef.current) {
        console.log('🛒 useCartSync: Syncing cart for user:', currentUserId);
        hasSyncedRef.current = true;
        lastUserIdRef.current = currentUserId;
        
        // Đợi một chút để đảm bảo Redux state đã sẵn sàng
        const timeoutId = setTimeout(async () => {
          try {
            await syncCartAfterLogin(currentUserId);
          } catch (error) {
            console.error('Error in useCartSync:', error);
            // Reset để có thể thử lại
            hasSyncedRef.current = false;
          }
        }, 1000);

        return () => clearTimeout(timeoutId);
      }
    } else if (status === 'unauthenticated') {
      // Khi user đăng xuất, reset để có thể sync lại khi đăng nhập
      hasSyncedRef.current = false;
      lastUserIdRef.current = null;
    }
  }, [session, status]);
};
