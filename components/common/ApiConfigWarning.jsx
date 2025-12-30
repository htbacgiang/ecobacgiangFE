import { useEffect, useState } from 'react';

/**
 * Component hiển thị cảnh báo khi NEXT_PUBLIC_API_SERVER_URL chưa được cấu hình
 * Chỉ hiển thị trong production để giúp debug trên VPS
 */
export default function ApiConfigWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Chỉ check trong production để tránh spam console trong development
    if (process.env.NODE_ENV === 'production') {
      const apiUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
      if (!apiUrl) {
        setShowWarning(true);
      }
    }
  }, []);

  if (!isClient || !showWarning) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ff4444',
        color: 'white',
        padding: '12px 20px',
        zIndex: 9999,
        fontSize: '14px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}
    >
      <strong>⚠️ LỖI CẤU HÌNH:</strong> NEXT_PUBLIC_API_SERVER_URL chưa được set. 
      Vui lòng kiểm tra file .env.production và rebuild app. 
      Xem chi tiết trong console (F12).
    </div>
  );
}

