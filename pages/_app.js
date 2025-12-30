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
import ApiConfigWarning from "../components/common/ApiConfigWarning";

let persistor = persistStore(store);
// Khởi tạo font Rajdhani từ Google Fonts
const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--ltn__heading-font",
});
  function MyApp({ Component, pageProps: { session, meta, ...pageProps } }) {
  // Debug: Log API configuration (cả development và production để debug VPS)
  useEffect(() => {
    console.log('🔍 API Configuration:');
    console.log('  Environment:', process.env.NODE_ENV || 'unknown');
    console.log('  NEXT_PUBLIC_API_SERVER_URL:', process.env.NEXT_PUBLIC_API_SERVER_URL || 'NOT SET ❌');
    
    if (!process.env.NEXT_PUBLIC_API_SERVER_URL) {
      console.error('  ❌ LỖI: NEXT_PUBLIC_API_SERVER_URL chưa được cấu hình!');
      console.error('  📝 Hướng dẫn sửa lỗi:');
      console.error('     1. Tạo/sửa file .env.production trong thư mục EcoBacgiangFE');
      console.error('     2. Thêm dòng: NEXT_PUBLIC_API_SERVER_URL=https://your-api-domain.com/api');
      console.error('     3. Rebuild app: npm run build');
      console.error('     4. Restart app: npm start');
      console.error('  ⚠️ Lưu ý: Biến NEXT_PUBLIC_* phải được set TRƯỚC KHI BUILD!');
    } else {
      // Mask URL để bảo mật nhưng vẫn có thể debug
      const url = process.env.NEXT_PUBLIC_API_SERVER_URL;
      const masked = url.replace(/(https?:\/\/)([^\/]+)(.*)/, (match, protocol, host, path) => {
        return `${protocol}${host.substring(0, 15)}...${path}`;
      });
      console.log('  ✅ Using API Server:', masked);
    }

    // Check Server API health và clear NextAuth session nếu Server API không chạy
    const checkServerHealth = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
      if (!apiUrl) {
        throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
      }
      const healthUrl = apiUrl.replace('/api', '') + '/health';
      
      // Tạo timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Timeout 3 giây
      
      try {
        const response = await fetch(healthUrl, { 
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          // Server API không chạy → Clear NextAuth session
          if (typeof window !== 'undefined') {
            const { signOut } = await import('next-auth/react');
            await signOut({ redirect: false });
            console.warn('⚠️ Server API không chạy - Đã clear NextAuth session');
          }
        }
      } catch (error) {
        clearTimeout(timeoutId);
        // Server API không chạy → Clear NextAuth session
        if (typeof window !== 'undefined') {
          try {
            const { signOut } = await import('next-auth/react');
            await signOut({ redirect: false });
            console.warn('⚠️ Server API không chạy - Đã clear NextAuth session');
          } catch (signOutError) {
            // Ignore signOut errors
          }
        }
      }
    };

    // Chỉ check khi có NEXT_PUBLIC_API_SERVER_URL
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
              <meta name="twitter:card" content={meta.twitter.card} />
              <meta name="twitter:title" content={meta.twitter.title} />
              <meta name="twitter:description" content={meta.twitter.description} />
              <meta name="twitter:image" content={meta.twitter.image} />
            </Head>
          )}
          <ApiConfigWarning />
          <SessionProvider session={session}>
            <Provider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <div className="font-arial">
                  <ToastContainer
                    position="top-right"
                    autoClose={3000}
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
              </PersistGate>
            </Provider>
          </SessionProvider>
        </>
  );
}

export default MyApp;