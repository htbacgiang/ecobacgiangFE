import { createSlice } from "@reduxjs/toolkit";

const saveCartToLocalStorage = (state) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(state));
  }
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
        state.cartItems[existingIndex].quantity += quantity;
      } else {
        state.cartItems.push({ product, price, quantity, title, image, unit });
      }
      state.cartTotal = state.cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      state.totalAfterDiscount = state.cartTotal * (1 - state.discount / 100);
      saveCartToLocalStorage(state);
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
      saveCartToLocalStorage(state);
    },

    increaseQuantity: (state, action) => {
      const { productId, step = 1 } = action.payload;
      const index = state.cartItems.findIndex(
        (item) => item.product === productId
      );
      if (index >= 0) {
        state.cartItems[index].quantity += step;
        state.cartTotal = state.cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        state.totalAfterDiscount = state.cartTotal * (1 - state.discount / 100);
      }
      saveCartToLocalStorage(state);
    },

    decreaseQuantity: (state, action) => {
      const { productId, step = 1 } = action.payload;
      const index = state.cartItems.findIndex(
        (item) => item.product === productId
      );
      if (index >= 0) {
        const newQuantity = state.cartItems[index].quantity - step;
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
      saveCartToLocalStorage(state);
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
      saveCartToLocalStorage(state);
    },

    setCart: (state, action) => {
      if (!Array.isArray(action.payload.products)) {
        console.warn("Dữ liệu products không hợp lệ:", action.payload.products);
      }
      state.cartItems = Array.isArray(action.payload.products) ? action.payload.products : [];
      state.cartTotal = action.payload.cartTotal || 0;
      state.coupon = action.payload.coupon || "";
      state.discount = action.payload.discount || 0;
      state.totalAfterDiscount =
        action.payload.totalAfterDiscount ||
        state.cartTotal * (1 - (state.discount || 0) / 100);
      saveCartToLocalStorage(state);
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
} = cartSlice.actions;
export default cartSlice.reducer;