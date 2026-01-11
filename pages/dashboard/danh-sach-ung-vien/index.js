import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/layout/AdminLayout';
import { toast } from 'react-hot-toast';
import { Download, Eye, FileText, Mail, Phone, User, Briefcase, Calendar, Filter, X } from 'lucide-react';

const RecruitmentManagement = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobTitleFilter, setJobTitleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    accepted: 0,
    rejected: 0
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'admin') {
      const currentPath = router.asPath || router.pathname;
      router.push(`/dang-nhap?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    fetchApplications();
    fetchStats();
  }, [session, status, currentPage, searchTerm, statusFilter, jobTitleFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(jobTitleFilter && { jobTitle: jobTitleFilter })
      });

      const response = await fetch(`/api/recruitment/list?${params}`);
      const data = await response.json();

      if (data.success) {
        setApplications(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.total);
      } else {
        toast.error('Có lỗi xảy ra khi tải danh sách');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/recruitment/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
      reviewing: { label: 'Đang xem xét', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      accepted: { label: 'Đã chấp nhận', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      rejected: { label: 'Đã từ chối', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleViewCV = (application) => {
    if (application.cvFileName) {
      const cvUrl = application.cvFilePath || `/uploads/recruitment/${application.cvFileName}`;
      window.open(cvUrl, '_blank');
    } else {
      toast.error('Không có file CV');
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
  };

  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      const response = await fetch('/api/recruitment/update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status: newStatus
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Cập nhật trạng thái thành công');
        // Refresh applications list
        fetchApplications();
        fetchStats();
        // Update selected application if it's the one being updated
        if (selectedApplication && selectedApplication._id === applicationId) {
          setSelectedApplication({ ...selectedApplication, status: newStatus });
        }
      } else {
        toast.error(data.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const getUniqueJobTitles = () => {
    const titles = [...new Set(applications.map(app => app.jobTitle))];
    return titles;
  };

  if (status === 'loading') {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-gray-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-gray-600">Đang tải...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout title="Quản lý Ứng viên">
      <div className="p-4 bg-gray-50 dark:bg-slate-900 min-h-screen">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Quản lý Ứng viên
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quản lý danh sách ứng viên ứng tuyển
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Tổng số</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <Calendar className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Chờ xử lý</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Đang xem xét</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{stats.reviewing}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
                <Briefcase className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Đã chấp nhận</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{stats.accepted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/30">
                <X className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Đã từ chối</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 mb-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-2 flex-1 w-full md:w-auto">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="reviewing">Đang xem xét</option>
                <option value="accepted">Đã chấp nhận</option>
                <option value="rejected">Đã từ chối</option>
              </select>
              <select
                value={jobTitleFilter}
                onChange={(e) => setJobTitleFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Tất cả vị trí</option>
                {getUniqueJobTitles().map(title => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Ứng viên
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Vị trí
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Liên hệ
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Ngày ứng tuyển
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center">
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Đang tải...</span>
                      </div>
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <User className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Không có dữ liệu</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  applications.map((application) => (
                    <tr key={application._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {application.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {application.jobTitle}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {application.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {application.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          value={application.status}
                          onChange={(e) => handleUpdateStatus(application._id, e.target.value)}
                          className={`text-xs font-semibold rounded px-2 py-1 border-0 focus:ring-2 focus:ring-blue-500 ${
                            application.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : application.status === 'reviewing'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : application.status === 'accepted'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          <option value="pending">Chờ xử lý</option>
                          <option value="reviewing">Đang xem xét</option>
                          <option value="accepted">Đã chấp nhận</option>
                          <option value="rejected">Đã từ chối</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400">
                        {formatDate(application.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {application.cvFileName && (
                            <button
                              onClick={() => handleViewCV(application)}
                              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                              title="Xem CV"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleViewDetails(application)}
                            className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
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
            <div className="bg-gray-50 dark:bg-slate-700 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-slate-600">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-slate-600 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-2 relative inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-slate-600 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Hiển thị <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> đến{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * 10, totalItems)}
                    </span>{' '}
                    trong tổng số <span className="font-medium">{totalItems}</span> kết quả
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-1.5 rounded-l-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                      Trước
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-3 py-1.5 border text-xs font-medium ${
                            currentPage === page
                              ? 'z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400'
                              : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-1.5 rounded-r-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={() => setSelectedApplication(null)}>
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Chi tiết ứng viên</h2>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Họ và tên</label>
                    <p className="text-gray-900 dark:text-gray-100">{selectedApplication.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                    <p className="text-gray-900 dark:text-gray-100">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Số điện thoại</label>
                    <p className="text-gray-900 dark:text-gray-100">{selectedApplication.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Vị trí ứng tuyển</label>
                    <p className="text-gray-900 dark:text-gray-100">{selectedApplication.jobTitle}</p>
                  </div>
                  {selectedApplication.introduction && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Giới thiệu</label>
                      <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{selectedApplication.introduction}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Trạng thái</label>
                    <div className="mt-1">
                      <select
                        value={selectedApplication.status}
                        onChange={(e) => handleUpdateStatus(selectedApplication._id, e.target.value)}
                        className={`text-sm font-semibold rounded px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 w-full ${
                          selectedApplication.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : selectedApplication.status === 'reviewing'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : selectedApplication.status === 'accepted'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        <option value="pending">Chờ xử lý</option>
                        <option value="reviewing">Đang xem xét</option>
                        <option value="accepted">Đã chấp nhận</option>
                        <option value="rejected">Đã từ chối</option>
                      </select>
                    </div>
                  </div>
                  {selectedApplication.cvFileName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">CV/Portfolio</label>
                      <button
                        onClick={() => handleViewCV(selectedApplication)}
                        className="mt-1 flex items-center gap-2 text-blue-500 hover:text-blue-700 dark:text-blue-400"
                      >
                        <FileText className="w-4 h-4" />
                        {selectedApplication.cvFileName}
                      </button>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày ứng tuyển</label>
                    <p className="text-gray-900 dark:text-gray-100">{formatDate(selectedApplication.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default RecruitmentManagement;
