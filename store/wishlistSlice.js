import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { wishlistService } from '../lib/api-services';

// Save to localStorage (only for authenticated users)
const saveWishlistToLocalStorage = (state, userId) => {
  if (userId && typeof window !== "undefined") {
    localStorage.setItem("wishlist", JSON.stringify(state));
  }
};

// Clear localStorage
const clearWishlistFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("wishlist");
  }
};

// Async Thunks for API calls
export const addToWishlistDB = createAsyncThunk(
  "wishlist/addToWishlistDB",
  async ({ userId, product, style }, { rejectWithValue }) => {
    try {
      // Chỉ dùng Server API
      const productId = product._id || product;
      await wishlistService.add(productId, style);
      
      // Sau khi add thành công, fetch lại để có full product data
      // Vì Server API add không populate product, chỉ trả về ObjectId
      const fetchResponse = await wishlistService.getAll();
      return fetchResponse.wishlist || []; // Return full wishlist với product data
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add to wishlist");
    }
  }
);

export const removeFromWishlistDB = createAsyncThunk(
  "wishlist/removeFromWishlistDB",
  async ({ userId, productId }, { rejectWithValue }) => {
    try {
      // Chỉ dùng Server API
      await wishlistService.remove(productId);
      
      // Sau khi remove thành công, fetch lại để có full product data
      // Vì Server API remove không populate product, chỉ trả về ObjectId
      const fetchResponse = await wishlistService.getAll();
      return fetchResponse.wishlist || []; // Return full wishlist với product data
    } catch (error) {
      return rejectWithValue(error.message || "Failed to remove from wishlist");
    }
  }
);

export const fetchWishlistDB = createAsyncThunk(
  "wishlist/fetchWishlistDB",
  async (userId, { rejectWithValue }) => {
    try {
      // Chỉ dùng Server API
      const response = await wishlistService.getAll();
      return response.wishlist || []; // API returns wishlist
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch wishlist");
    }
  }
);

export const clearWishlistDB = createAsyncThunk(
  "wishlist/clearWishlistDB",
  async (userId, { rejectWithValue }) => {
    try {
      // Server API không có clear endpoint, return empty array
      // Có thể implement clear endpoint trong Server API sau
      return []; // API returns empty wishlist
    } catch (error) {
      return rejectWithValue(error.message || "Failed to clear wishlist");
    }
  }
);

const initialState = {
  wishlistItems: [],
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlist: (state, action) => {
      if (!Array.isArray(action.payload.wishlistItems)) {
        console.warn("Dữ liệu wishlistItems không hợp lệ:", action.payload.wishlistItems);
        state.wishlistItems = [];
      } else {
        state.wishlistItems = action.payload.wishlistItems;
      }
      saveWishlistToLocalStorage(state, action.payload.userId);
    },
    clearWishlist: (state) => {
      state.wishlistItems = [];
      state.status = "idle";
      state.error = null;
      clearWishlistFromLocalStorage();
    },
    // Optimistic update để UI cập nhật ngay lập tức
    optimisticAddToWishlist: (state, action) => {
      const { product } = action.payload;
      // Kiểm tra xem đã có trong wishlist chưa
      const exists = state.wishlistItems.some(
        item => (item.product?._id || item.product?.toString() || item.product) === (product._id || product)
      );
      if (!exists) {
        // Thêm vào wishlist ngay lập tức (optimistic)
        state.wishlistItems.push({ product, style: action.payload.style || null });
      }
    },
    optimisticRemoveFromWishlist: (state, action) => {
      const { productId } = action.payload;
      // Xóa khỏi wishlist ngay lập tức (optimistic)
      state.wishlistItems = state.wishlistItems.filter(
        item => {
          const itemProductId = item.product?._id || item.product?.toString() || item.product;
          return itemProductId !== productId;
        }
      );
    },
  },
  extraReducers: (builder) => {
    // Add to Wishlist
    builder
      .addCase(addToWishlistDB.pending, (state) => {
        state.status = "loading";
        // Không clear wishlistItems khi pending để tránh flicker
      })
      .addCase(addToWishlistDB.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Chỉ update nếu payload là array hợp lệ
        if (Array.isArray(action.payload)) {
          state.wishlistItems = action.payload;
        }
        saveWishlistToLocalStorage(state, action.meta.arg.userId);
      })
      .addCase(addToWishlistDB.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        // Không clear wishlistItems khi reject
      });

    // Remove from Wishlist
    builder
      .addCase(removeFromWishlistDB.pending, (state) => {
        state.status = "loading";
        // Không clear wishlistItems khi pending để tránh flicker
      })
      .addCase(removeFromWishlistDB.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Chỉ update nếu payload là array hợp lệ
        if (Array.isArray(action.payload)) {
          state.wishlistItems = action.payload;
        }
        saveWishlistToLocalStorage(state, action.meta.arg.userId);
      })
      .addCase(removeFromWishlistDB.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        // Không clear wishlistItems khi reject
      });

    // Fetch Wishlist
    builder
      .addCase(fetchWishlistDB.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchWishlistDB.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.wishlistItems = action.payload;
        saveWishlistToLocalStorage(state, action.meta.arg);
      })
      .addCase(fetchWishlistDB.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    // Clear Wishlist
    builder
      .addCase(clearWishlistDB.pending, (state) => {
        state.status = "loading";
      })
      .addCase(clearWishlistDB.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.wishlistItems = action.payload;
        saveWishlistToLocalStorage(state, action.meta.arg.userId);
      })
      .addCase(clearWishlistDB.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setWishlist, clearWishlist, optimisticAddToWishlist, optimisticRemoveFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;