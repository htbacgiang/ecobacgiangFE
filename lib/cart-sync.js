/**
 * Cart Sync Utility - Đồng bộ cart từ localStorage với cart từ server sau khi đăng nhập
 */

import { cartService } from './api-services';
import store from '../store';
import { mergeCart, setCart } from '../store/cartSlice';

/**
 * Lấy cart từ localStorage (Redux state)
 */
const getLocalCart = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const state = store.getState();
    return state.cart?.cartItems || [];
  } catch (error) {
    console.error('Error getting local cart:', error);
    return null;
  }
};

/**
 * Đồng bộ cart sau khi đăng nhập
 * Merge cart từ localStorage với cart từ server
 */
export const syncCartAfterLogin = async (userId) => {
  if (!userId || typeof window === 'undefined') {
    console.warn('syncCartAfterLogin: userId is required and must be called on client side');
    return;
  }

  try {
    console.log('🛒 Starting cart sync after login for user:', userId);
    
    // 1. Lấy cart từ localStorage (Redux state)
    const localCartItems = getLocalCart();
    console.log('🛒 Local cart items:', localCartItems?.length || 0);
    
    // 2. Lấy cart từ server
    let dbCart = null;
    try {
      dbCart = await cartService.get(userId);
      console.log('🛒 Server cart items:', dbCart?.products?.length || 0);
    } catch (error) {
      console.error('Error fetching cart from server:', error);
      // Nếu không lấy được cart từ server (có thể do chưa có token khi đăng nhập bằng Google),
      // chỉ sync cart từ localStorage lên server
      if (localCartItems && localCartItems.length > 0) {
        console.log('🛒 Syncing local cart to server (server cart unavailable)');
        await syncLocalCartToServer(userId, localCartItems, []);
        // Sau khi sync, lấy lại cart từ server
        try {
          dbCart = await cartService.get(userId);
          if (dbCart) {
            store.dispatch(setCart({
              products: dbCart.products || [],
              cartTotal: dbCart.cartTotal || 0,
              coupon: dbCart.coupon || '',
              discount: dbCart.discount || 0,
              totalAfterDiscount: dbCart.totalAfterDiscount || 0,
            }));
          }
        } catch (retryError) {
          console.error('Error fetching cart after sync:', retryError);
        }
      }
      return;
    }

    // 3. Merge cart: sử dụng action mergeCart từ Redux
    const dbCartItems = dbCart?.products || [];
    
    // Nếu cả 2 cart đều rỗng, không cần làm gì
    if ((!localCartItems || localCartItems.length === 0) && 
        (!dbCartItems || dbCartItems.length === 0)) {
      console.log('🛒 Both carts are empty, no sync needed');
      return;
    }

    // Dispatch mergeCart action
    store.dispatch(mergeCart({
      localCartItems: localCartItems || [],
      dbCartItems: dbCartItems || [],
    }));

    // 4. Sync cart từ localStorage lên server
    // Chỉ sync những items từ localStorage (chưa có trên server hoặc có quantity lớn hơn)
    if (localCartItems && localCartItems.length > 0) {
      await syncLocalCartToServer(userId, localCartItems, dbCartItems);
    }

    // 6. Lấy cart cuối cùng từ server để đảm bảo đồng bộ
    const finalCart = await cartService.get(userId);
    if (finalCart) {
      store.dispatch(setCart({
        products: finalCart.products || [],
        cartTotal: finalCart.cartTotal || 0,
        coupon: finalCart.coupon || '',
        discount: finalCart.discount || 0,
        totalAfterDiscount: finalCart.totalAfterDiscount || 0,
      }));
      console.log('🛒 Cart sync completed successfully');
    }
  } catch (error) {
    console.error('Error syncing cart after login:', error);
  }
};

/**
 * Sync cart từ localStorage lên server
 * Thêm/update các sản phẩm từ localStorage vào cart trên server
 */
const syncLocalCartToServer = async (userId, localCartItems, dbCartItems = []) => {
  if (!localCartItems || localCartItems.length === 0) return;

  // Tạo map từ dbCart để kiểm tra sản phẩm đã có trên server chưa
  const dbCartMap = new Map();
  if (Array.isArray(dbCartItems)) {
    dbCartItems.forEach(item => {
      const productId = item.product?.toString() || item.product;
      if (productId) {
        dbCartMap.set(productId, item);
      }
    });
  }

  // Sync từng sản phẩm từ localStorage lên server
  for (const item of localCartItems) {
    try {
      const productId = item.product?.toString() || item.product;
      if (!productId) continue;

      const dbItem = dbCartMap.get(productId);
      
      if (dbItem) {
        // Sản phẩm đã có trên server: update quantity nếu khác
        const localQty = Number(item.quantity || 0);
        const dbQty = Number(dbItem.quantity || 0);
        
        // Chỉ update nếu quantity từ localStorage lớn hơn
        if (localQty > dbQty) {
          await cartService.update(userId, productId, localQty);
          console.log(`🛒 Updated product ${productId} quantity to ${localQty}`);
        }
      } else {
        // Sản phẩm chưa có trên server: thêm mới
        await cartService.add({
          user: userId,
          product: productId,
          price: item.price || 0,
          quantity: item.quantity || 1,
          title: item.title || '',
          image: item.image || '',
          unit: item.unit || '',
        });
        console.log(`🛒 Added product ${productId} to server cart`);
      }
    } catch (error) {
      console.error(`Error syncing product ${item.product} to server:`, error);
      // Tiếp tục sync các sản phẩm khác
    }
  }
};

