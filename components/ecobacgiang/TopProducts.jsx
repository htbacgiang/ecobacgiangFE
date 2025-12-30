import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function TopProducts() {
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Chỉ dùng Server API - Sử dụng endpoint bestsellers (không cần auth)
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
        if (!apiBaseUrl) {
          throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
        }
        
        const response = await fetch(`${apiBaseUrl}/orders/bestsellers`);
        
        if (!response.ok) {
          throw new Error('Lỗi khi lấy dữ liệu sản phẩm');
        }
        const data = await response.json();
        
        // Map dữ liệu từ API bestsellers sang format của component
        const mappedProducts = data.map((item) => ({
          title: item.name,
          productCode: item._id, // Using product ID as the product code
          price: item.price || item.promotionalPrice || 0,
          image: Array.isArray(item.image) ? item.image[0] : item.image || '/images/placeholder.jpg',
          quantity: item.quantity || 0,
        }));

        // Take top 10 products (đã được sort từ server)
        setTopProducts(mappedProducts.slice(0, 10));
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
        setTopProducts([]);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-red-50 border border-red-200 rounded-lg text-red-700">
        <div className="mb-4">Lỗi: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!topProducts.length) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-lg font-semibold text-gray-900 mb-2">Không có sản phẩm</div>
        <div className="text-sm text-gray-600">
          Chưa có sản phẩm nào được bán để hiển thị trong danh sách bán chạy.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="text-base font-semibold text-gray-900">
          Top 10 Sản Phẩm Bán Chạy Nhất
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Tên Sản Phẩm
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Mã Sản Phẩm
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Giá
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Số Lượng Đã Bán
              </th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((product, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-4">
                    <Image
                      src={product.image}
                      alt={product.title}
                      width={50}
                      height={50}
                      className="w-12 h-12 rounded object-cover border border-gray-200"
                    />
                    <div className="flex flex-col gap-1.5">
                      <div className="font-semibold text-gray-900 text-[0.9375rem]">
                        {product.title}
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block w-fit font-mono">
                        #{product.productCode.slice(-3)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block font-mono">
                    #{product.productCode.slice(-6)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="font-semibold text-green-600 text-[0.9375rem]">
                    {formatVND(product.price)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded inline-block text-center min-w-[50px] text-sm">
                    {product.quantity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}