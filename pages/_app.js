import "../styles/globals.css";
import "../styles/toast.css";
import "../styles/dashboard.css";
import { Rajdhani } from "next/font/google";
import { Provider } from "react-redux";
import store from "../store";
import { SessionProvider } from "next-auth/react"
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import Head from "next/head";
import { useEffect } from "react";
import { useCartSync } from "../hooks/useCartSync";

// redux-persist handles SSR correctly
const persistor = persistStore(store);
// Khởi tạo font Rajdhani từ Google Fonts
const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--ltn__heading-font",
});
  // Component wrapper để sử dụng hook useCartSync
  function CartSyncWrapper({ children }) {
    useCartSync();
    return <>{children}</>;
  }

  function MyApp({ Component, pageProps: { session, meta, ...pageProps } }) {
  useEffect(() => {
    // Chỉ log lỗi khi thiếu API URL (development)
    if (!process.env.NEXT_PUBLIC_API_SERVER_URL && process.env.NODE_ENV === "development") {
      console.error('❌ NEXT_PUBLIC_API_SERVER_URL chưa được cấu hình. Tạo .env.local với biến này.');
    }

    // Check Server API health (optional)
    const checkServerHealth = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
      if (!apiUrl) return;
      const healthUrl = apiUrl.replace('/api', '') + '/health';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      try {
        const response = await fetch(healthUrl, { method: 'GET', signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok && process.env.NODE_ENV === "development") {
          console.warn('⚠️ Server API không phản hồi OK');
        }
      } catch {
        clearTimeout(timeoutId);
        // Chỉ log khi development
        if (process.env.NODE_ENV === "development") {
          console.warn('⚠️ Không kết nối được Server API');
        }
      }
    };

    if (process.env.NEXT_PUBLIC_API_SERVER_URL && typeof window !== 'undefined') {
      checkServerHealth();
    }
  }, []);
  
  return (
      <>
          {meta && (
            <Head>
              <title>{meta.title}</title>
              <meta name="description" content={meta.description} />
              <meta name="keywords" content={meta.keywords} />
              <meta name="robots" content={meta.robots} />
              <meta name="author" content={meta.author} />
              <link rel="canonical" href={meta.canonical} />
              <meta property="og:title" content={meta.og.title} />
              <meta property="og:description" content={meta.og.description} />
              <meta property="og:type" content={meta.og.type} />
              <meta property="og:image" content={meta.og.image} />
              <meta property="og:image:width" content={meta.og.imageWidth} />
              <meta property="og:image:height" content={meta.og.imageHeight} />
              <meta property="og:url" content={meta.og.url} />
              {meta.og.site_name && (
                <meta property="og:site_name" content={meta.og.site_name} />
              )}
              <meta name="twitter:card" content={meta.twitter.card} />
              <meta name="twitter:title" content={meta.twitter.title} />
              <meta name="twitter:description" content={meta.twitter.description} />
              <meta name="twitter:image" content={meta.twitter.image} />
            </Head>
          )}
          <SessionProvider session={session}>
            <Provider store={store}>
              <PersistGate 
                loading={null} 
                persistor={persistor}
                onBeforeLift={() => {
                  // Debug: log khi rehydration hoàn tất
                  if (process.env.NODE_ENV === "development") {
                    console.log("🛒 Redux Persist: Rehydration completed");
                    const cartState = store.getState().cart;
                    console.log("🛒 Cart state after rehydration:", {
                      itemsCount: cartState.cartItems?.length || 0,
                      total: cartState.cartTotal,
                    });
                  }
                }}
              >
                <CartSyncWrapper>
                  <div className="font-arial">
                    <ToastContainer
                      position="top-right"
                      autoClose={500}
                      hideProgressBar={false}
                      newestOnTop={false}
                      closeOnClick
                      rtl={false}
                      pauseOnFocusLoss
                      draggable
                      pauseOnHover
                      theme="light"
                      style={{ zIndex: 10001 }}
                    />
                    <Component {...pageProps} />
                  </div>
                </CartSyncWrapper>
              </PersistGate>
            </Provider>
          </SessionProvider>
        </>
  );
}

export default MyApp;