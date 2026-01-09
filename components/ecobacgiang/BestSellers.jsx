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

export default function BestSellers({ products: initialProducts = [] }) {
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'compare'
  const [products, setProducts] = useState(initialProducts);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  
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
                ...item,
                title: item.name || item.title || '',
                quantity: item.quantity || 0,
              })),
            };
          });

          const results = await Promise.all(promises);
          setComparisonData(results);
        } catch (err) {
          console.error('Error fetching comparison data:', err);
          setComparisonData([]);
        } finally {
          setLoading(false);
        }
      };

      fetchComparisonData();
    }
  }, [viewMode, compareMonth, compareYears]);

  // Fetch dữ liệu khi tháng/năm thay đổi
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
        if (!apiBaseUrl) {
          throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined');
        }
        
        const url = new URL(`${apiBaseUrl}/orders/bestsellers`);
        url.searchParams.append('month', selectedMonth);
        url.searchParams.append('year', selectedYear);
        
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error('Không thể tải danh sách sản phẩm bán chạy');
        }
        const data = await response.json();
        
        // Map dữ liệu để đảm bảo có trường title
        const mappedData = data.map(item => ({
          ...item,
          title: item.name || item.title || '',
          quantity: item.quantity || 0
        }));
        
        setProducts(mappedData);
      } catch (err) {
        console.error('Error fetching bestsellers:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, [selectedMonth, selectedYear]);

  // Sử dụng initialProducts làm giá trị khởi tạo
  useEffect(() => {
    if (initialProducts.length > 0) {
      const mappedData = initialProducts.map(item => ({
        ...item,
        title: item.name || item.title || '',
        quantity: item.quantity || 0
      }));
      // Chỉ set nếu chưa có dữ liệu từ API
      if (products.length === 0) {
        setProducts(mappedData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-gray-100">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-6 tracking-tight sm:text-5xl">
          Sản Phẩm Bán Chạy Nhất
        </h1>

        {/* Tab chuyển đổi giữa xem đơn và so sánh */}
        <div className="flex gap-2 justify-center mb-6 border-b border-gray-200">
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <div className="flex items-center gap-2">
            <label htmlFor="month-select" className="text-gray-700 font-medium">
              Chọn tháng:
            </label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="year-select" className="text-gray-700 font-medium">
              Chọn năm:
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="space-y-4 mb-8 bg-white p-6 rounded-lg shadow-sm">
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

        {viewMode === 'single' && loading && (
          <div className="text-center text-gray-600 bg-white p-6 rounded-lg shadow-sm">
            <p className="text-lg animate-pulse">Đang tải dữ liệu...</p>
          </div>
        )}

        {viewMode === 'single' && !loading && products.length === 0 && (
          <div className="text-center text-gray-600 bg-white p-6 rounded-lg shadow-sm">
            <p className="text-lg">
              Không có sản phẩm nào trong tháng {selectedMonth}/{selectedYear}.
            </p>
          </div>
        )}

        {viewMode === 'single' && !loading && products.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <div
                key={product.title}
                className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <span
                  className={`text-2xl font-bold mb-3 ${
                    index === 0
                      ? 'text-yellow-500'
                      : index === 1
                      ? 'text-gray-400'
                      : index === 2
                      ? 'text-amber-600'
                      : 'text-gray-600'
                  }`}
                >
                  #{index + 1}
                </span>
                <h2 className="text-xl font-semibold text-gray-800 mb-3 capitalize">
                  {product.title}
                </h2>
                <p className="text-gray-600 text-sm">
                  Đã bán:{' '}
                  <span className="font-bold text-blue-600">
                    {product.quantity}
                  </span>{' '}
                  sản phẩm
                </p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        products[0]
                          ? Math.min(
                              (product.quantity / products[0].quantity) * 100,
                              100
                            )
                          : 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chế độ so sánh */}
        {viewMode === 'compare' && (
          <>
            {loading && (
              <div className="text-center text-gray-600 bg-white p-6 rounded-lg shadow-sm">
                <p className="text-lg animate-pulse">Đang tải dữ liệu...</p>
              </div>
            )}

            {!loading && comparisonData.length > 0 && (
              <div className="space-y-8">
                {/* Biểu đồ so sánh */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
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
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
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

            {!loading && comparisonData.length === 0 && (
              <div className="text-center text-gray-600 bg-white p-6 rounded-lg shadow-sm">
                <p className="text-lg">
                  Không có dữ liệu để so sánh. Vui lòng chọn ít nhất một tháng/năm để so sánh.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}