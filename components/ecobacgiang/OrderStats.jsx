import { useState, useEffect } from 'react';
import { ShoppingCart, XCircle, RefreshCw, CheckCircle, TrendingUp, Calendar, DollarSign, BarChart3, ArrowLeftRight, Filter } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import dynamic from 'next/dynamic';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format, getWeek, getYear } from 'date-fns';
import { vi } from 'date-fns/locale';

// Dynamic imports - must be outside component
const DatePickerComponent = dynamic(() => import('react-datepicker'), { ssr: false });
const BarComponent = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function OrderStats() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);
  
  // Time selection states
  const [viewMode, setViewMode] = useState('default'); // 'default', 'custom', 'compare'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Custom time selection states (temporary values before applying)
  const [customTimeType, setCustomTimeType] = useState('day'); // 'day', 'week', 'month', 'year'
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date());
  const [tempSelectedWeek, setTempSelectedWeek] = useState(new Date());
  const [tempSelectedMonth, setTempSelectedMonth] = useState(new Date());
  const [tempSelectedYear, setTempSelectedYear] = useState(new Date().getFullYear());
  
  // Compare mode states - using arrays to support multiple comparisons
  const [compareMode, setCompareMode] = useState('none'); // 'none', 'day', 'week', 'month'
  const [compareDates, setCompareDates] = useState([new Date(), new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)]);
  const [compareWeeks, setCompareWeeks] = useState([new Date(), new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)]);
  const [compareMonths, setCompareMonths] = useState([new Date(), new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
        if (!apiBaseUrl) {
          throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
        }
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        const headers = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${apiBaseUrl}/orders`, {
          method: 'GET',
          headers: headers,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setOrders(data.orders || []);
        setError(null);
      } catch (error) {
        console.error('Error when fetching order stats:', error);
        
        if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
          setError('Không thể kết nối đến server. Vui lòng kiểm tra lại server đã chạy chưa.');
        } else {
          setError(error.message || 'Lỗi khi lấy dữ liệu thống kê');
        }
        
        // Fallback data
        setOrders([
          {
            id: 1,
            finalTotal: 150000,
            status: 'completed',
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            finalTotal: 250000,
            status: 'completed',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 3,
            finalTotal: 750000,
            status: 'completed',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]);
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
    }).format(amount || 0);
  };

  // Helper functions for date calculations
  const getStartOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getEndOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const getStartOfWeekDate = (date) => {
    return startOfWeek(date, { weekStartsOn: 1, locale: vi });
  };

  const getEndOfWeekDate = (date) => {
    return endOfWeek(date, { weekStartsOn: 1, locale: vi });
  };

  // Calculate revenue for a specific date
  const calculateDateRevenue = (date) => {
    const start = getStartOfDay(date);
    const end = getEndOfDay(date);
    return orders
    .filter((order) => {
      const orderDate = new Date(order.createdAt);
        return orderDate >= start && orderDate <= end;
    })
    .reduce((sum, order) => sum + (order.finalTotal || 0), 0);
  };

  // Calculate revenue for a specific week
  const calculateWeekRevenue = (date) => {
    const start = getStartOfWeekDate(date);
    const end = getEndOfWeekDate(date);
    return orders
    .filter((order) => {
      const orderDate = new Date(order.createdAt);
        return orderDate >= start && orderDate <= end;
    })
    .reduce((sum, order) => sum + (order.finalTotal || 0), 0);
  };

  // Calculate revenue for a specific month
  const calculateMonthRevenue = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return orders
    .filter((order) => {
      const orderDate = new Date(order.createdAt);
        return orderDate >= start && orderDate <= end;
    })
    .reduce((sum, order) => sum + (order.finalTotal || 0), 0);
  };

  // Calculate revenue for a specific year
  const calculateYearRevenue = (year) => {
    const start = startOfYear(new Date(year, 0, 1));
    const end = endOfYear(new Date(year, 0, 1));
    return orders
    .filter((order) => {
      const orderDate = new Date(order.createdAt);
        return orderDate >= start && orderDate <= end;
    })
    .reduce((sum, order) => sum + (order.finalTotal || 0), 0);
  };

  // Default calculations
  const now = new Date();
  const today = getStartOfDay(now);
  const thisWeekStart = getStartOfWeekDate(now);
  const thisMonthStart = startOfMonth(now);
  const thisYearStart = startOfYear(now);

  const todayRevenue = calculateDateRevenue(now);
  const thisWeekRevenue = calculateWeekRevenue(now);
  const thisMonthRevenue = calculateMonthRevenue(now);
  const thisYearRevenue = calculateYearRevenue(now.getFullYear());

  // Custom date calculations
  const customDateRevenue = calculateDateRevenue(selectedDate);
  const customWeekRevenue = calculateWeekRevenue(selectedWeek);
  const customMonthRevenue = calculateMonthRevenue(selectedMonth);
  const customYearRevenue = calculateYearRevenue(selectedYear);

  // Compare calculations - using arrays
  const compareDayRevenues = compareMode === 'day' ? compareDates.map(date => calculateDateRevenue(date)) : [];
  const compareWeekRevenues = compareMode === 'week' ? compareWeeks.map(week => calculateWeekRevenue(week)) : [];
  const compareMonthRevenues = compareMode === 'month' ? compareMonths.map(month => calculateMonthRevenue(month)) : [];

  // Prepare chart data
  const prepareChartData = () => {
    if (compareMode === 'day') {
      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
      return {
        labels: compareDates.map(date => format(date, 'dd/MM/yyyy')),
        datasets: [
          {
            label: 'Doanh thu',
            data: compareDayRevenues,
            backgroundColor: compareDates.map((_, index) => colors[index % colors.length]),
          },
        ],
      };
    } else if (compareMode === 'week') {
      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
      return {
        labels: compareWeeks.map(week => `Tuần ${getWeek(week, { weekStartsOn: 1 })}`),
        datasets: [
          {
            label: 'Doanh thu',
            data: compareWeekRevenues,
            backgroundColor: compareWeeks.map((_, index) => colors[index % colors.length]),
          },
        ],
      };
    } else if (compareMode === 'month') {
      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
      return {
        labels: compareMonths.map(month => format(month, 'MM/yyyy')),
        datasets: [
          {
            label: 'Doanh thu',
            data: compareMonthRevenues,
            backgroundColor: compareMonths.map((_, index) => colors[index % colors.length]),
          },
        ],
      };
    } else if (viewMode === 'custom') {
      // Custom mode: Show selected time period and surrounding periods
      if (customTimeType === 'day') {
        // Show 7 days: 3 days before, selected day, 3 days after
        const days = [];
        const revenues = [];
        for (let i = -3; i <= 3; i++) {
          const date = new Date(selectedDate);
          date.setDate(date.getDate() + i);
          days.push(format(date, 'dd/MM'));
          revenues.push(calculateDateRevenue(date));
        }
        return {
          labels: days,
          datasets: [
            {
              label: 'Doanh thu',
              data: revenues,
              backgroundColor: days.map((_, index) => index === 3 ? '#10b981' : '#3b82f6'),
            },
          ],
        };
      } else if (customTimeType === 'week') {
        // Show 4 weeks: 2 weeks before, selected week, 1 week after
        const weeks = [];
        const revenues = [];
        for (let i = -2; i <= 1; i++) {
          const weekDate = new Date(selectedWeek);
          weekDate.setDate(weekDate.getDate() + (i * 7));
          const weekStart = getStartOfWeekDate(weekDate);
          const weekNum = getWeek(weekDate, { weekStartsOn: 1 });
          weeks.push(`Tuần ${weekNum}`);
          revenues.push(calculateWeekRevenue(weekDate));
        }
        return {
          labels: weeks,
          datasets: [
            {
              label: 'Doanh thu',
              data: revenues,
              backgroundColor: weeks.map((_, index) => index === 2 ? '#10b981' : '#3b82f6'),
            },
          ],
        };
      } else if (customTimeType === 'month') {
        // Show 6 months: 3 months before, selected month, 2 months after
        const months = [];
        const revenues = [];
        for (let i = -3; i <= 2; i++) {
          const monthDate = new Date(selectedMonth);
          monthDate.setMonth(monthDate.getMonth() + i);
          months.push(format(monthDate, 'MM/yyyy'));
          revenues.push(calculateMonthRevenue(monthDate));
        }
        return {
          labels: months,
          datasets: [
            {
              label: 'Doanh thu',
              data: revenues,
              backgroundColor: months.map((_, index) => index === 3 ? '#10b981' : '#3b82f6'),
            },
          ],
        };
      } else if (customTimeType === 'year') {
        // Show all 12 months of the selected year
        const months = [];
        const revenues = [];
        for (let i = 0; i < 12; i++) {
          const monthDate = new Date(selectedYear, i, 1);
          months.push(format(monthDate, 'MM/yyyy'));
          revenues.push(calculateMonthRevenue(monthDate));
        }
        return {
          labels: months,
          datasets: [
            {
              label: 'Doanh thu',
              data: revenues,
              backgroundColor: '#10b981',
            },
          ],
        };
      }
    } else {
      // Default chart: Last 7 days
      const last7Days = [];
      const last7DaysRevenue = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(format(date, 'dd/MM'));
        last7DaysRevenue.push(calculateDateRevenue(date));
      }
      return {
        labels: last7Days,
        datasets: [
          {
            label: 'Doanh thu',
            data: last7DaysRevenue,
            backgroundColor: '#10b981',
          },
        ],
      };
    }
  };

  const chartData = prepareChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: compareMode !== 'none' 
          ? 'So sánh doanh thu' 
          : viewMode === 'custom' && customTimeType === 'day'
          ? `Doanh thu xung quanh ngày ${format(selectedDate, 'dd/MM/yyyy')}`
          : viewMode === 'custom' && customTimeType === 'week'
          ? `Doanh thu xung quanh tuần ${getWeek(selectedWeek, { weekStartsOn: 1 })}`
          : viewMode === 'custom' && customTimeType === 'month'
          ? `Doanh thu xung quanh tháng ${format(selectedMonth, 'MM/yyyy')}`
          : viewMode === 'custom' && customTimeType === 'year'
          ? `Doanh thu năm ${selectedYear}`
          : 'Doanh thu 7 ngày gần nhất',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return formatVND(context.parsed.y);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatVND(value);
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-4"></div>
          <span className="text-gray-600">Đang tải thống kê...</span>
        </div>
      </div>
    );
  }

  const showErrorWarning = error && error.includes('Không thể kết nối');

  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Thống Kê Đơn Hàng</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Theo dõi hiệu suất kinh doanh của bạn</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setViewMode('default'); setCompareMode('none'); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'default' && compareMode === 'none'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              Mặc định
            </button>
            <button
              onClick={() => { setViewMode('custom'); setCompareMode('none'); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'custom' && compareMode === 'none'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              <Filter className="w-3 h-3 inline mr-1" />
              Tùy chọn
            </button>
            <button
              onClick={() => { setViewMode('compare'); setCompareMode('day'); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'compare'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              <ArrowLeftRight className="w-3 h-3 inline mr-1" />
              So sánh
            </button>
          </div>
        </div>
        {showErrorWarning && (
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-yellow-800 dark:text-yellow-200 text-sm">
            ⚠️ {error} Đang hiển thị dữ liệu mẫu.
          </div>
        )}
      </div>

      {/* Time Selection Controls */}
      {viewMode === 'custom' && isClient && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Chọn thời gian</h3>
          
          {/* Time Type Selection */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setCustomTimeType('day')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                customTimeType === 'day'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              <Calendar className="w-3 h-3 inline mr-1" />
              Ngày
            </button>
            <button
              onClick={() => setCustomTimeType('week')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                customTimeType === 'week'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              <Calendar className="w-3 h-3 inline mr-1" />
              Tuần
            </button>
            <button
              onClick={() => setCustomTimeType('month')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                customTimeType === 'month'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              <BarChart3 className="w-3 h-3 inline mr-1" />
              Tháng
            </button>
            <button
              onClick={() => setCustomTimeType('year')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                customTimeType === 'year'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              <DollarSign className="w-3 h-3 inline mr-1" />
              Năm
            </button>
          </div>

          {/* Time Input Based on Type */}
          <div className="mb-4">
            {customTimeType === 'day' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Chọn ngày</label>
                <DatePickerComponent
                  selected={tempSelectedDate}
                  onChange={(date) => setTempSelectedDate(date)}
                  dateFormat="dd/MM/yyyy"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            )}
            {customTimeType === 'week' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Chọn tuần (chọn một ngày trong tuần)</label>
                <DatePickerComponent
                  selected={tempSelectedWeek}
                  onChange={(date) => setTempSelectedWeek(date)}
                  dateFormat="dd/MM/yyyy"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Tuần {getWeek(tempSelectedWeek, { weekStartsOn: 1 })} ({format(getStartOfWeekDate(tempSelectedWeek), 'dd/MM/yyyy')} - {format(getEndOfWeekDate(tempSelectedWeek), 'dd/MM/yyyy')})
                </p>
            </div>
            )}
            {customTimeType === 'month' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Chọn tháng</label>
                <DatePickerComponent
                  selected={tempSelectedMonth}
                  onChange={(date) => setTempSelectedMonth(date)}
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                />
          </div>
            )}
            {customTimeType === 'year' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Chọn năm</label>
                <input
                  type="number"
                  value={tempSelectedYear}
                  onChange={(e) => setTempSelectedYear(parseInt(e.target.value) || new Date().getFullYear())}
                  min="2020"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                />
          </div>
            )}
        </div>

          {/* Apply Button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (customTimeType === 'day') {
                  setSelectedDate(tempSelectedDate);
                } else if (customTimeType === 'week') {
                  setSelectedWeek(tempSelectedWeek);
                } else if (customTimeType === 'month') {
                  setSelectedMonth(tempSelectedMonth);
                } else if (customTimeType === 'year') {
                  setSelectedYear(tempSelectedYear);
                }
              }}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-md transition-colors shadow-sm hover:shadow"
            >
              <CheckCircle className="w-4 h-4 inline mr-1.5" />
              Áp dụng
            </button>
            </div>
          </div>
      )}

      {/* Compare Mode Controls */}
      {viewMode === 'compare' && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">So sánh doanh thu</h3>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setCompareMode('day')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                compareMode === 'day'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              So sánh ngày
            </button>
            <button
              onClick={() => setCompareMode('week')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                compareMode === 'week'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              So sánh tuần
            </button>
            <button
              onClick={() => setCompareMode('month')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                compareMode === 'month'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              So sánh tháng
            </button>
          </div>
          {compareMode === 'day' && (
            <div className="space-y-3">
              {compareDates.map((date, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Ngày {index + 1}
                    </label>
                    <DatePickerComponent
                      selected={date}
                      onChange={(newDate) => {
                        const newDates = [...compareDates];
                        newDates[index] = newDate;
                        setCompareDates(newDates);
                      }}
                      dateFormat="dd/MM/yyyy"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  {compareDates.length > 1 && (
                    <button
                      onClick={() => {
                        const newDates = compareDates.filter((_, i) => i !== index);
                        setCompareDates(newDates);
                      }}
                      className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      title="Xóa"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setCompareDates([...compareDates, new Date()])}
                className="w-full px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Thêm ngày
              </button>
            </div>
          )}
          {compareMode === 'week' && (
            <div className="space-y-3">
              {compareWeeks.map((week, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Tuần {index + 1}
                    </label>
                    <DatePickerComponent
                      selected={week}
                      onChange={(newWeek) => {
                        const newWeeks = [...compareWeeks];
                        newWeeks[index] = newWeek;
                        setCompareWeeks(newWeeks);
                      }}
                      dateFormat="dd/MM/yyyy"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Tuần {getWeek(week, { weekStartsOn: 1 })} ({format(getStartOfWeekDate(week), 'dd/MM')} - {format(getEndOfWeekDate(week), 'dd/MM/yyyy')})
                    </p>
                  </div>
                  {compareWeeks.length > 1 && (
                    <button
                      onClick={() => {
                        const newWeeks = compareWeeks.filter((_, i) => i !== index);
                        setCompareWeeks(newWeeks);
                      }}
                      className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      title="Xóa"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setCompareWeeks([...compareWeeks, new Date()])}
                className="w-full px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Thêm tuần
              </button>
            </div>
          )}
          {compareMode === 'month' && (
            <div className="space-y-3">
              {compareMonths.map((month, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Tháng {index + 1}
                    </label>
                    <DatePickerComponent
                      selected={month}
                      onChange={(newMonth) => {
                        const newMonths = [...compareMonths];
                        newMonths[index] = newMonth;
                        setCompareMonths(newMonths);
                      }}
                      dateFormat="MM/yyyy"
                      showMonthYearPicker
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  {compareMonths.length > 1 && (
                    <button
                      onClick={() => {
                        const newMonths = compareMonths.filter((_, i) => i !== index);
                        setCompareMonths(newMonths);
                      }}
                      className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      title="Xóa"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setCompareMonths([...compareMonths, new Date()])}
                className="w-full px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Thêm tháng
              </button>
            </div>
          )}
        </div>
      )}

      {/* Revenue Cards */}
      <div className={
        viewMode === 'compare' 
          ? 'flex flex-wrap gap-3' 
          : viewMode === 'custom' 
          ? 'grid grid-cols-1 gap-3' 
          : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'
      }>
        {viewMode === 'default' && (
          <>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">Doanh thu hôm nay</h3>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatVND(todayRevenue)}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">Doanh thu tuần này</h3>
                <Calendar className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatVND(thisWeekRevenue)}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">Doanh thu tháng này</h3>
                <BarChart3 className="w-4 h-4 text-orange-500" />
          </div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatVND(thisMonthRevenue)}</p>
          </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">Doanh thu năm</h3>
                <DollarSign className="w-4 h-4 text-purple-500" />
        </div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatVND(thisYearRevenue)}</p>
      </div>
          </>
        )}
        
        {viewMode === 'custom' && (
          <>
            {customTimeType === 'day' && (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">Ngày {format(selectedDate, 'dd/MM/yyyy')}</h3>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatVND(customDateRevenue)}</p>
              </div>
            )}
            {customTimeType === 'week' && (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Tuần {getWeek(selectedWeek, { weekStartsOn: 1 })} ({format(getStartOfWeekDate(selectedWeek), 'dd/MM')} - {format(getEndOfWeekDate(selectedWeek), 'dd/MM/yyyy')})
                  </h3>
                  <Calendar className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatVND(customWeekRevenue)}</p>
              </div>
            )}
            {customTimeType === 'month' && (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">Tháng {format(selectedMonth, 'MM/yyyy')}</h3>
                  <BarChart3 className="w-4 h-4 text-orange-500" />
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatVND(customMonthRevenue)}</p>
              </div>
            )}
            {customTimeType === 'year' && (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">Năm {selectedYear}</h3>
                  <DollarSign className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatVND(customYearRevenue)}</p>
              </div>
            )}
          </>
        )}

        {viewMode === 'compare' && (
          <>
            {compareMode === 'day' && compareDates.map((date, index) => {
              const revenue = compareDayRevenues[index];
              const maxRevenue = Math.max(...compareDayRevenues);
              const minRevenue = Math.min(...compareDayRevenues);
              const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
              return (
                <div key={index} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex-1 min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">{format(date, 'dd/MM/yyyy')}</h3>
                    <TrendingUp className="w-4 h-4" style={{ color: colors[index % colors.length] }} />
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatVND(revenue)}</p>
                  {compareDates.length > 1 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {revenue === maxRevenue && revenue > minRevenue ? (
                        <span className="text-green-600">↑ Cao nhất</span>
                      ) : revenue === minRevenue && revenue < maxRevenue ? (
                        <span className="text-red-600">↓ Thấp nhất</span>
                      ) : null}
                    </p>
                  )}
                </div>
              );
            })}
            {compareMode === 'week' && compareWeeks.map((week, index) => {
              const revenue = compareWeekRevenues[index];
              const maxRevenue = Math.max(...compareWeekRevenues);
              const minRevenue = Math.min(...compareWeekRevenues);
              const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
              return (
                <div key={index} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex-1 min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Tuần {getWeek(week, { weekStartsOn: 1 })}
                    </h3>
                    <TrendingUp className="w-4 h-4" style={{ color: colors[index % colors.length] }} />
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatVND(revenue)}</p>
                  {compareWeeks.length > 1 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {revenue === maxRevenue && revenue > minRevenue ? (
                        <span className="text-green-600">↑ Cao nhất</span>
                      ) : revenue === minRevenue && revenue < maxRevenue ? (
                        <span className="text-red-600">↓ Thấp nhất</span>
                      ) : null}
                    </p>
                  )}
                </div>
              );
            })}
            {compareMode === 'month' && compareMonths.map((month, index) => {
              const revenue = compareMonthRevenues[index];
              const maxRevenue = Math.max(...compareMonthRevenues);
              const minRevenue = Math.min(...compareMonthRevenues);
              const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
              return (
                <div key={index} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex-1 min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">{format(month, 'MM/yyyy')}</h3>
                    <TrendingUp className="w-4 h-4" style={{ color: colors[index % colors.length] }} />
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatVND(revenue)}</p>
                  {compareMonths.length > 1 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {revenue === maxRevenue && revenue > minRevenue ? (
                        <span className="text-green-600">↑ Cao nhất</span>
                      ) : revenue === minRevenue && revenue < maxRevenue ? (
                        <span className="text-red-600">↓ Thấp nhất</span>
                      ) : null}
                    </p>
                  )}
                </div>
              );
            })}
          </>
        )}
          </div>

      {/* Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Biểu đồ doanh thu</h3>
        <div style={{ height: '400px' }}>
          {chartData && <BarComponent data={chartData} options={chartOptions} />}
        </div>
      </div>
    </div>
  );
}
