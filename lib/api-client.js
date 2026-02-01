/**
 * API Client cho EcoBacGiang API Server
 * Sử dụng để gọi API đến server Node.js riêng biệt
 */

// Get API base URL from environment
// Trong development mode, có thể fallback về localhost nếu chưa set
const getApiBaseUrl = () => {
  let apiUrl;
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (typeof window !== 'undefined') {
    // Client-side: Use environment variable
    apiUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
    
    // Log để debug (cả development và production)
    if (!apiUrl) {
      const errorMsg = '⚠️ NEXT_PUBLIC_API_SERVER_URL is not defined!';
      console.error(errorMsg);
      console.error('   Đây là lỗi cấu hình quan trọng.');
      console.error('   Vui lòng kiểm tra:');
      console.error('   1. File .env.local hoặc .env.production có chứa NEXT_PUBLIC_API_SERVER_URL');
      console.error('   2. Nếu đang trên VPS, cần rebuild Next.js app sau khi set biến môi trường');
      console.error('   3. Biến NEXT_PUBLIC_* phải được set TRƯỚC KHI BUILD, không phải runtime');
      console.error('   4. Ví dụ: NEXT_PUBLIC_API_SERVER_URL=https://api.ecobacgiang.vn/api');
      
      if (isDevelopment) {
        console.warn('   ⚠️ Development mode: Đang fallback về localhost');
        apiUrl = 'http://localhost:5000/api';
      } else {
        // Production: Throw error rõ ràng
        throw new Error(
          'NEXT_PUBLIC_API_SERVER_URL is not defined. ' +
          'Vui lòng set biến này trong .env.production và rebuild app. ' +
          'Lưu ý: Biến NEXT_PUBLIC_* phải được set TRƯỚC KHI BUILD.'
        );
      }
    } else {
      // Log API URL (ẩn một phần để bảo mật)
      const maskedUrl = apiUrl.replace(/(https?:\/\/)([^\/]+)(.*)/, (match, protocol, host, path) => {
        return `${protocol}${host.substring(0, 10)}...${path}`;
      });
      console.log(`✅ API Server URL configured: ${maskedUrl}`);
    }
    
    // Kiểm tra Mixed Content: Nếu website chạy HTTPS nhưng API URL là HTTP
    // Browser sẽ chặn request này
    if (window.location.protocol === 'https:' && apiUrl && apiUrl.startsWith('http://')) {
      console.warn('⚠️ Mixed Content Warning: Website đang chạy HTTPS nhưng API URL là HTTP');
      console.warn('   Browser sẽ chặn request này. Chuyển sang HTTPS...');
      
      // Tự động chuyển HTTP sang HTTPS
      apiUrl = apiUrl.replace('http://', 'https://');
      console.log(`   ✅ Đã chuyển API URL sang: ${apiUrl}`);
    }
  } else {
    // Server-side: Use environment variable
    apiUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
    
    if (!apiUrl && isDevelopment) {
      console.warn('⚠️ NEXT_PUBLIC_API_SERVER_URL chưa được set. Đang dùng localhost cho development.');
      apiUrl = 'http://localhost:5000/api';
    } else if (!apiUrl) {
      throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
    }
  }
  
  return apiUrl;
};

// Fallback URLs nếu primary URL không hoạt động
const getFallbackUrls = () => {
  const primary = getApiBaseUrl();
  const fallbacks = [];
  
  // Nếu primary là HTTP nhưng website chạy HTTPS, thử HTTPS version
  if (typeof window !== 'undefined' && 
      window.location.protocol === 'https:' && 
      primary.startsWith('http://')) {
    const httpsVersion = primary.replace('http://', 'https://');
    if (!fallbacks.includes(httpsVersion)) {
      fallbacks.push(httpsVersion);
    }
  }
  
  return fallbacks;
};

const API_BASE_URL = getApiBaseUrl();
const FALLBACK_URLS = getFallbackUrls();

class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.fallbackUrls = FALLBACK_URLS;
    this.lastWorkingUrl = baseURL;
    
    // Log để debug (chỉ trong development)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('🔍 API Client initialized with base URL:', this.baseURL);
      if (this.fallbackUrls.length > 0) {
        console.log('🔄 Fallback URLs:', this.fallbackUrls);
      }
      
      // Kiểm tra server health khi khởi tạo (chỉ client-side)
      this.checkServerHealth();
    }
  }

  /**
   * Kiểm tra server health với timeout
   */
  async checkServerHealth(url = null) {
    const checkUrl = url || this.baseURL.replace('/api', '');
    const healthUrl = `${checkUrl}/health`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`✅ Server API is running at ${checkUrl}`);
        this.lastWorkingUrl = checkUrl + '/api';
        return true;
      } else {
        console.warn(`⚠️ Server API health check failed at ${checkUrl}:`, response.status);
        return false;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn(`⏱️ Health check timeout for ${checkUrl}`);
      } else {
        console.warn(`⚠️ Cannot reach Server API at ${checkUrl}:`, error.message);
      }
      return false;
    }
  }

  /**
   * Tìm URL hoạt động từ danh sách URLs
   */
  async findWorkingUrl() {
    // Kiểm tra URL hiện tại trước
    const currentBase = this.baseURL.replace('/api', '');
    if (await this.checkServerHealth(currentBase)) {
      return this.baseURL;
    }
    
    // Thử các fallback URLs
    for (const fallback of this.fallbackUrls) {
      const fallbackBase = fallback.replace('/api', '');
      if (await this.checkServerHealth(fallbackBase)) {
        console.log(`🔄 Switching to fallback URL: ${fallback}`);
        this.lastWorkingUrl = fallback;
        return fallback;
      }
    }
    
    return null;
  }

  /**
   * Gửi request đến API server với retry và fallback
   */
  async request(endpoint, options = {}, retryCount = 0) {
    const maxRetries = 1; // Chỉ retry 1 lần với fallback URL
    const baseUrl = retryCount === 0 ? this.baseURL : this.lastWorkingUrl;
    const url = `${baseUrl}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Thêm mode và credentials cho CORS
      mode: 'cors',
      credentials: 'include',
    };

    // Thêm token nếu có (từ localStorage hoặc cookie)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    try {
      // Thêm timeout cho request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
      config.signal = controller.signal;
      
      console.log(`🔍 API Request: ${options.method || 'GET'} ${url}`);
      if (process.env.NODE_ENV === 'development' || endpoint.includes('/auth/')) {
        console.log(`   Headers:`, Object.keys(config.headers));
        if (config.body) {
          try {
            const bodyData = typeof config.body === 'string' ? JSON.parse(config.body) : config.body;
            const maskedBody = { ...bodyData };
            if (maskedBody.password) maskedBody.password = '***';
            if (maskedBody.conf_password) maskedBody.conf_password = '***';
            console.log(`   Body:`, maskedBody);
          } catch (e) {
            console.log(`   Body:`, config.body?.substring(0, 100));
          }
        }
      }
      
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      console.log(`📡 API Response: ${response.status} ${response.statusText} [${endpoint}]`);
      
      // Parse JSON response
      let data;
      try {
        const text = await response.text();
        if (!text) {
          data = {};
        } else {
          data = JSON.parse(text);
        }
      } catch (parseError) {
        console.error(`Failed to parse JSON response from ${url}:`, parseError);
        throw new Error(`Invalid JSON response from server. Server may be down or URL incorrect.`);
      }
      
      const isAuthEndpoint = endpoint.includes('/auth/');
      const authErrorMessage = (d) => d?.message || d?.err || d?.error || 'Server returned error status';
      const msg = data?.message || data?.err || data?.error || '';
      const isMissingToken = response.status === 401 || /token|missing|unauthorized/i.test(String(msg));

      // Wishlist/cart khi chưa đăng nhập (401) → không redirect, trả _authError để service trả về rỗng
      const isOptionalAuthEndpoint = /^\/(wishlist|cart)(\?|$)/.test(endpoint);
      const doRedirectLogin = () => {
        if (typeof window !== 'undefined' && !isOptionalAuthEndpoint) {
          const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/dang-nhap?callbackUrl=${callbackUrl}`;
        }
      };

      // Kiểm tra response status từ server (status: 'error' hoặc 'success')
      if (data && data.status === 'error') {
        if (isAuthEndpoint || isMissingToken) {
          if (!isAuthEndpoint && isMissingToken) doRedirectLogin();
          return { _authError: true, message: authErrorMessage(data) };
        }
        throw new Error(data.err || data.error || data.message || 'Server returned error status');
      }
      
      if (!response.ok) {
        console.error(`❌ API Error Response [${endpoint}]:`, {
          status: response.status,
          statusText: response.statusText,
          data: data,
          url: url
        });
        
        if (isAuthEndpoint || isMissingToken) {
          if (!isAuthEndpoint && isMissingToken) doRedirectLogin();
          const errorMessage = data?.message || data?.err || data?.error || `HTTP error! status: ${response.status}`;
          return { _authError: true, message: errorMessage };
        }
        
        if (response.status === 404 || response.status === 400) {
          return { ...data, _isWarning: true, _statusCode: response.status };
        }
        
        throw new Error(data.err || data.message || data.error || `HTTP error! status: ${response.status}`);
      }
      
      // Nếu thành công với fallback URL, cập nhật lastWorkingUrl
      if (retryCount > 0) {
        this.lastWorkingUrl = baseUrl;
      }
      
      return data;
    } catch (error) {
      // Xử lý timeout
      if (error.name === 'AbortError') {
        console.warn(`⏱️ Request timeout for ${url}`);
        if (retryCount < maxRetries && this.fallbackUrls.length > 0) {
          console.log(`🔄 Retrying with fallback URL...`);
          const workingUrl = await this.findWorkingUrl();
          if (workingUrl) {
            return this.request(endpoint, options, retryCount + 1);
          }
        }
        throw new Error(`Request timeout: Server không phản hồi trong 30 giây. Vui lòng kiểm tra server có đang chạy không.`);
      }
      
      // Xử lý các loại lỗi khác nhau
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        // Kiểm tra network connectivity
        if (typeof window !== 'undefined' && !navigator.onLine) {
          throw new Error('Không có kết nối internet. Vui lòng kiểm tra kết nối mạng của bạn.');
        }
        
        // Kiểm tra Mixed Content (HTTPS website gọi HTTP API)
        let isMixedContent = false;
        if (typeof window !== 'undefined') {
          const currentProtocol = window.location.protocol;
          const apiProtocol = new URL(baseUrl).protocol;
          isMixedContent = currentProtocol === 'https:' && apiProtocol === 'http:';
          
          if (isMixedContent) {
            console.error('🚫 Mixed Content Error: Website đang chạy HTTPS nhưng API URL là HTTP');
            console.error('   Browser đã chặn request này vì lý do bảo mật.');
            console.error(`   Website: ${currentProtocol}//${window.location.host}`);
            console.error(`   API URL: ${apiProtocol}//${new URL(baseUrl).host}`);
            
            // Thử tự động chuyển sang HTTPS
            const httpsUrl = baseUrl.replace('http://', 'https://');
            console.log(`   🔄 Thử chuyển sang HTTPS: ${httpsUrl}`);
            
            if (retryCount === 0) {
              // Retry với HTTPS URL
              const httpsBaseUrl = baseUrl.replace('http://', 'https://');
              this.lastWorkingUrl = httpsBaseUrl;
              return this.request(endpoint, options, retryCount + 1);
            }
          }
        }
        
        // Thử fallback URL nếu chưa thử
        if (retryCount < maxRetries && this.fallbackUrls.length > 0) {
          console.log(`🔄 Connection failed, trying fallback URL...`);
          const workingUrl = await this.findWorkingUrl();
          if (workingUrl) {
            return this.request(endpoint, options, retryCount + 1);
          }
        }
        
        // Tạo thông báo lỗi chi tiết
        const serverBaseUrl = baseUrl.replace('/api', '');
        let errorMessage = `Không thể kết nối đến Server API tại ${url}\n\n`;
        
        if (isMixedContent) {
          errorMessage += `🚫 LỖI MIXED CONTENT:\n`;
          errorMessage += `   Website đang chạy HTTPS nhưng API URL là HTTP.\n`;
          errorMessage += `   Browser đã chặn request này vì lý do bảo mật.\n\n`;
          errorMessage += `GIẢI PHÁP:\n`;
          errorMessage += `1. Sửa NEXT_PUBLIC_API_SERVER_URL trong .env để sử dụng HTTPS\n`;
          errorMessage += `2. Hoặc cấu hình Nginx reverse proxy để API chạy qua HTTPS\n`;
          errorMessage += `3. Restart Next.js app sau khi sửa\n\n`;
        }
        
        errorMessage += `Vui lòng kiểm tra:\n`;
        errorMessage += `1. Server API có đang chạy không? (${serverBaseUrl}/health)\n`;
        errorMessage += `2. URL có đúng không? (${baseUrl})\n`;
        errorMessage += `3. CORS có được cấu hình đúng không?\n`;
        errorMessage += `4. Browser có chặn request không? (Kiểm tra Console và Network tab)\n`;
        errorMessage += `5. Firewall/Network có chặn kết nối không?`;
        
        // Kiểm tra CORS error
        const isCorsIssue = error.message.includes('CORS') || 
                           (typeof window !== 'undefined' && window.location.origin !== new URL(baseUrl).origin);
        
        if (isCorsIssue) {
          errorMessage += `\n\n⚠️ Có thể là vấn đề CORS. Kiểm tra:\n`;
          errorMessage += `   - Server/server.js có cấu hình CORS đúng không?\n`;
          errorMessage += `   - ALLOWED_ORIGINS trong .env có chứa origin hiện tại không?\n`;
          errorMessage += `   - Origin hiện tại: ${typeof window !== 'undefined' ? window.location.origin : 'N/A'}`;
        }
        
        console.error(`❌ API Connection Error [${endpoint}]:`, errorMessage);
        console.error(`Full error:`, error);
        throw new Error(errorMessage);
      }
      
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  // POST request
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // PATCH request
  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export default ApiClient;

