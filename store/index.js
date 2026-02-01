import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";

// Import Reducers
import cartReducers from "./cartSlice";
import wishlistReducer from "./wishlistSlice";
import expandSidebar from "./ExpandSlice";
import dialog from "./DialogSlice";

// Custom storage for Next.js SSR compatibility
// Create noop storage for server-side
const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};

// Use localStorage on client, noop on server
// Import storage dynamically to avoid SSR issues
let storage = createNoopStorage();

if (typeof window !== "undefined") {
  try {
    // Client-side: use localStorage from redux-persist
    const persistStorage = require("redux-persist/lib/storage");
    storage = persistStorage.default || persistStorage;
    
    // Debug: verify localStorage is accessible
    if (process.env.NODE_ENV === "development") {
      console.log("🛒 Redux Persist: Using localStorage storage");
    }
  } catch (error) {
    console.error("Failed to load redux-persist storage:", error);
    storage = createNoopStorage();
  }
}

// Combine Reducers
const reducers = combineReducers({
  cart: cartReducers,
  wishlist: wishlistReducer,
  expandSidebar,
  dialog,
});

// Persist Config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "wishlist"], // Persist only cart and wishlist
  // Add version to handle migrations if needed
  version: 1,
  // Debug: log rehydration
  debug: process.env.NODE_ENV === "development",
};

// Persist Reducer
const persistedReducer = persistReducer(persistConfig, reducers);

// Configure Store
const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export default store;