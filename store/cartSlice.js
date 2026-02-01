import { createSlice } from "@reduxjs/toolkit";
import { normalizeUnit } from "../utils/normalizeUnit";

// Note: Redux-persist handles localStorage automatically, 
// so we don't need manual saveCartToLocalStorage calls

const normalizeCartItem = (item) => {
  if (!item) return item;
  const quantity = Number(item.quantity ?? 0);
  const price = Number(item.price ?? 0);
  return {
    ...item,
    price: Number.isFinite(price) ? price : 0,
    quantity: Number.isFinite(quantity) ? quantity : 0,
  };
};

const is100gUnit = (unit) => normalizeUnit(unit) === "100g";
const isKgUnit = (unit) => {
  const normalized = normalizeUnit(unit);
  if (!normalized) return false;
  return normalized.toString().trim().toLowerCase() === "kg";
};

const initialState = {
  cartItems: [],
  cartTotal: 0,
  coupon: "",
  discount: 0,
  totalAfterDiscount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, price, quantity = 1, title, image, unit } = action.payload;
      if (!product || !price || !title || !image) {
        console.warn("Dữ liệu sản phẩm không hợp lệ:", action.payload);
        return;
      }
      const existingIndex = state.cartItems.findIndex(
        (item) => item.product === product
      );
      if (existingIndex >= 0) {
        const nextQty = state.cartItems[existingIndex].quantity + quantity;
        state.cartItems[existingIndex].quantity = is100gUnit(state.cartItems[existingIndex].unit)
          ? Math.min(9, nextQty) // 1..9 (=> 100..900g)
          : nextQty;
      } else {
        const safeQty = is100gUnit(unit) ? Math.min(9, Math.max(1, quantity)) : quantity;
        state.cartItems.push({ product, price, quantity: safeQty, title, image, unit });
      }
      state.cartTotal = state.cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      state.totalAfterDiscount = state.cartTotal * (1 - state.discount / 100);
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.product !== action.payload
      );
      state.cartTotal = state.cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      state.totalAfterDiscount = state.cartTotal * (1 - state.discount / 100);
    },

    increaseQuantity: (state, action) => {
      const { productId, step = 1 } = action.payload;
      const index = state.cartItems.findIndex(
        (item) => item.product === productId
      );
      if (index >= 0) {
        const nextQty = state.cartItems[index].quantity + step;
        state.cartItems[index].quantity = is100gUnit(state.cartItems[index].unit)
          ? Math.min(9, nextQty)
          : nextQty;
        state.cartTotal = state.cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        state.totalAfterDiscount = state.cartTotal * (1 - state.discount / 100);
      }
    },

    decreaseQuantity: (state, action) => {
      const { productId, step = 1 } = action.payload;
      const index = state.cartItems.findIndex(
        (item) => item.product === productId
      );
      if (index >= 0) {
        const item = state.cartItems[index];
        let newQuantity = item.quantity - step;
        
        // Normalize quantity cho kg unit: cho phép giảm xuống 0.5kg
        if (is100gUnit(item.unit)) {
          newQuantity = Math.max(0, Math.round(newQuantity));
        } else if (isKgUnit(item.unit)) {
          // Normalize về 0.5 steps cho kg
          newQuantity = Math.round(newQuantity * 2) / 2;
          newQuantity = Math.max(0.5, newQuantity); // Minimum là 0.5kg
        } else {
          newQuantity = Math.max(0, Math.round(newQuantity));
        }
        
        if (newQuantity <= 0) {
          state.cartItems.splice(index, 1);
        } else {
          state.cartItems[index].quantity = newQuantity;
        }
        state.cartTotal = state.cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        state.totalAfterDiscount = state.cartTotal * (1 - state.discount / 100);
      }
    },

    setQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const index = state.cartItems.findIndex(
        (item) => item.product === productId
      );
      if (index >= 0) {
        if (quantity <= 0) {
          state.cartItems.splice(index, 1);
        } else {
          state.cartItems[index].quantity = quantity;
        }
        state.cartTotal = state.cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        state.totalAfterDiscount = state.cartTotal * (1 - state.discount / 100);
      }
    },

    setCart: (state, action) => {
      // Bảo vệ: không clear cart nếu payload không hợp lệ
      if (!action.payload) {
        console.warn("setCart: payload không hợp lệ");
        return;
      }

      // Nếu products là array hợp lệ, set nó
      if (Array.isArray(action.payload.products)) {
        state.cartItems = action.payload.products.map(normalizeCartItem);
      } else if (action.payload.products === undefined) {
        // Nếu không có products trong payload, giữ nguyên cart hiện tại
        console.warn("setCart: không có products trong payload, giữ nguyên cart hiện tại");
        // Chỉ update các field khác nếu có
        if (action.payload.cartTotal !== undefined) {
          state.cartTotal = action.payload.cartTotal;
        }
        if (action.payload.coupon !== undefined) {
          state.coupon = action.payload.coupon;
        }
        if (action.payload.discount !== undefined) {
          state.discount = action.payload.discount;
        }
        if (action.payload.totalAfterDiscount !== undefined) {
          state.totalAfterDiscount = action.payload.totalAfterDiscount;
        } else {
          state.totalAfterDiscount = state.cartTotal * (1 - (state.discount || 0) / 100);
        }
        return;
      } else {
        console.warn("setCart: products không phải array:", action.payload.products);
        return;
      }

      // Update các field khác
      state.cartTotal = action.payload.cartTotal ?? state.cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      state.coupon = action.payload.coupon ?? "";
      state.discount = action.payload.discount ?? 0;
      state.totalAfterDiscount =
        action.payload.totalAfterDiscount ??
        state.cartTotal * (1 - (state.discount || 0) / 100);
    },

    // Merge cart từ localStorage với cart từ database
    mergeCart: (state, action) => {
      const { localCartItems, dbCartItems } = action.payload;
      
      // Tạo map từ database cart để dễ tìm kiếm
      const dbCartMap = new Map();
      if (Array.isArray(dbCartItems)) {
        dbCartItems.forEach(item => {
          const productId = item.product?.toString() || item.product;
          if (productId) {
            dbCartMap.set(productId, {
              product: productId,
              price: item.price || 0,
              quantity: item.quantity || 0,
              title: item.title || "",
              image: item.image || "",
              unit: item.unit || "",
            });
          }
        });
      }

      // Merge: ưu tiên giữ quantity lớn hơn cho mỗi sản phẩm
      const mergedItems = [];
      const processedProducts = new Set();

      // Xử lý items từ localStorage
      if (Array.isArray(localCartItems)) {
        localCartItems.forEach(localItem => {
          const productId = localItem.product?.toString() || localItem.product;
          if (!productId) return;

          processedProducts.add(productId);
          const dbItem = dbCartMap.get(productId);

          if (dbItem) {
            // Có trong cả 2: lấy quantity lớn hơn
            const mergedQuantity = Math.max(
              localItem.quantity || 0,
              dbItem.quantity || 0
            );
            mergedItems.push({
              product: productId,
              price: localItem.price || dbItem.price || 0,
              quantity: mergedQuantity,
              title: localItem.title || dbItem.title || "",
              image: localItem.image || dbItem.image || "",
              unit: localItem.unit || dbItem.unit || "",
            });
          } else {
            // Chỉ có trong localStorage: thêm vào
            mergedItems.push(normalizeCartItem(localItem));
          }
        });
      }

      // Thêm items chỉ có trong database
      if (Array.isArray(dbCartItems)) {
        dbCartItems.forEach(dbItem => {
          const productId = dbItem.product?.toString() || dbItem.product;
          if (!productId || processedProducts.has(productId)) return;

          mergedItems.push({
            product: productId,
            price: dbItem.price || 0,
            quantity: dbItem.quantity || 0,
            title: dbItem.title || "",
            image: dbItem.image || "",
            unit: dbItem.unit || "",
          });
        });
      }

      state.cartItems = mergedItems.map(normalizeCartItem);
      state.cartTotal = state.cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      state.totalAfterDiscount = state.cartTotal * (1 - state.discount / 100);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  setQuantity,
  setCart,
  mergeCart,
} = cartSlice.actions;
export default cartSlice.reducer;