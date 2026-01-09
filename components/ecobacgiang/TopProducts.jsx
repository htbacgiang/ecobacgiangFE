import Image from 'next/image';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Dynamic import cho Bar chart
const Bar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });
const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function TopProducts() {
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'compare'
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Comparison mode states - chỉ so sánh cùng 1 tháng giữa các năm
  const [comparisonData, setComparisonData] = useState([]);
  const [compareMonth, setCompareMonth] = useState(new Date().getMonth() + 1);
  const [compareYears, setCompareYears] = useState([
    new Date().getFullYear(),
    new Date().getFullYear() - 1,
  ]);

  // Tạo danh sách tháng
  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
  ];

  // Tạo danh sách năm (10 năm gần nhất)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // Fetch dữ liệu so sánh - cùng 1 tháng giữa các năm
  useEffect(() => {
    if (viewMode === 'compare' && compareYears.length > 0) {
      const fetchComparisonData = async () => {
        try {
          setLoading(true);
          setError(null);
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
          if (!apiBaseUrl) {
            throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined');
          }

          const promises = compareYears.map(async (year) => {
            const url = new URL(`${apiBaseUrl}/orders/bestsellers`);
            url.searchParams.append('month', compareMonth);
            url.searchParams.append('year', year);
            const response = await fetch(url.toString());
            if (!response.ok) {
              throw new Error(`Lỗi khi lấy dữ liệu cho tháng ${compareMonth}/${year}`);
            }
            const data = await response.json();
            return {
              month: compareMonth,
              year: year,
              label: `Năm ${year}`,
              products: data.map((item) => ({
                title: item.name,
                productCode: item._id,
                price: item.price || item.promotionalPrice || 0,
                image: Array.isArray(item.image) ? item.image[0] : item.image || '/images/placeholder.jpg',
                quantity: item.quantity || 0,
              })),
            };
          });

          const results = await Promise.all(promises);
          setComparisonData(results);
        } catch (error) {
          console.error('Lỗi khi lấy dữ liệu so sánh:', error);
          setError(error.message);
          setComparisonData([]);
        } finally {
          setLoading(false);
        }
      };

      fetchComparisonData();
    }
  }, [viewMode, compareMonth, compareYears]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        // Chỉ dùng Server API - Sử dụng endpoint bestsellers (không cần auth)
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
        if (!apiBaseUrl) {
          throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
        }
        
        // Thêm query parameters cho tháng và năm
        const url = new URL(`${apiBaseUrl}/orders/bestsellers`);
        url.searchParams.append('month', selectedMonth);
        url.searchParams.append('year', selectedYear);
        
        const response = await fetch(url.toString());
        
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
  }, [selectedMonth, selectedYear]);

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Thêm năm vào danh sách so sánh
  const addYear = (year) => {
    if (!compareYears.includes(year)) {
      setCompareYears([...compareYears, year].sort((a, b) => b - a));
    }
  };

  // Xóa năm khỏi danh sách so sánh
  const removeYear = (year) => {
    if (compareYears.length > 1) {
      setCompareYears(compareYears.filter((y) => y !== year));
    }
  };

  // Toggle năm trong danh sách so sánh
  const toggleYear = (year) => {
    if (compareYears.includes(year)) {
      if (compareYears.length > 1) {
        removeYear(year);
      }
    } else {
      addYear(year);
    }
  };

  // Chuẩn bị dữ liệu biểu đồ so sánh
  const prepareComparisonChartData = () => {
    // Lấy tất cả sản phẩm unique từ tất cả các tháng
    const allProducts = new Map();
    comparisonData.forEach((data) => {
      data.products.forEach((product) => {
        if (!allProducts.has(product.title)) {
          allProducts.set(product.title, {
            title: product.title,
            quantities: [],
          });
        }
      });
    });

    // Điền số lượng cho mỗi sản phẩm trong mỗi tháng
    const labels = comparisonData.map((d) => d.label);
    const datasets = [];

    allProducts.forEach((product, productTitle) => {
      const quantities = comparisonData.map((data) => {
        const found = data.products.find((p) => p.title === productTitle);
        return found ? found.quantity : 0;
      });

      datasets.push({
        label: productTitle,
        data: quantities,
        backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`,
      });
    });

    // Chỉ lấy top 10 sản phẩm có tổng số lượng cao nhất
    const sortedDatasets = datasets
      .map((dataset) => ({
        ...dataset,
        total: dataset.data.reduce((a, b) => a + b, 0),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return {
      labels,
      datasets: sortedDatasets,
    };
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="text-base font-semibold text-gray-900 mb-4">
          Top 10 Sản Phẩm Bán Chạy Nhất
        </div>

        {/* Tab chuyển đổi giữa xem đơn và so sánh */}
        <div className="flex gap-2 mb-4 border-b border-gray-200">
          <button
            onClick={() => setViewMode('single')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === 'single'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Xem đơn
          </button>
          <button
            onClick={() => setViewMode('compare')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === 'compare'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            So sánh
          </button>
        </div>

        {/* Chế độ xem đơn */}
        {viewMode === 'single' && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
          <div className="flex items-center gap-2">
            <label htmlFor="top-products-month-select" className="text-sm text-gray-700 font-medium">
              Chọn tháng:
            </label>
            <select
              id="top-products-month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              disabled={loading}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="top-products-year-select" className="text-sm text-gray-700 font-medium">
              Chọn năm:
            </label>
            <select
              id="top-products-year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              disabled={loading}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        )}

        {/* Chế độ so sánh - So sánh cùng 1 tháng giữa các năm */}
        {viewMode === 'compare' && (
          <div className="space-y-4 mb-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-700 font-medium mb-4 text-center">
              So sánh cùng một tháng giữa các năm:
            </div>
            
            {/* Chọn tháng và năm trên cùng 1 dòng */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 font-medium">
                  Chọn tháng:
                </label>
                <select
                  value={compareMonth}
                  onChange={(e) => setCompareMonth(parseInt(e.target.value))}
                  disabled={loading}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 font-medium">
                  Chọn năm:
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    const year = parseInt(e.target.value);
                    if (year && !compareYears.includes(year)) {
                      addYear(year);
                      e.target.value = '';
                    }
                  }}
                  disabled={loading}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">-- Chọn năm --</option>
                  {years.map((year) => (
                    <option
                      key={year}
                      value={year}
                      disabled={compareYears.includes(year)}
                    >
                      {year} {compareYears.includes(year) ? '(đã chọn)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hiển thị các năm đã chọn */}
            <div className="space-y-2">
              <label className="text-sm text-gray-700 font-medium block text-center mb-2">
                Các năm đã chọn để so sánh (ít nhất 2 năm):
              </label>

              {/* Hiển thị các năm đã chọn dưới dạng tags */}
              {compareYears.length > 0 ? (
                <div className="flex flex-wrap gap-2 justify-center">
                  {compareYears.sort((a, b) => b - a).map((year) => (
                    <div
                      key={year}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg border border-blue-300"
                    >
                      <span className="font-medium">{year}</span>
                      {compareYears.length > 1 && (
                        <button
                          onClick={() => removeYear(year)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Xóa năm này"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center">Chưa có năm nào được chọn</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hiển thị loading */}
      {loading && (
        <div className="flex flex-col gap-4 p-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      )}

      {/* Hiển thị lỗi */}
      {!loading && error && (
        <div className="p-6 text-center bg-red-50 border border-red-200 rounded-lg text-red-700">
          <div className="mb-4">Lỗi: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Hiển thị khi không có sản phẩm */}
      {!loading && !error && !topProducts.length && (
        <div className="text-center py-12 px-4">
          <div className="text-lg font-semibold text-gray-900 mb-2">Không có sản phẩm</div>
          <div className="text-sm text-gray-600">
            Chưa có sản phẩm nào được bán trong tháng {selectedMonth}/{selectedYear} để hiển thị trong danh sách bán chạy.
          </div>
        </div>
      )}

      {/* Hiển thị bảng sản phẩm - Chế độ xem đơn */}
      {viewMode === 'single' && !loading && !error && topProducts.length > 0 && (
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
      )}

      {/* Chế độ so sánh */}
      {viewMode === 'compare' && (
        <>
          {loading && (
            <div className="flex flex-col gap-4 p-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="p-6 text-center bg-red-50 border border-red-200 rounded-lg text-red-700">
              <div className="mb-4">Lỗi: {error}</div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          )}

          {!loading && !error && comparisonData.length > 0 && (
            <div className="space-y-6">
              {/* Biểu đồ so sánh */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Biểu đồ so sánh số lượng bán - Tháng {compareMonth}
                </h3>
                <div className="h-96">
                  {Bar && (
                    <Bar
                      data={prepareComparisonChartData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                            labels: {
                              boxWidth: 12,
                              font: { size: 11 },
                            },
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} sản phẩm`;
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1,
                            },
                          },
                        },
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Bảng so sánh chi tiết */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Bảng so sánh chi tiết
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Sản Phẩm
                        </th>
                        {comparisonData.map((data, idx) => (
                          <th
                            key={idx}
                            className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                          >
                            {data.label}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Tổng
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Lấy top 10 sản phẩm có tổng số lượng cao nhất
                        const productTotals = new Map();
                        comparisonData.forEach((data) => {
                          data.products.forEach((product) => {
                            const current = productTotals.get(product.title) || 0;
                            productTotals.set(product.title, current + product.quantity);
                          });
                        });

                        const topProducts = Array.from(productTotals.entries())
                          .map(([title, total]) => ({ title, total }))
                          .sort((a, b) => b.total - a.total)
                          .slice(0, 10)
                          .map((item) => item.title);

                        return topProducts.map((productTitle, idx) => {
                          const quantities = comparisonData.map((data) => {
                            const product = data.products.find((p) => p.title === productTitle);
                            return product ? product.quantity : 0;
                          });
                          const total = quantities.reduce((a, b) => a + b, 0);

                          return (
                            <tr
                              key={idx}
                              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-3 font-medium text-gray-900">
                                {productTitle}
                              </td>
                              {quantities.map((qty, qIdx) => (
                                <td key={qIdx} className="px-4 py-3 text-center">
                                  <span className="font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded inline-block">
                                    {qty}
                                  </span>
                                </td>
                              ))}
                              <td className="px-4 py-3 text-center">
                                <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded inline-block">
                                  {total}
                                </span>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && comparisonData.length === 0 && (
            <div className="text-center py-12 px-4">
              <div className="text-lg font-semibold text-gray-900 mb-2">
                Không có dữ liệu để so sánh
              </div>
              <div className="text-sm text-gray-600">
                Vui lòng chọn ít nhất một tháng/năm để so sánh.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}