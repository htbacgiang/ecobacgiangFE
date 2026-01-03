import { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Filter, Plus, Edit, Trash2, Search, Calendar, FileText, Users, Package, AlertCircle, ExternalLink, ArrowLeftRight, Building2, BarChart3, PieChart, Lock, Unlock, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';

export default function InternalAccounting() {
  const router = useRouter();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'receivables', 'payables', 'inventory', 'transfer', 'assets', 'profit-loss', 'balance-sheet', 'period-closing', 'adjusting'
  
  // Overview/Transactions states
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  // Receivables states
  const [receivables, setReceivables] = useState([]);
  const [loadingReceivables, setLoadingReceivables] = useState(false);
  const [agingReport, setAgingReport] = useState(null);
  
  // Payables states
  const [payables, setPayables] = useState([]);
  const [loadingPayables, setLoadingPayables] = useState(false);
  
  // Inventory states
  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  
  // Transfer states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFormData, setTransferFormData] = useState({
    fromAccountCode: '1121', // Tiền gửi ngân hàng
    toAccountCode: '111', // Tiền mặt
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
  });
  
  // Fixed Assets states
  const [fixedAssets, setFixedAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [assetFormData, setAssetFormData] = useState({
    name: '',
    assetCode: '',
    originalCost: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    usefulLife: '', // Tháng
    purchaseAccountCode: '1121', // Mặc định: Tiền gửi ngân hàng
    description: '',
    notes: '',
  });
  
  // Financial Reports states
  const [profitLossData, setProfitLossData] = useState(null);
  const [loadingPL, setLoadingPL] = useState(false);
  const [balanceSheetData, setBalanceSheetData] = useState(null);
  const [loadingBalanceSheet, setLoadingBalanceSheet] = useState(false);
  const [reportDateRange, setReportDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Đầu tháng
    endDate: new Date().toISOString().split('T')[0], // Hôm nay
  });
  
  // Period Closing states
  const [accountingPeriods, setAccountingPeriods] = useState([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [showClosePeriodModal, setShowClosePeriodModal] = useState(false);
  const [closePeriodFormData, setClosePeriodFormData] = useState({
    periodId: '',
    lockDate: '',
    notes: '',
  });
  
  // Adjusting Entry states
  const [showAdjustingModal, setShowAdjustingModal] = useState(false);
  const [adjustingFormData, setAdjustingFormData] = useState({
    referenceNo: '',
    date: new Date().toISOString().split('T')[0],
    adjustedDate: '',
    memo: '',
    notes: '',
    lines: [
      { accountCode: '', debit: '', credit: '', description: '' },
      { accountCode: '', debit: '', credit: '', description: '' },
    ],
  });

  // Form states
  const [formData, setFormData] = useState({
    type: 'income', // 'income' or 'expense'
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
    paymentStatus: 'paid', // 'paid' (đã chuyển khoản) or 'unpaid' (chưa nhận tiền)
    partnerName: '', // Tên đối tác (Khách hàng/NCC) - chỉ dùng khi paymentStatus = 'unpaid'
    partnerPhone: '', // Số điện thoại đối tác - chỉ dùng khi paymentStatus = 'unpaid'
    dueDate: '', // Ngày hạn trả/thu - chỉ dùng khi paymentStatus = 'unpaid'
  });

  // BƯỚC 1: Tính toán thống kê dựa trên Tài khoản Kế toán (TK 511, 711, 6xx, 8xx)
  // Tính từ JournalEntry lines: TK 511, 711 (Thu) và TK 6xx, 8xx (Chi)
  // Không phụ thuộc vào transactions, chỉ fetch từ JournalEntry
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });

  // BƯỚC 1: Tính toán thống kê dựa trên Tài khoản Kế toán (TK 511, 711, 6xx, 8xx)
  // Không phụ thuộc vào transactions, chỉ fetch từ JournalEntry
  useEffect(() => {
    const calculateStats = async () => {
      try {
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

        // Fetch journal entries để tính stats
        const journalResponse = await fetch(`${apiBaseUrl}/accounting/journal-entries?limit=1000&status=posted`, {
          method: 'GET',
          headers: headers,
        });
        
        if (journalResponse.ok) {
          const journalData = await journalResponse.json();
          const entries = journalData.entries || [];
          
          // Tính Tổng Thu: Tổng Credit của TK 511 (Doanh thu) và TK 711 (Thu nhập khác)
          // Lưu ý: Chỉ tính Credit của các TK này, không tính Debit (vì Debit của TK thu là giảm thu)
          let totalIncome = 0;
          
          // Tính Tổng Chi: Tổng Debit của TK 6xx (Chi phí) và TK 8xx (Chi phí khác)
          // Lưu ý: Chỉ tính Debit của các TK này, không tính Credit (vì Credit của TK chi là giảm chi)
          let totalExpense = 0;
          
          entries.forEach(entry => {
            if (entry.lines && entry.lines.length > 0) {
              entry.lines.forEach(line => {
                const accountCode = line.accountCode || '';
                const credit = parseFloat(line.credit) || 0;
                const debit = parseFloat(line.debit) || 0;
                
                // TK 511: Doanh thu bán hàng và cung cấp dịch vụ
                // TK 711: Thu nhập khác (lãi tiền gửi, thu nhập từ hoạt động khác)
                // Chỉ tính Credit (tăng doanh thu), không tính Debit (giảm doanh thu)
                if (accountCode.startsWith('511') || accountCode.startsWith('711')) {
                  totalIncome += credit;
                }
                
                // TK 6xx: Chi phí sản xuất, kinh doanh
                //   - TK 621: Chi phí nguyên vật liệu trực tiếp
                //   - TK 622: Chi phí nhân công trực tiếp
                //   - TK 627: Chi phí sản xuất chung
                //   - TK 632: Giá vốn hàng bán
                //   - TK 641: Chi phí bán hàng
                //   - TK 642: Chi phí quản lý doanh nghiệp
                // TK 8xx: Chi phí khác (811: Chi phí khác)
                // Chỉ tính Debit (tăng chi phí), không tính Credit (giảm chi phí)
                if (accountCode.startsWith('6') || accountCode.startsWith('8')) {
                  totalExpense += debit;
                }
              });
            }
          });
          
          // Tính Lãi/Lỗ: Doanh thu - Chi phí
          const balance = totalIncome - totalExpense;
          
          setStats({
            totalIncome,
            totalExpense,
            balance,
          });
        } else {
          // Nếu không fetch được, reset về 0
          setStats({
            totalIncome: 0,
            totalExpense: 0,
            balance: 0,
          });
        }
      } catch (error) {
        console.error('Error calculating stats:', error);
        // Nếu có lỗi, reset về 0
        setStats({
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
        });
      }
    };

    // Chỉ tính stats khi ở tab overview
    if (activeTab === 'overview') {
      calculateStats();
    }
  }, [activeTab]); // Loại bỏ dependency 'transactions' vì không cần thiết

  // Categories
  const incomeCategories = [
    'Bán hàng',
    'Dịch vụ',
    'Đầu tư',
    'Khác',
  ];

  const expenseCategories = [
    'Nguyên vật liệu',
    'Lương nhân viên',
    'Marketing',
    'Vận chuyển',
    'Điện nước',
    'Thuê mặt bằng',
    'Bảo trì',
    'Khác',
  ];

  // Fetch Profit & Loss Report (wrapped in useCallback to avoid initialization error)
  const fetchProfitLossReport = useCallback(async () => {
    try {
      setLoadingPL(true);
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

      const params = new URLSearchParams({
        startDate: reportDateRange.startDate,
        endDate: reportDateRange.endDate,
      });

      const response = await fetch(`${apiBaseUrl}/accounting/profit-loss?${params}`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfitLossData(data);
      } else {
        console.error('Error fetching P&L report:', response.statusText);
        setProfitLossData(null);
      }
    } catch (error) {
      console.error('Error fetching P&L report:', error);
      setProfitLossData(null);
    } finally {
      setLoadingPL(false);
    }
  }, [reportDateRange]);

  // Fetch Balance Sheet (wrapped in useCallback to avoid initialization error)
  const fetchBalanceSheet = useCallback(async () => {
    try {
      setLoadingBalanceSheet(true);
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

      const params = new URLSearchParams({
        asOfDate: reportDateRange.endDate,
      });

      const response = await fetch(`${apiBaseUrl}/accounting/balance-sheet-data?${params}`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setBalanceSheetData(data);
      } else {
        console.error('Error fetching balance sheet:', response.statusText);
        setBalanceSheetData(null);
      }
    } catch (error) {
      console.error('Error fetching balance sheet:', error);
      setBalanceSheetData(null);
    } finally {
      setLoadingBalanceSheet(false);
    }
  }, [reportDateRange.endDate]);

  // Fetch transactions
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchTransactions();
    }
  }, [activeTab]);
  
  // Fetch receivables
  useEffect(() => {
    if (activeTab === 'receivables') {
      fetchReceivables();
      fetchAgingReport();
    }
  }, [activeTab]);
  
  // Cập nhật aging report khi receivables thay đổi
  useEffect(() => {
    if (activeTab === 'receivables' && receivables.length > 0) {
      // Khi receivables được cập nhật, tính lại aging report
      // Aging report sẽ được tính lại trong render
    }
  }, [receivables, activeTab]);
  
  // Fetch payables
  useEffect(() => {
    if (activeTab === 'payables') {
      fetchPayables();
    }
  }, [activeTab]);
  
  // Fetch inventory
  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchInventory();
    }
  }, [activeTab]);
  
  // Fetch fixed assets
  useEffect(() => {
    if (activeTab === 'assets') {
      fetchFixedAssets();
    }
  }, [activeTab]);
  
  // Fetch Profit & Loss report
  useEffect(() => {
    if (activeTab === 'profit-loss') {
      fetchProfitLossReport();
    }
  }, [activeTab, fetchProfitLossReport]);
  
  // Fetch Balance Sheet
  useEffect(() => {
    if (activeTab === 'balance-sheet') {
      fetchBalanceSheet();
    }
  }, [activeTab, fetchBalanceSheet]);
  
  // Fetch Accounting Periods
  useEffect(() => {
    if (activeTab === 'period-closing') {
      fetchAccountingPeriods();
    }
  }, [activeTab]);

  // Filter transactions
  useEffect(() => {
    let filtered = transactions;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.description?.toLowerCase().includes(query) ||
        t.category?.toLowerCase().includes(query) ||
        t.reference?.toLowerCase().includes(query)
      );
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  }, [transactions, filterType, searchQuery]);

  const fetchTransactions = async () => {
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

      // BƯỚC 2: Chỉ fetch từ JournalEntry API và ánh xạ dữ liệu
      let allTransactions = [];
      
      try {
        const journalResponse = await fetch(`${apiBaseUrl}/accounting/journal-entries?limit=200&status=posted`, {
          method: 'GET',
          headers: headers,
        });
        
        if (journalResponse.ok) {
          const journalData = await journalResponse.json();
          const entries = journalData.entries || [];
          
          // Ánh xạ JournalEntry thành format hiển thị
          // Mỗi JournalEntry có thể có nhiều dòng, nhưng để hiển thị đơn giản,
          // ta sẽ tạo một transaction record cho mỗi entry
          const journalTransactions = entries.map(entry => {
            // Tìm dòng có ý nghĩa để xác định type và amount
            // Ưu tiên tìm dòng có TK 511 (Doanh thu) hoặc TK 711 (Thu nhập khác) để xác định thu
            // Hoặc tìm dòng có TK 6xx (Chi phí) hoặc TK 8xx (Chi phí khác) để xác định chi
            const revenueLine = entry.lines?.find(l => 
              l.accountCode?.startsWith('511') || l.accountCode?.startsWith('711')
            );
            const expenseLine = entry.lines?.find(l => 
              l.accountCode?.startsWith('6') || l.accountCode?.startsWith('8')
            );
            
            let type = 'expense'; // Mặc định là chi
            let amount = 0;
            let category = 'Khác';
            
            if (revenueLine && revenueLine.credit > 0) {
              // Có dòng doanh thu -> đây là thu nhập
              type = 'income';
              amount = revenueLine.credit;
              
              // Xác định category dựa trên accountCode và entryType
              const accountCode = revenueLine.accountCode || '';
              
              // Kiểm tra TK 3387 (Doanh thu chưa thực hiện) - thường là Bán hàng/Dịch vụ
              const has3387 = entry.lines?.some(l => l.accountCode === '3387');
              
              if (accountCode.startsWith('511')) {
                // TK 511: Doanh thu bán hàng
                if (has3387) {
                  // Có TK 3387 -> đã nhận tiền trước, có thể là Bán hàng hoặc Dịch vụ
                  category = entry.memo?.toLowerCase().includes('dịch vụ') || entry.entryType === 'receipt' 
                    ? 'Dịch vụ' 
                    : 'Bán hàng';
                } else {
                  // Không có TK 3387 -> đã giao hàng
                  category = entry.entryType === 'sale' ? 'Bán hàng' : 
                            entry.entryType === 'receipt' ? 'Dịch vụ' : 
                            entry.memo?.toLowerCase().includes('dịch vụ') ? 'Dịch vụ' : 'Bán hàng';
                }
              } else if (accountCode.startsWith('711')) {
                // TK 711: Thu nhập khác
                category = 'Khác';
              } else {
                // Fallback
                category = entry.entryType === 'sale' ? 'Bán hàng' : 
                          entry.entryType === 'receipt' ? 'Dịch vụ' : 'Khác';
              }
            } else if (expenseLine && expenseLine.debit > 0) {
              // Có dòng chi phí -> đây là chi phí
              type = 'expense';
              amount = expenseLine.debit;
              // Xác định category dựa trên accountCode (chi tiết hơn)
              const accountCode = expenseLine.accountCode || '';
              if (accountCode.startsWith('621')) {
                category = 'Nguyên vật liệu';
              } else if (accountCode.startsWith('622')) {
                category = 'Lương nhân viên';
              } else if (accountCode.startsWith('627')) {
                category = 'Chi phí sản xuất chung';
              } else if (accountCode.startsWith('632')) {
                category = 'Giá vốn hàng bán';
              } else if (accountCode.startsWith('641')) {
                category = 'Marketing'; // Chi phí bán hàng
              } else if (accountCode.startsWith('642')) {
                // TK 642 có thể là nhiều loại chi phí QLDN
                // Ưu tiên lấy từ memo hoặc entryType để phân biệt
                if (entry.memo?.toLowerCase().includes('điện') || entry.memo?.toLowerCase().includes('nước')) {
                  category = 'Điện nước';
                } else if (entry.memo?.toLowerCase().includes('vận chuyển') || entry.memo?.toLowerCase().includes('ship')) {
                  category = 'Vận chuyển';
                } else if (entry.memo?.toLowerCase().includes('thuê') || entry.memo?.toLowerCase().includes('mặt bằng')) {
                  category = 'Thuê mặt bằng';
                } else if (entry.memo?.toLowerCase().includes('bảo trì')) {
                  category = 'Bảo trì';
                } else {
                  category = 'Chi phí QL'; // Mặc định
                }
              } else if (accountCode.startsWith('811')) {
                category = 'Khác';
              } else {
                category = 'Khác';
              }
            } else {
              // Fallback: Tính từ tổng debit/credit
              const totalDebit = entry.lines?.reduce((sum, l) => sum + (l.debit || 0), 0) || 0;
              const totalCredit = entry.lines?.reduce((sum, l) => sum + (l.credit || 0), 0) || 0;
              
              if (totalCredit > totalDebit) {
                type = 'income';
                amount = totalCredit;
              } else {
                type = 'expense';
                amount = totalDebit;
              }
            }
            
            return {
              _id: entry._id,
              journalEntryId: entry._id, // Lưu ID của JournalEntry để có thể sửa/xóa
              type: type,
              amount: amount.toString(),
              description: entry.memo,
              category: category,
              date: new Date(entry.date).toISOString().split('T')[0],
              reference: entry.referenceNo,
              notes: entry.sourceType === 'order' ? `Nguồn: Đơn hàng` : 
                     entry.sourceType === 'MANUAL' ? 'Nhập thủ công' : '',
              source: entry.sourceType || 'manual',
              sourceId: entry.sourceId,
              // Xác định paymentStatus: 
              // - Nếu có TK 131 (Phải thu) -> unpaid (chưa nhận tiền)
              // - Nếu có TK 331 (Phải trả) -> unpaid (chưa trả tiền)
              // - Nếu có TK 3387 (Doanh thu chưa thực hiện) -> paid (đã nhận tiền nhưng chưa giao hàng)
              // - Ngược lại -> paid (đã thanh toán)
              paymentStatus: entry.lines?.some(l => l.accountCode === '131' || l.accountCode === '331') 
                ? 'unpaid' 
                : 'paid',
            };
          });
          
          allTransactions = [...allTransactions, ...journalTransactions];
        }
      } catch (journalError) {
        console.error('Không thể lấy journal entries:', journalError);
        setError('Không thể tải dữ liệu từ hệ thống kế toán. Vui lòng kiểm tra kết nối API.');
      }
      
      // Nếu có dữ liệu từ API, sử dụng nó
      if (allTransactions.length > 0) {
        // Sắp xếp theo ngày giảm dần
        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(allTransactions);
      } else {
        // Không có dữ liệu từ API, sử dụng mock data
        console.log('Không có dữ liệu từ API, sử dụng mock data');
        
        // Mock data phong phú hơn để demo
        const today = new Date();
        const mockTransactions = [
          {
            _id: '1',
            type: 'income',
            amount: '15000000',
            description: 'Bán sản phẩm tháng 1 - Đơn hàng HD001',
            category: 'Bán hàng',
            date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
            reference: 'HD001',
            notes: 'Thanh toán đầy đủ bằng tiền mặt',
          },
          {
            _id: '2',
            type: 'income',
            amount: '8000000',
            description: 'Bán sản phẩm tháng 1 - Đơn hàng HD002',
            category: 'Bán hàng',
            date: new Date(today.getFullYear(), today.getMonth(), 5).toISOString().split('T')[0],
            reference: 'HD002',
            notes: 'Thanh toán chuyển khoản',
          },
          {
            _id: '3',
            type: 'expense',
            amount: '5000000',
            description: 'Lương nhân viên tháng 1',
            category: 'Lương nhân viên',
            date: new Date(today.getFullYear(), today.getMonth(), 10).toISOString().split('T')[0],
            reference: 'EXP001',
            notes: 'Lương cho 5 nhân viên',
          },
          {
            _id: '4',
            type: 'expense',
            amount: '2000000',
            description: 'Mua nguyên vật liệu',
            category: 'Nguyên vật liệu',
            date: new Date(today.getFullYear(), today.getMonth(), 12).toISOString().split('T')[0],
            reference: 'EXP002',
            notes: 'Nhập hàng từ NCC ABC',
          },
          {
            _id: '5',
            type: 'expense',
            amount: '1500000',
            description: 'Chi phí vận chuyển',
            category: 'Vận chuyển',
            date: new Date(today.getFullYear(), today.getMonth(), 15).toISOString().split('T')[0],
            reference: 'EXP003',
            notes: 'Phí ship cho 20 đơn hàng',
          },
          {
            _id: '6',
            type: 'expense',
            amount: '3000000',
            description: 'Chi phí marketing',
            category: 'Marketing',
            date: new Date(today.getFullYear(), today.getMonth(), 18).toISOString().split('T')[0],
            reference: 'EXP004',
            notes: 'Quảng cáo Facebook, Google',
          },
          {
            _id: '7',
            type: 'income',
            amount: '12000000',
            description: 'Bán sản phẩm tháng 1 - Đơn hàng HD003',
            category: 'Bán hàng',
            date: new Date(today.getFullYear(), today.getMonth(), 20).toISOString().split('T')[0],
            reference: 'HD003',
            notes: 'Đơn hàng lớn - khách hàng VIP',
          },
          {
            _id: '8',
            type: 'expense',
            amount: '800000',
            description: 'Tiền điện nước',
            category: 'Điện nước',
            date: new Date(today.getFullYear(), today.getMonth(), 25).toISOString().split('T')[0],
            reference: 'EXP005',
            notes: 'Hóa đơn điện tháng 1',
          },
        ];

        setTransactions(mockTransactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Không thể tải dữ liệu giao dịch. Vui lòng kiểm tra kết nối API.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // VALIDATION: Kiểm tra các trường bắt buộc khi paymentStatus = 'unpaid'
    if (formData.paymentStatus === 'unpaid') {
      if (!formData.partnerName || !formData.partnerName.trim()) {
        toast.error('Vui lòng nhập Tên Đối tác khi chọn "Chưa nhận tiền"');
        return;
      }
      // Validate phone format nếu có nhập (không bắt buộc)
      if (formData.partnerPhone && formData.partnerPhone.trim()) {
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(formData.partnerPhone.trim())) {
          toast.error('Số điện thoại phải có 10-11 chữ số');
          return;
        }
      }
      if (!formData.dueDate) {
        toast.error('Vui lòng chọn Hạn thanh toán khi chọn "Chưa nhận tiền"');
        return;
      }
      // Validate dueDate không được là ngày quá khứ (nếu cần)
      const dueDateObj = new Date(formData.dueDate);
      if (isNaN(dueDateObj.getTime())) {
        toast.error('Ngày hạn thanh toán không hợp lệ');
        return;
      }
    }
    
    try {
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

      // BƯỚC 3: Gọi API post-entry (tạo mới hoặc sửa)
      // Form này chỉ dùng cho các giao dịch thủ công đơn giản
      // Backend sẽ tự động tạo Journal Entry với các dòng Nợ/Có phù hợp
      // Nếu có journalEntryId, backend sẽ tự động update entry cũ
      
      // Kiểm tra nếu đang edit (có editingTransaction và journalEntryId)
      const isEditing = editingTransaction && editingTransaction.journalEntryId;
      const url = `${apiBaseUrl}/accounting/post-entry`;

      // Helper function: Tạo số chứng từ tự động
      const generateReferenceNo = (date) => {
        const dateObj = new Date(date);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const timestamp = Date.now().toString().slice(-6);
        return `JE-${year}${month}-${timestamp}`;
      };

      // Chuẩn bị dữ liệu cho API post-entry (có thể retry với số chứng từ mới)
      let postEntryData = {
        amount: formData.amount,
        category: formData.category,
        description: formData.description,
        date: formData.date,
        reference: formData.reference || '', // Nếu rỗng, backend sẽ tự động tạo
        notes: formData.notes || '',
        paymentStatus: formData.paymentStatus || 'paid',
        type: formData.type, // 'income' hoặc 'expense'
        // Nếu đang edit, gửi journalEntryId để backend biết cần update
        ...(isEditing && editingTransaction?.journalEntryId ? {
          journalEntryId: editingTransaction.journalEntryId
        } : {}),
        // Gửi thêm các trường quan trọng cho Backend xử lý Công nợ
        // CHỈ gửi khi paymentStatus = 'unpaid'
        // Frontend validation đã kiểm tra các trường bắt buộc (partnerName, dueDate)
        // partnerPhone là tùy chọn, nếu có thì gửi, không có thì để backend tạo mặc định
        ...(formData.paymentStatus === 'unpaid' ? {
          partnerName: formData.partnerName?.trim() || '',
          partnerPhone: formData.partnerPhone?.trim() || '', // Có thể là empty string, backend sẽ xử lý
          dueDate: formData.dueDate || '',
        } : {}),
      };
      
      // Debug: Log chi tiết về partnerName, partnerPhone và dueDate
      if (formData.paymentStatus === 'unpaid') {
        console.log('🔍 Debug thông tin công nợ TRƯỚC KHI GỬI:', {
          paymentStatus: formData.paymentStatus,
          partnerName: formData.partnerName,
          partnerPhone: formData.partnerPhone,
          partnerNameType: typeof formData.partnerName,
          partnerNameTrimmed: formData.partnerName?.trim(),
          partnerPhoneType: typeof formData.partnerPhone,
          partnerPhoneTrimmed: formData.partnerPhone?.trim(),
          partnerPhoneLength: formData.partnerPhone?.trim()?.length || 0,
          partnerPhoneIsEmpty: !formData.partnerPhone || !formData.partnerPhone.trim(),
          dueDate: formData.dueDate,
          dueDateType: typeof formData.dueDate,
          willSendPartnerName: formData.partnerName?.trim() || '',
          willSendPartnerPhone: formData.partnerPhone?.trim() || '',
          willSendDueDate: formData.dueDate || '',
        });
      }

      // Debug: Log khi edit
      if (isEditing && process.env.NODE_ENV === 'development') {
        console.log('📝 Đang edit giao dịch:', {
          journalEntryId: editingTransaction.journalEntryId,
          postEntryData,
          isEditing,
          formData: {
            paymentStatus: formData.paymentStatus,
            partnerName: formData.partnerName,
            dueDate: formData.dueDate
          }
        });
      }

      // Debug: Log dữ liệu gửi đi (chỉ trong development)
      if (process.env.NODE_ENV === 'development') {
        console.log('📤 Gửi dữ liệu đến API post-entry:', JSON.stringify(postEntryData, null, 2));
        console.log('📱 Chi tiết partnerPhone trong postEntryData:', {
          hasPartnerPhone: 'partnerPhone' in postEntryData,
          partnerPhoneValue: postEntryData.partnerPhone,
          partnerPhoneType: typeof postEntryData.partnerPhone,
          partnerPhoneLength: postEntryData.partnerPhone ? postEntryData.partnerPhone.length : 0
        });
      }

      // Retry logic: Nếu số chứng từ trùng, tự động tạo số mới và thử lại
      let retryCount = 0;
      const maxRetries = 1; // Chỉ retry 1 lần
      let response;
      let errorData = {};

      while (retryCount <= maxRetries) {
        // Call API post-entry (luôn dùng POST, backend sẽ tự động detect edit từ journalEntryId)
        response = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(postEntryData),
        });

        if (response.ok) {
          // Thành công, thoát khỏi vòng lặp
          break;
        }

        // Parse error data
        try {
          errorData = await response.json();
        } catch (parseError) {
          // Nếu không parse được JSON, lấy text response
          const textResponse = await response.text();
          console.error('❌ Backend trả về lỗi không phải JSON:', textResponse);
          errorData = { message: `Lỗi từ server: ${textResponse || response.statusText}` };
          break; // Không thể retry với lỗi này
        }

        // Kiểm tra nếu là lỗi "Số chứng từ đã tồn tại" và chưa retry quá số lần cho phép
        if (errorData.message && errorData.message.includes('Số chứng từ đã tồn tại') && retryCount < maxRetries) {
          // Tự động tạo số chứng từ mới và thử lại
          const oldReference = postEntryData.reference || '(tự động)';
          const newReference = generateReferenceNo(formData.date);
          console.log(`⚠️ Số chứng từ "${oldReference}" đã tồn tại. Tự động tạo số mới: ${newReference}`);
          postEntryData.reference = newReference;
          retryCount++;
          // Thông báo cho người dùng biết đã tự động tạo số chứng từ mới
          toast(`⚠️ Số chứng từ "${oldReference}" đã tồn tại. Đã tự động tạo số mới: ${newReference}`, {
            icon: '⚠️',
            duration: 4000,
          });
          continue; // Thử lại với số chứng từ mới
        } else {
          // Lỗi khác hoặc đã retry hết số lần, thoát khỏi vòng lặp
          break;
        }
      }

      // Xử lý lỗi nếu vẫn không thành công sau khi retry
      if (!response.ok) {
        // Xây dựng thông báo lỗi chi tiết
        let errorMessage = errorData.message || `Lỗi khi hạch toán (Status: ${response.status})`;
        
        // Nếu đã retry và vẫn lỗi "Số chứng từ đã tồn tại", thông báo rõ ràng hơn
        if (errorData.message && errorData.message.includes('Số chứng từ đã tồn tại') && retryCount >= maxRetries) {
          errorMessage = `Số chứng từ "${postEntryData.reference}" đã tồn tại. Vui lòng nhập số chứng từ khác hoặc để trống để hệ thống tự động tạo.`;
        }
        
        // Thêm thông tin chi tiết nếu có
        if (errorData.missingAccount) {
          errorMessage += `\n\n⚠️ Thiếu tài khoản: ${errorData.missingAccount}`;
          if (errorData.suggestion) {
            errorMessage += `\n💡 Gợi ý: ${errorData.suggestion}`;
          }
        }
        
        if (errorData.totalDebit !== undefined && errorData.totalCredit !== undefined) {
          errorMessage += `\n\n⚠️ Chứng từ không cân bằng:\n- Tổng Nợ: ${errorData.totalDebit.toLocaleString('vi-VN')} VNĐ\n- Tổng Có: ${errorData.totalCredit.toLocaleString('vi-VN')} VNĐ`;
        }
        
        // Log chi tiết lỗi để debug
        console.error('❌ Lỗi từ Backend API:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          requestData: postEntryData,
          retryCount,
        });
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      const savedEntry = responseData.entry || responseData;

      // BƯỚC 4: Sau khi hạch toán xong, refresh transactions
      // Stats sẽ tự động được tính lại trong useEffect [activeTab] khi activeTab === 'overview'
      await fetchTransactions();
      
      toast.success(isEditing ? 'Cập nhật giao dịch thành công' : 'Hạch toán thành công');
      setShowAddModal(false);
      setEditingTransaction(null);
      resetForm();
    } catch (error) {
      console.error('Error posting entry:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi hạch toán');
    }
  };

  // Handle Transfer Submit
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    
    try {
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

      const response = await fetch(`${apiBaseUrl}/accounting/internal-transfer`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(transferFormData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Lỗi khi chuyển quỹ (Status: ${response.status})`;
        throw new Error(errorMessage);
      }

      toast.success('Chuyển quỹ thành công');
      setShowTransferModal(false);
      setTransferFormData({
        fromAccountCode: '1121',
        toAccountCode: '111',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        reference: '',
      });
      
      // Refresh transactions để hiển thị bút toán mới
      if (activeTab === 'overview') {
        await fetchTransactions();
      }
    } catch (error) {
      console.error('Error transferring funds:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi chuyển quỹ');
    }
  };

  // Handle Asset Submit
  const handleAssetSubmit = async (e) => {
    e.preventDefault();
    
    try {
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

      const response = await fetch(`${apiBaseUrl}/accounting/fixed-assets`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(assetFormData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Lỗi khi thêm tài sản (Status: ${response.status})`;
        throw new Error(errorMessage);
      }

      toast.success('Thêm tài sản cố định thành công');
      setShowAssetModal(false);
      setAssetFormData({
        name: '',
        assetCode: '',
        originalCost: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        usefulLife: '',
        purchaseAccountCode: '1121',
        description: '',
        notes: '',
      });
      
      // Refresh fixed assets list
      await fetchFixedAssets();
    } catch (error) {
      console.error('Error creating fixed asset:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi thêm tài sản');
    }
  };


  // Fetch Accounting Periods
  const fetchAccountingPeriods = async () => {
    try {
      setLoadingPeriods(true);
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

      const response = await fetch(`${apiBaseUrl}/accounting/periods`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setAccountingPeriods(data.periods || []);
      } else {
        console.error('Error fetching periods:', response.statusText);
        setAccountingPeriods([]);
      }
    } catch (error) {
      console.error('Error fetching periods:', error);
      setAccountingPeriods([]);
    } finally {
      setLoadingPeriods(false);
    }
  };

  // Handle Close Period Submit
  const handleClosePeriodSubmit = async (e) => {
    e.preventDefault();
    
    try {
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

      const response = await fetch(`${apiBaseUrl}/accounting/close-period`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(closePeriodFormData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Lỗi khi khóa sổ (Status: ${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      toast.success(`Khóa sổ thành công! Lợi nhuận ròng: ${formatCurrency(data.summary.netProfit)}`);
      setShowClosePeriodModal(false);
      setClosePeriodFormData({
        periodId: '',
        lockDate: '',
        notes: '',
      });
      
      // Refresh periods list
      await fetchAccountingPeriods();
    } catch (error) {
      console.error('Error closing period:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi khóa sổ');
    }
  };

  // Handle Adjusting Entry Submit
  const handleAdjustingSubmit = async (e) => {
    e.preventDefault();
    
    // Validate: Tổng Nợ = Tổng Có
    const totalDebit = adjustingFormData.lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
    const totalCredit = adjustingFormData.lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      toast.error(`Bút toán không cân bằng. Tổng Nợ: ${formatCurrency(totalDebit)}, Tổng Có: ${formatCurrency(totalCredit)}`);
      return;
    }
    
    // Validate: Ít nhất 2 dòng
    const validLines = adjustingFormData.lines.filter(line => 
      line.accountCode && (parseFloat(line.debit) > 0 || parseFloat(line.credit) > 0)
    );
    
    if (validLines.length < 2) {
      toast.error('Cần ít nhất 2 dòng bút toán');
      return;
    }
    
    try {
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

      const response = await fetch(`${apiBaseUrl}/accounting/adjusting-entry`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          ...adjustingFormData,
          lines: validLines.map(line => ({
            accountCode: line.accountCode,
            debit: parseFloat(line.debit) || 0,
            credit: parseFloat(line.credit) || 0,
            description: line.description || adjustingFormData.memo,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Lỗi khi tạo bút toán điều chỉnh (Status: ${response.status})`;
        throw new Error(errorMessage);
      }

      toast.success('Tạo bút toán điều chỉnh thành công');
      setShowAdjustingModal(false);
      setAdjustingFormData({
        referenceNo: '',
        date: new Date().toISOString().split('T')[0],
        adjustedDate: '',
        memo: '',
        notes: '',
        lines: [
          { accountCode: '', debit: '', credit: '', description: '' },
          { accountCode: '', debit: '', credit: '', description: '' },
        ],
      });
      
      // Refresh transactions
      if (activeTab === 'overview') {
        await fetchTransactions();
      }
    } catch (error) {
      console.error('Error creating adjusting entry:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi tạo bút toán điều chỉnh');
    }
  };

  // Add line to adjusting entry
  const addAdjustingLine = () => {
    setAdjustingFormData({
      ...adjustingFormData,
      lines: [...adjustingFormData.lines, { accountCode: '', debit: '', credit: '', description: '' }],
    });
  };

  // Remove line from adjusting entry
  const removeAdjustingLine = (index) => {
    if (adjustingFormData.lines.length > 2) {
      const newLines = adjustingFormData.lines.filter((_, i) => i !== index);
      setAdjustingFormData({ ...adjustingFormData, lines: newLines });
    }
  };

  // Fetch Fixed Assets
  const fetchFixedAssets = async () => {
    try {
      setLoadingAssets(true);
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

      const response = await fetch(`${apiBaseUrl}/accounting/fixed-assets`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setFixedAssets(data.assets || []);
      } else {
        console.error('Error fetching fixed assets:', response.statusText);
        setFixedAssets([]);
      }
    } catch (error) {
      console.error('Error fetching fixed assets:', error);
      setFixedAssets([]);
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giao dịch này?\n\n⚠️ Lưu ý: Nếu giao dịch này đã có công nợ liên quan, bạn cần xóa công nợ trước.')) {
      return;
    }

    try {
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

      // Gọi API xóa journal entry
      const response = await fetch(`${apiBaseUrl}/accounting/journal-entries/${id}`, {
        method: 'DELETE',
        headers: headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Lỗi khi xóa giao dịch (Status: ${response.status})`;
        throw new Error(errorMessage);
      }

      // Refresh danh sách giao dịch
      await fetchTransactions();
      toast.success('Xóa giao dịch thành công');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi xóa giao dịch');
    }
  };

  const handleEdit = async (transaction) => {
    setEditingTransaction(transaction);
    
    // Fetch thông tin Receivable/Payable nếu có (để lấy partnerName, partnerPhone và dueDate)
    let partnerName = '';
    let partnerPhone = '';
    let dueDate = '';
    
    if (transaction.paymentStatus === 'unpaid' && transaction.journalEntryId) {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
        if (!apiBaseUrl) {
          throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
        }
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        // Fetch tất cả receivables/payables và tìm theo journalEntryId
        if (transaction.type === 'income') {
          const receivablesResponse = await fetch(`${apiBaseUrl}/accounting/receivables`, { headers });
          if (receivablesResponse.ok) {
            const receivablesData = await receivablesResponse.json();
            const receivables = receivablesData.receivables || [];
            // Tìm receivable có journalEntry trùng với journalEntryId
            const rec = receivables.find(r => {
              const journalEntryId = r.journalEntry?._id || r.journalEntry;
              const targetId = transaction.journalEntryId;
              return journalEntryId?.toString() === targetId?.toString() || 
                     journalEntryId === targetId;
            });
            if (rec) {
              partnerName = rec.customer?.name || '';
              partnerPhone = rec.customer?.phone || '';
              dueDate = rec.dueDate ? new Date(rec.dueDate).toISOString().split('T')[0] : '';
              console.log('✅ Đã tìm thấy Receivable:', { partnerName, partnerPhone, dueDate, rec });
            } else {
              console.log('⚠️ Không tìm thấy Receivable cho journalEntryId:', transaction.journalEntryId);
            }
          }
        } else {
          const payablesResponse = await fetch(`${apiBaseUrl}/accounting/payables`, { headers });
          if (payablesResponse.ok) {
            const payablesData = await payablesResponse.json();
            const payables = payablesData.payables || [];
            // Tìm payable có journalEntry trùng với journalEntryId
            const pay = payables.find(p => {
              const journalEntryId = p.journalEntry?._id || p.journalEntry;
              const targetId = transaction.journalEntryId;
              return journalEntryId?.toString() === targetId?.toString() || 
                     journalEntryId === targetId;
            });
            if (pay) {
              partnerName = pay.supplier?.name || '';
              partnerPhone = pay.supplier?.phone || '';
              dueDate = pay.dueDate ? new Date(pay.dueDate).toISOString().split('T')[0] : '';
              console.log('✅ Đã tìm thấy Payable:', { partnerName, partnerPhone, dueDate, pay });
            } else {
              console.log('⚠️ Không tìm thấy Payable cho journalEntryId:', transaction.journalEntryId);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching receivable/payable:', error);
        // Không throw error, chỉ log để không block việc edit
      }
    }
    
    setFormData({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category || 'Khác', // Đảm bảo có giá trị mặc định
      date: transaction.date,
      reference: transaction.reference || '',
      notes: transaction.notes || '',
      paymentStatus: transaction.paymentStatus || 'paid', // Lấy từ transaction, không dùng mặc định
      partnerName: partnerName,
      partnerPhone: partnerPhone, // Load từ customer/supplier
      dueDate: dueDate,
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'income',
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      reference: '',
      notes: '',
      paymentStatus: 'paid',
      partnerName: '',
      partnerPhone: '',
      dueDate: '',
    });
    setEditingTransaction(null);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Fetch Receivables - BƯỚC 3: Chỉ dùng API receivables chính thức (từ JournalEntry aggregation)
  const fetchReceivables = async () => {
    try {
      setLoadingReceivables(true);
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

      // Chỉ gọi API receivables chính thức
      // Backend sẽ dùng JournalEntry aggregation để tính toán công nợ từ TK 131
      const response = await fetch(`${apiBaseUrl}/accounting/receivables?t=${Date.now()}`, {
        method: 'GET',
        headers: headers,
        cache: 'no-cache',
      });
      
      if (response.ok) {
        const data = await response.json();
        const receivablesData = data.receivables || [];
        setReceivables(receivablesData);
      } else {
        console.error('Error fetching receivables:', response.statusText);
        setReceivables([]);
      }
    } catch (error) {
      console.error('Error fetching receivables:', error);
      setReceivables([]);
    } finally {
      setLoadingReceivables(false);
    }
  };

  // Fetch Aging Report từ API
  const fetchAgingReport = async () => {
    try {
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

      const response = await fetch(`${apiBaseUrl}/accounting/receivables/aging?t=${Date.now()}`, {
        method: 'GET',
        headers: headers,
        cache: 'no-cache', // Không cache để luôn lấy dữ liệu mới
      });
      
      if (response.ok) {
        const data = await response.json();
        setAgingReport(data);
        console.log('✅ Aging report từ API:', data);
      } else {
        console.log('⚠️ API aging report không trả về dữ liệu, sẽ tính từ receivables');
        setAgingReport(null); // Reset để tính từ receivables
      }
    } catch (error) {
      console.error('❌ Error fetching aging report:', error);
      setAgingReport(null); // Reset để tính từ receivables
    }
  };

  // Fetch Payables - BƯỚC 3: Chỉ dùng API payables chính thức (từ JournalEntry aggregation)
  const fetchPayables = async () => {
    try {
      setLoadingPayables(true);
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

      // Chỉ gọi API payables chính thức
      // Backend sẽ dùng JournalEntry aggregation để tính toán công nợ từ TK 331
      const response = await fetch(`${apiBaseUrl}/accounting/payables`, {
        method: 'GET',
        headers: headers,
        cache: 'no-cache',
      });
      
      if (response.ok) {
        const data = await response.json();
        const payablesData = data.payables || [];
        setPayables(payablesData);
      } else {
        console.error('Error fetching payables:', response.statusText);
        setPayables([]);
      }
    } catch (error) {
      console.error('Error fetching payables:', error);
      setPayables([]);
    } finally {
      setLoadingPayables(false);
    }
  };

  // Fetch Inventory - BƯỚC 3: Lấy từ products API (TK 156 - Hàng hóa)
  // Có thể mở rộng để tính từ JournalEntry aggregation nếu cần
  const fetchInventory = async () => {
    try {
      setLoadingInventory(true);
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

      // Fetch from products API
      // Backend có thể tính từ JournalEntry aggregation theo TK 156 (Hàng hóa)
      const response = await fetch(`${apiBaseUrl}/products`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        // Map products to inventory format
        const inventoryData = (data.products || []).map(product => ({
          _id: product._id || product.id,
          name: product.name,
          quantity: product.stock || 0,
          averageCost: product.averageCost || product.price || 0,
          totalValue: (product.stock || 0) * (product.averageCost || product.price || 0),
          unit: product.unit || 'cái',
        }));
        setInventory(inventoryData);
      } else {
        console.error('Error fetching inventory:', response.statusText);
        setInventory([]);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setInventory([]);
    } finally {
      setLoadingInventory(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-screen">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: FileText },
    { id: 'receivables', label: 'Công nợ Phải Thu', icon: Users },
    { id: 'payables', label: 'Công nợ Phải Trả', icon: AlertCircle },
    { id: 'inventory', label: 'Tồn kho', icon: Package },
    { id: 'transfer', label: 'Chuyển quỹ', icon: ArrowLeftRight },
    { id: 'assets', label: 'Tài sản CĐ', icon: Building2 },
    { id: 'profit-loss', label: 'Báo cáo KQKD', icon: BarChart3 },
    { id: 'balance-sheet', label: 'Bảng CĐKT', icon: PieChart },
    { id: 'period-closing', label: 'Khóa Sổ', icon: Lock },
    { id: 'adjusting', label: 'Điều chỉnh', icon: Settings },
  ];

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      {/* Custom styles for scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Kế toán Nội bộ (Internal Accounting)
        </h1>
        {activeTab === 'overview' && (
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow-md"
          >
            <Plus size={20} />
            Thêm giao dịch
          </button>
        )}
      </div>

      {/* Tabs Navigation - Improved Compact Design */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <nav className="flex gap-1 px-2 py-2 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group flex items-center gap-2 px-3 py-2 text-sm    rounded-lg transition-all duration-200 whitespace-nowrap relative
                    ${isActive
                      ? 'tab-active-gradient text-green-600 font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200 active:scale-95'
                    }
                  `}
                  title={tab.label}
                >
                  <Icon 
                    size={16} 
                    className={`
                      transition-all duration-200 flex-shrink-0
                      ${isActive 
                        ? 'text-white' 
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                      }
                    `} 
                  />
                  <span className="hidden md:inline font-medium">{tab.label}</span>
                  <span className="hidden sm:inline md:hidden font-medium">{tab.label.split(' ').slice(0, 2).join(' ')}</span>
                  <span className="sm:hidden font-medium text-xs">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Tổng thu</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatCurrency(stats.totalIncome)}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Tổng chi</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {formatCurrency(stats.totalExpense)}
              </p>
            </div>
            <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
              <TrendingDown className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 ${
          stats.balance >= 0 ? 'border-blue-500' : 'border-orange-500'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Số dư</p>
              <p className={`text-2xl font-bold mt-2 ${
                stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`}>
                {formatCurrency(stats.balance)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              stats.balance >= 0 ? 'bg-blue-100 dark:bg-blue-900' : 'bg-orange-100 dark:bg-orange-900'
            }`}>
              <DollarSign className={stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'} size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo mô tả, danh mục, mã tham chiếu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-4 py-2 rounded-lg transition ${
                filterType === 'income'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Thu
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-4 py-2 rounded-lg transition ${
                filterType === 'expense'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Chi
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ngày
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Mã tham chiếu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Không có giao dịch nào
                  </td>
                </tr>
              ) : (
                currentTransactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {new Date(transaction.date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight size={14} className="mr-1" />
                        ) : (
                          <ArrowDownRight size={14} className="mr-1" />
                        )}
                        {transaction.type === 'income' ? 'Thu' : 'Chi'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {transaction.category}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      transaction.type === 'income'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(parseFloat(transaction.amount) || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        {transaction.orderId ? (
                          <>
                            <span className="text-blue-600 dark:text-blue-400">{transaction.reference || transaction.orderId}</span>
                            <button
                              onClick={() => router.push('/dashboard/danh-sach-order')}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Xem chi tiết đơn hàng"
                            >
                              <ExternalLink size={14} />
                            </button>
                          </>
                        ) : (
                          transaction.reference || '-'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Hiển thị {indexOfFirstItem + 1} đến {Math.min(indexOfLastItem, filteredTransactions.length)} trong tổng số {filteredTransactions.length} giao dịch
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                {editingTransaction ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Loại giao dịch
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="income">Thu</option>
                      <option value="expense">Chi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Số tiền *
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mô tả *
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Danh mục *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Chọn danh mục</option>
                      {(formData.type === 'income' ? incomeCategories : expenseCategories).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ngày *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mã tham chiếu
                  </label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="VD: HD001, EXP001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phương thức thanh toán
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => {
                      const newPaymentStatus = e.target.value;
                      // Nếu chuyển từ 'unpaid' sang 'paid', reset các trường công nợ
                      if (newPaymentStatus === 'paid') {
                        setFormData({ 
                          ...formData, 
                          paymentStatus: newPaymentStatus,
                          partnerName: '',
                          dueDate: ''
                        });
                      } else {
                        setFormData({ ...formData, paymentStatus: newPaymentStatus });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="paid">Đã chuyển khoản</option>
                    <option value="unpaid">Chưa nhận tiền</option>
                  </select>
                  {formData.paymentStatus === 'unpaid' && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      ⚠️ Khi chọn &quot;Chưa nhận tiền&quot;, bạn cần nhập đầy đủ Tên Đối tác và Hạn thanh toán
                    </p>
                  )}
                </div>

                {/* Conditional Debt/Partner Fields - Chỉ hiển thị khi paymentStatus = 'unpaid' */}
                {formData.paymentStatus === 'unpaid' && (
                  <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Chi tiết Đối tác Công nợ</h3>
                    
                    {/* Customer/Supplier Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tên Đối tác (Khách hàng / NCC) *
                      </label>
                      <input
                        type="text"
                        value={formData.partnerName || ''}
                        onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required={formData.paymentStatus === 'unpaid'}
                        placeholder={formData.type === 'income' ? "VD: Khách hàng Lê Hồng Tám" : "VD: Nhà cung cấp ABC"}
                      />
                    </div>
                    
                    {/* Partner Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Số điện thoại đối tác
                      </label>
                      <input
                        type="tel"
                        value={formData.partnerPhone || ''}
                        onChange={(e) => {
                          // Chỉ cho phép nhập số
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData({ ...formData, partnerPhone: value });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="VD: 0901234567 (không bắt buộc)"
                        maxLength={11}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Nhập số điện thoại 10-11 chữ số. Nếu không có, hệ thống sẽ tự tạo số mặc định.
                      </p>
                    </div>
                    
                    {/* Due Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Hạn thanh toán *
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate || ''}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required={formData.paymentStatus === 'unpaid'}
                      />
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Hệ thống sẽ ghi nhận Công nợ (TK 131/331) theo ngày này.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows="3"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingTransaction ? 'Cập nhật' : 'Thêm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
        </>
      )}
      
      {/* Receivables Tab */}
      {activeTab === 'receivables' && (() => {
        // Tính toán thống kê từ receivables hiện có
        const totalOriginal = receivables.reduce((sum, r) => sum + (r.originalAmount || 0), 0);
        const totalRemaining = receivables.reduce((sum, r) => sum + (r.remainingAmount || 0), 0);
        const totalPaid = totalOriginal - totalRemaining;
        const uniqueCustomers = new Set(receivables.map(r => r.customer?._id || r.customer || 'unknown')).size;
        
        // Tính toán Aging Report từ receivables
        // Ưu tiên dùng agingReport từ API, nếu không có hoặc không đầy đủ thì tính từ receivables
        const now = new Date();
        // Reset giờ về 0 để tính chính xác số ngày
        now.setHours(0, 0, 0, 0);
        let agingData = null;
        
        // Kiểm tra xem có agingReport từ API không và có đầy đủ không
        const hasValidAgingReport = agingReport && 
          agingReport.summary && 
          typeof agingReport.summary.current === 'number';
        
        if (hasValidAgingReport && agingReport.summary.current + 
            agingReport.summary.overdue1to30 + 
            agingReport.summary.overdue31to60 + 
            agingReport.summary.overdue61to90 + 
            agingReport.summary.overdue90plus > 0) {
          // Sử dụng aging report từ API nếu có và hợp lệ
          agingData = agingReport;
          console.log('✅ Sử dụng aging report từ API');
        } else if (receivables.length > 0) {
          // Tính toán aging report từ receivables hiện có
          console.log('📊 Tính aging report từ receivables:', receivables.length);
          const aging = {
            current: [],
            overdue1to30: [],
            overdue31to60: [],
            overdue61to90: [],
            overdue90plus: []
          };
          
          // Chỉ tính các công nợ còn lại (chưa thanh toán hết)
          const unpaidReceivables = receivables.filter(rec => 
            (rec.remainingAmount || 0) > 0 && 
            rec.paymentStatus !== 'paid'
          );
          
          unpaidReceivables.forEach(rec => {
            // Lấy ngày hạn thanh toán (dueDate)
            // dueDate là required trong model, nhưng có thể bị null trong dữ liệu cũ
            let dueDate;
            
            if (rec.dueDate) {
              // Ưu tiên dùng dueDate (hạn thanh toán thực tế)
              dueDate = new Date(rec.dueDate);
            } else if (rec.invoiceDate) {
              // Nếu không có dueDate, dùng invoiceDate + 30 ngày (mặc định)
              dueDate = new Date(rec.invoiceDate);
              dueDate.setDate(dueDate.getDate() + 30);
            } else {
              // Trường hợp không có cả 2, dùng ngày hiện tại (không lý tưởng nhưng cần fallback)
              dueDate = new Date(rec.createdAt || Date.now());
              dueDate.setDate(dueDate.getDate() + 30);
            }
            
            // Reset giờ về 0 để tính chính xác số ngày
            dueDate.setHours(0, 0, 0, 0);
            
            // Tính số ngày quá hạn (số dương = quá hạn, số âm = còn hạn)
            const daysDiff = now.getTime() - dueDate.getTime();
            const daysOverdue = Math.floor(daysDiff / (1000 * 60 * 60 * 24));
            const item = { ...rec, daysOverdue, calculatedDueDate: dueDate };
            
            // Debug log để kiểm tra
            console.log('Receivable aging:', {
              id: rec._id,
              remainingAmount: rec.remainingAmount,
              dueDate: rec.dueDate,
              calculatedDueDate: dueDate,
              daysOverdue,
              invoiceDate: rec.invoiceDate
            });
            
            // Phân nhóm theo tuổi nợ
            if (daysOverdue < 0) {
              // Chưa đến hạn (còn hạn)
              aging.current.push(item);
            } else if (daysOverdue >= 0 && daysOverdue <= 30) {
              // Quá hạn 0-30 ngày
              aging.overdue1to30.push(item);
            } else if (daysOverdue > 30 && daysOverdue <= 60) {
              // Quá hạn 31-60 ngày
              aging.overdue31to60.push(item);
            } else if (daysOverdue > 60 && daysOverdue <= 90) {
              // Quá hạn 61-90 ngày
              aging.overdue61to90.push(item);
            } else {
              // Quá hạn > 90 ngày
              aging.overdue90plus.push(item);
            }
          });
          
          agingData = {
            summary: {
              current: aging.current.reduce((sum, r) => sum + (parseFloat(r.remainingAmount) || 0), 0),
              overdue1to30: aging.overdue1to30.reduce((sum, r) => sum + (parseFloat(r.remainingAmount) || 0), 0),
              overdue31to60: aging.overdue31to60.reduce((sum, r) => sum + (parseFloat(r.remainingAmount) || 0), 0),
              overdue61to90: aging.overdue61to90.reduce((sum, r) => sum + (parseFloat(r.remainingAmount) || 0), 0),
              overdue90plus: aging.overdue90plus.reduce((sum, r) => sum + (parseFloat(r.remainingAmount) || 0), 0)
            },
            aging
          };
          
          // Debug log
          console.log('✅ Aging Summary (tính từ receivables):', agingData.summary);
          console.log('📊 Aging buckets:', {
            current: aging.current.length,
            overdue1to30: aging.overdue1to30.length,
            overdue31to60: aging.overdue31to60.length,
            overdue61to90: aging.overdue61to90.length,
            overdue90plus: aging.overdue90plus.length,
            totalReceivables: unpaidReceivables.length
          });
        } else {
          // Nếu không có receivables, tạo agingData rỗng
          agingData = {
            summary: {
              current: 0,
              overdue1to30: 0,
              overdue31to60: 0,
              overdue61to90: 0,
              overdue90plus: 0
            },
            aging: {
              current: [],
              overdue1to30: [],
              overdue31to60: [],
              overdue61to90: [],
              overdue90plus: []
            }
          };
        }
        
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Công nợ Phải Thu (Accounts Receivable)
              </h2>
              
              {/* Tổng quan Thống kê */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tổng công nợ</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(totalOriginal)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Số tiền gốc</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Đã thu</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(totalPaid)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {totalOriginal > 0 ? `${((totalPaid / totalOriginal) * 100).toFixed(1)}%` : '0%'}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-l-4 border-red-500">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Còn lại</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(totalRemaining)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {totalOriginal > 0 ? `${((totalRemaining / totalOriginal) * 100).toFixed(1)}%` : '0%'}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-500">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Số khách hàng nợ</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">{uniqueCustomers}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Khách hàng</p>
                </div>
              </div>
              
              {/* Aging Summary */}
              {agingData && agingData.summary && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                    Phân tích Tuổi nợ (Aging Analysis)
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Phân loại công nợ theo số ngày quá hạn thanh toán
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Chưa đến hạn</p>
                      <p className="text-xl font-bold text-blue-600 mt-1">
                        {formatCurrency(agingData.summary.current || 0)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {((agingData.summary.current / totalRemaining) * 100).toFixed(1)}% tổng nợ
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {agingData.aging?.current?.length || 0} công nợ
                      </p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-2 border-yellow-200 dark:border-yellow-700">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Quá hạn 0-30 ngày</p>
                      <p className="text-xl font-bold text-yellow-600 mt-1">
                        {formatCurrency(agingData.summary.overdue1to30 || 0)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {((agingData.summary.overdue1to30 / totalRemaining) * 100).toFixed(1)}% tổng nợ
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        {agingData.aging?.overdue1to30?.length || 0} công nợ
                      </p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border-2 border-orange-200 dark:border-orange-700">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Quá hạn 31-60 ngày</p>
                      <p className="text-xl font-bold text-orange-600 mt-1">
                        {formatCurrency(agingData.summary.overdue31to60 || 0)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {((agingData.summary.overdue31to60 / totalRemaining) * 100).toFixed(1)}% tổng nợ
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        {agingData.aging?.overdue31to60?.length || 0} công nợ
                      </p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-2 border-red-200 dark:border-red-700">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Quá hạn 61-90 ngày</p>
                      <p className="text-xl font-bold text-red-600 mt-1">
                        {formatCurrency(agingData.summary.overdue61to90 || 0)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {((agingData.summary.overdue61to90 / totalRemaining) * 100).toFixed(1)}% tổng nợ
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {agingData.aging?.overdue61to90?.length || 0} công nợ
                      </p>
                    </div>
                    <div className="bg-red-100 dark:bg-red-900/40 p-4 rounded-lg border-2 border-red-300 dark:border-red-800">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Quá hạn &gt;90 ngày</p>
                      <p className="text-xl font-bold text-red-700 mt-1">
                        {formatCurrency(agingData.summary.overdue90plus || 0)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {((agingData.summary.overdue90plus / totalRemaining) * 100).toFixed(1)}% tổng nợ
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-500 mt-1">
                        {agingData.aging?.overdue90plus?.length || 0} công nợ
                      </p>
                    </div>
                  </div>
                </div>
              )}
            
            {/* Receivables Table */}
            {loadingReceivables ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                Đang tải dữ liệu...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Khách hàng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Số tiền gốc</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Còn lại</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Hạn thanh toán</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {receivables.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Không có công nợ nào</td>
                      </tr>
                    ) : (
                      receivables.map((rec) => {
                        const customer = rec.customer || {};
                        const daysOverdue = Math.floor((new Date() - new Date(rec.dueDate)) / (1000 * 60 * 60 * 24));
                        return (
                          <tr key={rec._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{customer.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{customer.phone || ''}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatCurrency(rec.originalAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                              {formatCurrency(rec.remainingAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {new Date(rec.dueDate).toLocaleDateString('vi-VN')}
                              {daysOverdue > 0 && (
                                <span className="ml-2 text-red-600">({daysOverdue} ngày quá hạn)</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                rec.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                rec.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {rec.paymentStatus === 'paid' ? 'Đã trả' :
                                 rec.paymentStatus === 'partial' ? 'Trả 1 phần' : 'Chưa trả'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        );
      })()}
      
      {/* Payables Tab */}
      {activeTab === 'payables' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Công nợ Phải Trả (Accounts Payable)
            </h2>
            
            {loadingPayables ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                Đang tải dữ liệu...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nhà cung cấp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Số tiền gốc</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Còn nợ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Hạn thanh toán</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Loại</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {payables.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Không có công nợ phải trả nào</td>
                      </tr>
                    ) : (
                      payables.map((pay) => {
                        const supplier = pay.supplier || {};
                        const daysUntilDue = Math.floor((new Date(pay.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                        return (
                          <tr key={pay._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{supplier.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{supplier.phone || ''}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatCurrency(pay.originalAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                              {formatCurrency(pay.remainingAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {new Date(pay.dueDate).toLocaleDateString('vi-VN')}
                              {daysUntilDue < 0 && (
                                <span className="ml-2 text-red-600">(Quá hạn)</span>
                              )}
                              {daysUntilDue >= 0 && daysUntilDue <= 7 && (
                                <span className="ml-2 text-yellow-600">(Sắp đến hạn)</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {pay.billType === 'purchase' ? 'Mua hàng' :
                               pay.billType === 'expense' ? 'Chi phí' : 'Dịch vụ'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                pay.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                pay.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {pay.paymentStatus === 'paid' ? 'Đã trả' :
                                 pay.paymentStatus === 'partial' ? 'Trả 1 phần' : 'Chưa trả'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Tồn kho (Inventory Valuation)
            </h2>
            
            {/* Inventory Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng số lượng</p>
                <p className="text-2xl font-bold text-blue-600">
                  {inventory.reduce((sum, item) => sum + (item.quantity || 0), 0).toLocaleString('vi-VN')}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng giá trị</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(inventory.reduce((sum, item) => sum + (item.totalValue || 0), 0))}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Số mặt hàng</p>
                <p className="text-2xl font-bold text-purple-600">{inventory.length}</p>
              </div>
            </div>
            
            {loadingInventory ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                Đang tải dữ liệu...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tên sản phẩm</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Số lượng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Giá vốn trung bình</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tổng giá trị</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Đơn vị</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {inventory.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Không có sản phẩm nào</td>
                      </tr>
                    ) : (
                      inventory.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.quantity?.toLocaleString('vi-VN') || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(item.averageCost)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {formatCurrency(item.totalValue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {item.unit || 'cái'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Transfer Tab */}
      {activeTab === 'transfer' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Chuyển Quỹ Nội bộ
              </h2>
              <button
                onClick={() => {
                  setTransferFormData({
                    fromAccountCode: '1121',
                    toAccountCode: '111',
                    amount: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    reference: '',
                  });
                  setShowTransferModal(true);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={20} />
                Chuyển quỹ
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Chuyển tiền giữa các tài khoản tài sản (TK 111: Tiền mặt, TK 1121: Tiền gửi ngân hàng)
            </p>
          </div>
        </div>
      )}
      
      {/* Fixed Assets Tab */}
      {activeTab === 'assets' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Tài sản Cố định
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
        if (!apiBaseUrl) {
          throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
        }
                      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                      const headers = { 'Content-Type': 'application/json' };
                      if (token) headers['Authorization'] = `Bearer ${token}`;
                      
                      const response = await fetch(`${apiBaseUrl}/accounting/depreciation/calculate`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({}),
                      });
                      
                      if (response.ok) {
                        toast.success('Đã tính khấu hao thành công');
                        fetchFixedAssets();
                      } else {
                        throw new Error('Lỗi khi tính khấu hao');
                      }
                    } catch (error) {
                      toast.error('Có lỗi xảy ra khi tính khấu hao');
                    }
                  }}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <Calendar size={20} />
                  Tính khấu hao tháng này
                </button>
                <button
                  onClick={() => {
                    setAssetFormData({
                      name: '',
                      assetCode: '',
                      originalCost: '',
                      purchaseDate: new Date().toISOString().split('T')[0],
                      usefulLife: '',
                      purchaseAccountCode: '1121',
                      description: '',
                      notes: '',
                    });
                    setShowAssetModal(true);
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus size={20} />
                  Thêm tài sản
                </button>
              </div>
            </div>
            
            {loadingAssets ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                Đang tải dữ liệu...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tên tài sản</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nguyên giá</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Khấu hao lũy kế</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Giá trị còn lại</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Khấu hao/tháng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {fixedAssets.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Không có tài sản nào</td>
                      </tr>
                    ) : (
                      fixedAssets.map((asset) => (
                        <tr key={asset._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {asset.name}
                            {asset.assetCode && <span className="text-xs text-gray-500 ml-2">({asset.assetCode})</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(asset.originalCost)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(asset.accumulatedDepreciation || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {formatCurrency(asset.bookValue || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(asset.monthlyDepreciation || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              asset.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              asset.status === 'sold' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {asset.status === 'active' ? 'Đang sử dụng' :
                               asset.status === 'sold' ? 'Đã bán' : 'Đã thải loại'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Chuyển Quỹ Nội bộ</h2>
              <form onSubmit={handleTransferSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Từ tài khoản (Nguồn) *
                    </label>
                    <select
                      value={transferFormData.fromAccountCode}
                      onChange={(e) => setTransferFormData({ ...transferFormData, fromAccountCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="111">TK 111 - Tiền mặt</option>
                      <option value="1121">TK 1121 - Tiền gửi ngân hàng</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Đến tài khoản (Đích) *
                    </label>
                    <select
                      value={transferFormData.toAccountCode}
                      onChange={(e) => setTransferFormData({ ...transferFormData, toAccountCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="111">TK 111 - Tiền mặt</option>
                      <option value="1121">TK 1121 - Tiền gửi ngân hàng</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Số tiền *
                    </label>
                    <input
                      type="number"
                      value={transferFormData.amount}
                      onChange={(e) => setTransferFormData({ ...transferFormData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                      min="0"
                      step="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ngày *
                    </label>
                    <input
                      type="date"
                      value={transferFormData.date}
                      onChange={(e) => setTransferFormData({ ...transferFormData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mô tả *
                  </label>
                  <input
                    type="text"
                    value={transferFormData.description}
                    onChange={(e) => setTransferFormData({ ...transferFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                    placeholder="VD: Rút tiền từ ngân hàng về quỹ tiền mặt"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Số chứng từ
                  </label>
                  <input
                    type="text"
                    value={transferFormData.reference}
                    onChange={(e) => setTransferFormData({ ...transferFormData, reference: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Để trống để tự động tạo"
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Chuyển quỹ
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Fixed Asset Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Thêm Tài sản Cố định</h2>
              <form onSubmit={handleAssetSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tên tài sản *
                    </label>
                    <input
                      type="text"
                      value={assetFormData.name}
                      onChange={(e) => setAssetFormData({ ...assetFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                      placeholder="VD: Macbook Pro M1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mã tài sản
                    </label>
                    <input
                      type="text"
                      value={assetFormData.assetCode}
                      onChange={(e) => setAssetFormData({ ...assetFormData, assetCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Để trống để tự động tạo"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nguyên giá *
                    </label>
                    <input
                      type="number"
                      value={assetFormData.originalCost}
                      onChange={(e) => setAssetFormData({ ...assetFormData, originalCost: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                      min="0"
                      step="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Thời gian sử dụng (tháng) *
                    </label>
                    <input
                      type="number"
                      value={assetFormData.usefulLife}
                      onChange={(e) => setAssetFormData({ ...assetFormData, usefulLife: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                      min="1"
                      placeholder="VD: 36"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ngày mua *
                    </label>
                    <input
                      type="date"
                      value={assetFormData.purchaseDate}
                      onChange={(e) => setAssetFormData({ ...assetFormData, purchaseDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tài khoản thanh toán *
                  </label>
                  <select
                    value={assetFormData.purchaseAccountCode}
                    onChange={(e) => setAssetFormData({ ...assetFormData, purchaseAccountCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="111">TK 111 - Tiền mặt</option>
                    <option value="1121">TK 1121 - Tiền gửi ngân hàng</option>
                    <option value="331">TK 331 - Phải trả NCC</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mô tả
                  </label>
                  <input
                    type="text"
                    value={assetFormData.description}
                    onChange={(e) => setAssetFormData({ ...assetFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={assetFormData.notes}
                    onChange={(e) => setAssetFormData({ ...assetFormData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows="3"
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Thêm tài sản
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAssetModal(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Profit & Loss Report Tab */}
      {activeTab === 'profit-loss' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Báo cáo Kết quả Kinh doanh (P&L Statement)
              </h2>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={reportDateRange.startDate}
                  onChange={(e) => setReportDateRange({ ...reportDateRange, startDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
                <span className="self-center text-gray-500">đến</span>
                <input
                  type="date"
                  value={reportDateRange.endDate}
                  onChange={(e) => setReportDateRange({ ...reportDateRange, endDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
            </div>
            
            {loadingPL ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                Đang tải báo cáo...
              </div>
            ) : profitLossData ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Doanh thu thuần</p>
                    <p className="text-xl font-bold text-green-600 mt-2">
                      {formatCurrency(profitLossData.revenue.netRevenue)}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Lãi gộp</p>
                    <p className="text-xl font-bold text-blue-600 mt-2">
                      {formatCurrency(profitLossData.grossProfit)}
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-500">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Lợi nhuận trước thuế</p>
                    <p className="text-xl font-bold text-purple-600 mt-2">
                      {formatCurrency(profitLossData.profitBeforeTax)}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg border-l-4 ${
                    profitLossData.netProfit >= 0 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                      : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                  }`}>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Lợi nhuận sau thuế</p>
                    <p className={`text-xl font-bold mt-2 ${
                      profitLossData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(profitLossData.netProfit)}
                    </p>
                  </div>
                </div>
                
                {/* Detailed P&L Statement */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Chỉ tiêu</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Số tiền</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {/* Doanh thu */}
                      <tr className="bg-green-50 dark:bg-green-900/10">
                        <td className="px-6 py-3 font-semibold text-gray-900 dark:text-white">I. Doanh thu thuần</td>
                        <td className="px-6 py-3 text-right font-semibold text-green-600">
                          {formatCurrency(profitLossData.revenue.netRevenue)}
                        </td>
                      </tr>
                      
                      {/* Giá vốn */}
                      <tr>
                        <td className="px-6 py-3 pl-8 text-gray-700 dark:text-gray-300">Giá vốn hàng bán</td>
                        <td className="px-6 py-3 text-right text-red-600">
                          ({formatCurrency(profitLossData.costOfGoodsSold)})
                        </td>
                      </tr>
                      
                      {/* Lãi gộp */}
                      <tr className="bg-blue-50 dark:bg-blue-900/10">
                        <td className="px-6 py-3 font-semibold text-gray-900 dark:text-white">II. Lãi gộp</td>
                        <td className="px-6 py-3 text-right font-semibold text-blue-600">
                          {formatCurrency(profitLossData.grossProfit)}
                        </td>
                      </tr>
                      
                      {/* Chi phí hoạt động */}
                      <tr>
                        <td className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300">III. Chi phí hoạt động</td>
                        <td className="px-6 py-3 text-right"></td>
                      </tr>
                      <tr>
                        <td className="px-6 py-3 pl-8 text-gray-600 dark:text-gray-400">Chi phí bán hàng</td>
                        <td className="px-6 py-3 text-right text-red-600">
                          ({formatCurrency(profitLossData.operatingExpenses.sellingExpenses)})
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-3 pl-8 text-gray-600 dark:text-gray-400">Chi phí quản lý doanh nghiệp</td>
                        <td className="px-6 py-3 text-right text-red-600">
                          ({formatCurrency(profitLossData.operatingExpenses.adminExpenses)})
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-3 pl-8 text-gray-600 dark:text-gray-400">Chi phí tài chính</td>
                        <td className="px-6 py-3 text-right text-red-600">
                          ({formatCurrency(profitLossData.operatingExpenses.financialExpenses)})
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-3 pl-8 font-medium text-gray-700 dark:text-gray-300">Tổng chi phí hoạt động</td>
                        <td className="px-6 py-3 text-right font-medium text-red-600">
                          ({formatCurrency(profitLossData.operatingExpenses.total)})
                        </td>
                      </tr>
                      
                      {/* Lợi nhuận hoạt động */}
                      <tr className="bg-purple-50 dark:bg-purple-900/10">
                        <td className="px-6 py-3 font-semibold text-gray-900 dark:text-white">IV. Lợi nhuận hoạt động</td>
                        <td className="px-6 py-3 text-right font-semibold text-purple-600">
                          {formatCurrency(profitLossData.operatingProfit)}
                        </td>
                      </tr>
                      
                      {/* Thu nhập/Chi phí khác */}
                      {profitLossData.otherItems.otherIncome > 0 && (
                        <tr>
                          <td className="px-6 py-3 text-gray-700 dark:text-gray-300">Thu nhập khác</td>
                          <td className="px-6 py-3 text-right text-green-600">
                            {formatCurrency(profitLossData.otherItems.otherIncome)}
                          </td>
                        </tr>
                      )}
                      {profitLossData.otherItems.otherCosts > 0 && (
                        <tr>
                          <td className="px-6 py-3 text-gray-700 dark:text-gray-300">Chi phí khác</td>
                          <td className="px-6 py-3 text-right text-red-600">
                            ({formatCurrency(profitLossData.otherItems.otherCosts)})
                          </td>
                        </tr>
                      )}
                      
                      {/* Lợi nhuận trước thuế */}
                      <tr className="bg-yellow-50 dark:bg-yellow-900/10">
                        <td className="px-6 py-3 font-semibold text-gray-900 dark:text-white">V. Lợi nhuận trước thuế</td>
                        <td className="px-6 py-3 text-right font-semibold text-yellow-600">
                          {formatCurrency(profitLossData.profitBeforeTax)}
                        </td>
                      </tr>
                      
                      {/* Thuế TNDN */}
                      {profitLossData.corporateTax > 0 && (
                        <tr>
                          <td className="px-6 py-3 text-gray-700 dark:text-gray-300">Thuế thu nhập doanh nghiệp (20%)</td>
                          <td className="px-6 py-3 text-right text-red-600">
                            ({formatCurrency(profitLossData.corporateTax)})
                          </td>
                        </tr>
                      )}
                      
                      {/* Lợi nhuận sau thuế */}
                      <tr className={`border-t-2 ${
                        profitLossData.netProfit >= 0 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                          : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                      }`}>
                        <td className="px-6 py-4 font-bold text-lg text-gray-900 dark:text-white">VI. Lợi nhuận sau thuế</td>
                        <td className={`px-6 py-4 text-right font-bold text-lg ${
                          profitLossData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(profitLossData.netProfit)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Không có dữ liệu báo cáo
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Balance Sheet Tab */}
      {activeTab === 'balance-sheet' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Bảng Cân đối Kế toán (Balance Sheet)
              </h2>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Ngày lập báo cáo:</label>
                <input
                  type="date"
                  value={reportDateRange.endDate}
                  onChange={(e) => setReportDateRange({ ...reportDateRange, endDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
            </div>
            
            {loadingBalanceSheet ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                Đang tải báo cáo...
              </div>
            ) : balanceSheetData ? (
              <div className="space-y-6">
                {/* Balance Check Alert */}
                {!balanceSheetData.balanceCheck.isBalanced && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
                    <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                      ⚠️ {balanceSheetData.balanceCheck.message}
                    </p>
                  </div>
                )}
                
                {/* Balance Sheet Table */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* TÀI SẢN */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="bg-blue-600 text-white px-6 py-3 font-bold">
                      TÀI SẢN
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tài khoản</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Số dư</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {balanceSheetData.assets.items.length === 0 ? (
                            <tr>
                              <td colSpan="2" className="px-4 py-2 text-center text-gray-500 text-sm">Không có dữ liệu</td>
                            </tr>
                          ) : (
                            balanceSheetData.assets.items
                              .filter(item => item.balance > 0) // Chỉ hiển thị TK có số dư
                              .map((item) => (
                                <tr key={item.accountCode} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="px-4 py-2 text-sm">
                                    <div className="font-medium text-gray-900 dark:text-white">{item.accountCode}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.accountName}</div>
                                  </td>
                                  <td className="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-white">
                                    {formatCurrency(item.balance)}
                                  </td>
                                </tr>
                              ))
                          )}
                          <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-500">
                            <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">TỔNG TÀI SẢN</td>
                            <td className="px-4 py-3 text-right font-bold text-blue-600">
                              {formatCurrency(balanceSheetData.assets.total)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* NGUỒN VỐN */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="bg-green-600 text-white px-6 py-3 font-bold">
                      NGUỒN VỐN
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tài khoản</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Số dư</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {/* Nợ phải trả */}
                          <tr>
                            <td colSpan="2" className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700">
                              A. Nợ phải trả
                            </td>
                          </tr>
                          {balanceSheetData.liabilities.items
                            .filter(item => Math.abs(item.balance) > 0)
                            .map((item) => (
                              <tr key={item.accountCode} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-2 pl-6 text-sm">
                                  <div className="font-medium text-gray-900 dark:text-white">{item.accountCode}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.accountName}</div>
                                </td>
                                <td className="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(Math.abs(item.balance))}
                                </td>
                              </tr>
                            ))}
                          <tr className="bg-gray-50 dark:bg-gray-700">
                            <td className="px-4 py-2 pl-6 font-medium text-gray-700 dark:text-gray-300">Tổng nợ phải trả</td>
                            <td className="px-4 py-2 text-right font-medium text-gray-900 dark:text-white">
                              {formatCurrency(balanceSheetData.liabilities.total)}
                            </td>
                          </tr>
                          
                          {/* Vốn chủ sở hữu */}
                          <tr>
                            <td colSpan="2" className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700">
                              B. Vốn chủ sở hữu
                            </td>
                          </tr>
                          {balanceSheetData.equity.items
                            .filter(item => Math.abs(item.balance) > 0)
                            .map((item) => (
                              <tr key={item.accountCode} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-2 pl-6 text-sm">
                                  <div className="font-medium text-gray-900 dark:text-white">{item.accountCode}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.accountName}</div>
                                </td>
                                <td className="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(Math.abs(item.balance))}
                                </td>
                              </tr>
                            ))}
                          {balanceSheetData.equity.retainedEarnings > 0 && (
                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-4 py-2 pl-6 text-sm">
                                <div className="font-medium text-gray-900 dark:text-white">Lợi nhuận chưa phân phối</div>
                              </td>
                              <td className="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-white">
                                {formatCurrency(balanceSheetData.equity.retainedEarnings)}
                              </td>
                            </tr>
                          )}
                          <tr className="bg-gray-50 dark:bg-gray-700">
                            <td className="px-4 py-2 pl-6 font-medium text-gray-700 dark:text-gray-300">Tổng vốn chủ sở hữu</td>
                            <td className="px-4 py-2 text-right font-medium text-gray-900 dark:text-white">
                              {formatCurrency(balanceSheetData.equity.total)}
                            </td>
                          </tr>
                          
                          {/* Tổng nguồn vốn */}
                          <tr className="bg-green-50 dark:bg-green-900/20 border-t-2 border-green-500">
                            <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">TỔNG NGUỒN VỐN</td>
                            <td className="px-4 py-3 text-right font-bold text-green-600">
                              {formatCurrency(balanceSheetData.totalEquityAndLiabilities)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                {/* Balance Verification */}
                <div className={`p-4 rounded-lg ${
                  balanceSheetData.balanceCheck.isBalanced 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-500' 
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${
                      balanceSheetData.balanceCheck.isBalanced 
                        ? 'text-green-800 dark:text-green-200' 
                        : 'text-red-800 dark:text-red-200'
                    }`}>
                      {balanceSheetData.balanceCheck.isBalanced ? '✅' : '❌'} {balanceSheetData.balanceCheck.message}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Tài sản: {formatCurrency(balanceSheetData.assets.total)} | 
                      Nguồn vốn: {formatCurrency(balanceSheetData.totalEquityAndLiabilities)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Không có dữ liệu báo cáo
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Period Closing Tab */}
      {activeTab === 'period-closing' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Khóa Sổ Kỳ Kế toán
              </h2>
              <button
                onClick={() => {
                  const openPeriod = accountingPeriods.find(p => p.status === 'open');
                  if (openPeriod) {
                    setClosePeriodFormData({
                      periodId: openPeriod._id,
                      lockDate: openPeriod.endDate ? new Date(openPeriod.endDate).toISOString().split('T')[0] : '',
                      notes: '',
                    });
                    setShowClosePeriodModal(true);
                  } else {
                    toast('Không có kỳ kế toán nào đang mở', {
                      icon: '⚠️',
                      duration: 4000,
                    });
                  }
                }}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                <Lock size={20} />
                Khóa sổ kỳ
              </button>
            </div>
            
            {loadingPeriods ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                Đang tải dữ liệu...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Kỳ kế toán</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Từ ngày</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Đến ngày</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ngày khóa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {accountingPeriods.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Chưa có kỳ kế toán nào</td>
                      </tr>
                    ) : (
                      accountingPeriods.map((period) => (
                        <tr key={period._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {period.periodName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(period.startDate).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(period.endDate).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {period.lockDate ? new Date(period.lockDate).toLocaleDateString('vi-VN') : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              period.status === 'closed' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {period.status === 'closed' ? 'Đã khóa' : 'Đang mở'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Adjusting Entry Tab */}
      {activeTab === 'adjusting' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Bút toán Điều chỉnh
              </h2>
              <button
                onClick={() => {
                  setAdjustingFormData({
                    referenceNo: '',
                    date: new Date().toISOString().split('T')[0],
                    adjustedDate: '',
                    memo: '',
                    notes: '',
                    lines: [
                      { accountCode: '', debit: '', credit: '', description: '' },
                      { accountCode: '', debit: '', credit: '', description: '' },
                    ],
                  });
                  setShowAdjustingModal(true);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={20} />
                Tạo bút toán điều chỉnh
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Dùng để sửa chữa sai sót sau khi đã khóa sổ. Bút toán điều chỉnh có ngày giao dịch là ngày hiện tại, nhưng điều chỉnh cho số liệu sai của quá khứ.
            </p>
          </div>
        </div>
      )}
      
      {/* Close Period Modal */}
      {showClosePeriodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Khóa Sổ Kỳ Kế toán</h2>
              <form onSubmit={handleClosePeriodSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kỳ kế toán *
                  </label>
                  <select
                    value={closePeriodFormData.periodId}
                    onChange={(e) => {
                      const period = accountingPeriods.find(p => p._id === e.target.value);
                      setClosePeriodFormData({
                        ...closePeriodFormData,
                        periodId: e.target.value,
                        lockDate: period ? new Date(period.endDate).toISOString().split('T')[0] : '',
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Chọn kỳ kế toán</option>
                    {accountingPeriods
                      .filter(p => p.status === 'open')
                      .map((period) => (
                        <option key={period._id} value={period._id}>
                          {period.periodName} ({new Date(period.startDate).toLocaleDateString('vi-VN')} - {new Date(period.endDate).toLocaleDateString('vi-VN')})
                        </option>
                      ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ngày khóa sổ *
                  </label>
                  <input
                    type="date"
                    value={closePeriodFormData.lockDate}
                    onChange={(e) => setClosePeriodFormData({ ...closePeriodFormData, lockDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Không thể sửa/xóa giao dịch trước ngày này sau khi khóa sổ</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={closePeriodFormData.notes}
                    onChange={(e) => setClosePeriodFormData({ ...closePeriodFormData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows="3"
                    placeholder="Ghi chú về việc khóa sổ..."
                  />
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Lưu ý:</strong> Sau khi khóa sổ, hệ thống sẽ tự động tạo các bút toán kết chuyển:
                    <ul className="list-disc list-inside mt-2">
                      <li>Kết chuyển Doanh thu (TK 5xx, 7xx) → TK 911</li>
                      <li>Kết chuyển Chi phí (TK 6xx, 8xx) → TK 911</li>
                      <li>Kết chuyển Lãi/Lỗ ròng → TK 421</li>
                    </ul>
                  </p>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Khóa sổ
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClosePeriodModal(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Adjusting Entry Modal */}
      {showAdjustingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Tạo Bút toán Điều chỉnh</h2>
              <form onSubmit={handleAdjustingSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ngày điều chỉnh (Ngày hiện tại) *
                    </label>
                    <input
                      type="date"
                      value={adjustingFormData.date}
                      onChange={(e) => setAdjustingFormData({ ...adjustingFormData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ngày giao dịch cần điều chỉnh *
                    </label>
                    <input
                      type="date"
                      value={adjustingFormData.adjustedDate}
                      onChange={(e) => setAdjustingFormData({ ...adjustingFormData, adjustedDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Số chứng từ
                    </label>
                    <input
                      type="text"
                      value={adjustingFormData.referenceNo}
                      onChange={(e) => setAdjustingFormData({ ...adjustingFormData, referenceNo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Để trống để tự động tạo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mô tả *
                    </label>
                    <input
                      type="text"
                      value={adjustingFormData.memo}
                      onChange={(e) => setAdjustingFormData({ ...adjustingFormData, memo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                      placeholder="VD: Điều chỉnh phiếu chi tháng trước bị ghi thiếu"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={adjustingFormData.notes}
                    onChange={(e) => setAdjustingFormData({ ...adjustingFormData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows="2"
                  />
                </div>
                
                {/* Lines */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Chi tiết bút toán *
                    </label>
                    <button
                      type="button"
                      onClick={addAdjustingLine}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Thêm dòng
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 dark:border-gray-600">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">TK</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Nợ</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Có</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Mô tả</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {adjustingFormData.lines.map((line, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={line.accountCode}
                                onChange={(e) => {
                                  const newLines = [...adjustingFormData.lines];
                                  newLines[index].accountCode = e.target.value;
                                  setAdjustingFormData({ ...adjustingFormData, lines: newLines });
                                }}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                                placeholder="VD: 642"
                                required
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={line.debit}
                                onChange={(e) => {
                                  const newLines = [...adjustingFormData.lines];
                                  newLines[index].debit = e.target.value;
                                  newLines[index].credit = ''; // Clear credit when debit is entered
                                  setAdjustingFormData({ ...adjustingFormData, lines: newLines });
                                }}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                                min="0"
                                step="1000"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={line.credit}
                                onChange={(e) => {
                                  const newLines = [...adjustingFormData.lines];
                                  newLines[index].credit = e.target.value;
                                  newLines[index].debit = ''; // Clear debit when credit is entered
                                  setAdjustingFormData({ ...adjustingFormData, lines: newLines });
                                }}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                                min="0"
                                step="1000"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={line.description}
                                onChange={(e) => {
                                  const newLines = [...adjustingFormData.lines];
                                  newLines[index].description = e.target.value;
                                  setAdjustingFormData({ ...adjustingFormData, lines: newLines });
                                }}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                              />
                            </td>
                            <td className="px-3 py-2">
                              {adjustingFormData.lines.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeAdjustingLine(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <td colSpan="1" className="px-3 py-2 font-medium text-sm">Tổng:</td>
                          <td className="px-3 py-2 text-sm font-medium">
                            {formatCurrency(adjustingFormData.lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0))}
                          </td>
                          <td className="px-3 py-2 text-sm font-medium">
                            {formatCurrency(adjustingFormData.lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0))}
                          </td>
                          <td colSpan="2"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Tổng Nợ phải bằng Tổng Có. Mỗi dòng chỉ điền Nợ HOẶC Có, không điền cả hai.
                  </p>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Tạo bút toán
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdjustingModal(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
