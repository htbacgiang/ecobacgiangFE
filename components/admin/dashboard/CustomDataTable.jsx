"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Edit2, X, Save, Trash2, MapPin } from "lucide-react";
import axios from "axios";

export default function CustomDataTable() {
  const PAGE_SIZE = 5; // Match API default limit
  const [currentPage, setCurrentPage] = useState(0); // API uses 0-based pageNo
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [users, setUsers] = useState([]); // State for API data
  const [total, setTotal] = useState(0); // Total number of users
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [editingUser, setEditingUser] = useState(null); // User being edited
  const [editFormData, setEditFormData] = useState({}); // Form data for editing
  const [editingAddress, setEditingAddress] = useState(null); // User whose address is being edited
  const [addressFormData, setAddressFormData] = useState({}); // Address form data
  const [dataAll, setDataAll] = useState([]); // Data tỉnh/TP, quận/huyện, phường/xã

  // Fetch user data from Server API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Chỉ dùng Server API
        const { userService } = await import('../../../lib/api-services');
        const data = await userService.getAll(currentPage, PAGE_SIZE);

        // Ensure users is an array
        if (!data || !Array.isArray(data.users)) {
          throw new Error("Invalid data format from API");
        }

        setUsers(data.users);
        setTotal(data.total || data.users.length); // Use total if available, else fallback
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage]); // Refetch when currentPage changes

  // Pagination calculations
  const numberOfPages = Math.ceil(total / PAGE_SIZE);
  const itemStartIndex = currentPage * PAGE_SIZE + 1;
  const itemEndIndex = Math.min((currentPage + 1) * PAGE_SIZE, total);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 0 && page < numberOfPages) {
      setCurrentPage(page);
    }
  };

  // Handle checkbox selection
  const handleSelectRow = (id) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(id)) {
      newSelectedRows.delete(id);
    } else {
      newSelectedRows.add(id);
    }
    setSelectedRows(newSelectedRows);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = users.map((item) => item.id);
      setSelectedRows(new Set(allIds));
    } else {
      setSelectedRows(new Set());
    }
  };

  // Handle edit
  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      gender: user.gender || '',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditFormData({});
  };

  const handleSaveEdit = async (userId) => {
    try {
      const { userService } = await import('../../../lib/api-services');
      
      // Prepare update data
      const updateData = {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        phone: editFormData.phone.trim(),
        ...(editFormData.gender && { gender: editFormData.gender }),
        ...(editFormData.dateOfBirth && { dateOfBirth: new Date(editFormData.dateOfBirth) })
      };

      await userService.update(userId, updateData);
      
      toast.success('Cập nhật thông tin khách hàng thành công');
      
      // Refresh data
      const data = await userService.getAll(currentPage, PAGE_SIZE);
      setUsers(data.users);
      setTotal(data.total || data.users.length);
      
      // Reset edit state
      setEditingUser(null);
      setEditFormData({});
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật');
    }
  };

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle delete user
  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa người dùng "${userName}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      const { userService } = await import('../../../lib/api-services');
      await userService.delete(userId);
      
      toast.success('Xóa người dùng thành công');
      
      // Refresh data
      const data = await userService.getAll(currentPage, PAGE_SIZE);
      setUsers(data.users);
      setTotal(data.total || data.users.length);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa người dùng');
    }
  };

  // Fetch data tỉnh/thành từ API
  const fetchAllData = async () => {
    try {
      const res = await axios.get("https://provinces.open-api.vn/api/?depth=3");
      const sorted = res.data.sort((a, b) => a.name.localeCompare(b.name));
      setDataAll(sorted);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải dữ liệu Tỉnh/Thành!");
    }
  };

  // Handle edit address
  const handleEditAddress = (user) => {
    const defaultAddress = user.address?.find((addr) => addr.isDefault) || user.address?.[0] || {};
    setEditingAddress(user.id);
    setAddressFormData({
      type: defaultAddress.type || 'home',
      fullName: defaultAddress.fullName || user.name || '',
      phoneNumber: defaultAddress.phoneNumber || user.phone || '',
      address1: defaultAddress.address1 || '',
      city: defaultAddress.city || '',
      cityName: defaultAddress.cityName || '',
      district: defaultAddress.district || '',
      districtName: defaultAddress.districtName || '',
      ward: defaultAddress.ward || '',
      wardName: defaultAddress.wardName || '',
      country: defaultAddress.country || 'Vietnam',
      isDefault: defaultAddress.isDefault !== undefined ? defaultAddress.isDefault : true
    });
    
    // Load data tỉnh/thành khi mở modal
    if (dataAll.length === 0) {
      fetchAllData();
    }
  };

  // Dropdown data dựa trên form addressFormData
  const selectedProvince = dataAll.find(
    (p) => p.code.toString() === addressFormData.city
  );
  const districts = selectedProvince
    ? selectedProvince.districts.sort((a, b) => a.name.localeCompare(b.name))
    : [];
  const selectedDistrict = districts.find(
    (d) => d.code.toString() === addressFormData.district
  );
  const wards = selectedDistrict
    ? selectedDistrict.wards.sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    const provinceObj = dataAll.find(
      (p) => p.code.toString() === provinceCode
    );
    handleAddressInputChange('city', provinceCode);
    handleAddressInputChange('cityName', provinceObj ? provinceObj.name : '');
    handleAddressInputChange('district', '');
    handleAddressInputChange('districtName', '');
    handleAddressInputChange('ward', '');
    handleAddressInputChange('wardName', '');
  };

  const handleDistrictChange = (e) => {
    const districtCode = e.target.value;
    const districtObj = selectedProvince?.districts.find(
      (d) => d.code.toString() === districtCode
    );
    handleAddressInputChange('district', districtCode);
    handleAddressInputChange('districtName', districtObj ? districtObj.name : '');
    handleAddressInputChange('ward', '');
    handleAddressInputChange('wardName', '');
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    const wardObj = wards.find(
      (w) => w.code.toString() === wardCode
    );
    handleAddressInputChange('ward', wardCode);
    handleAddressInputChange('wardName', wardObj ? wardObj.name : '');
  };

  const handleCancelAddressEdit = () => {
    setEditingAddress(null);
    setAddressFormData({});
  };

  const handleSaveAddress = async (userId) => {
    try {
      const { userService } = await import('../../../lib/api-services');
      
      // Get current user to update address array
      const currentUser = users.find(u => u.id === userId);
      if (!currentUser) {
        throw new Error('User not found');
      }

      // Prepare address update
      const addressIndex = currentUser.address?.findIndex((addr) => addr.isDefault) ?? 
                          (currentUser.address?.length > 0 ? 0 : -1);
      
      let updatedAddresses = [...(currentUser.address || [])];
      
      if (addressIndex >= 0) {
        // Update existing address
        updatedAddresses[addressIndex] = {
          ...updatedAddresses[addressIndex],
          ...addressFormData
        };
      } else {
        // Add new address
        updatedAddresses.push(addressFormData);
      }

      // Ensure only one default address
      updatedAddresses = updatedAddresses.map((addr, idx) => ({
        ...addr,
        isDefault: idx === (addressIndex >= 0 ? addressIndex : updatedAddresses.length - 1)
      }));

      await userService.update(userId, { address: updatedAddresses });
      
      toast.success('Cập nhật địa chỉ thành công');
      
      // Refresh data
      const data = await userService.getAll(currentPage, PAGE_SIZE);
      setUsers(data.users);
      setTotal(data.total || data.users.length);
      
      // Reset edit state
      setEditingAddress(null);
      setAddressFormData({});
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật địa chỉ');
    }
  };

  const handleAddressInputChange = (field, value) => {
    setAddressFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Get appropriate title based on age and gender
  const getTitle = (age, gender) => {
    if (!age) return 'Bạn';
    
    if (age < 18) {
      return 'Em';
    } else if (age < 30) {
      return gender === 'Nữ' ? 'Chị' : 'Anh';
    } else if (age < 50) {
      return gender === 'Nữ' ? 'Chị' : 'Anh';
    } else {
      return gender === 'Nữ' ? 'Cô' : 'Chú';
    }
  };

  // Render loading state
  if (loading) {
    return <div className="text-center p-4">Đang tải dữ liệu...</div>;
  }

  // Render error state
  if (error) {
    return <div className="text-center p-4 text-red-600">Lỗi: {error}</div>;
  }

  // Render empty state
  if (users.length === 0) {
    return <div className="text-center p-4">Không có dữ liệu người dùng</div>;
  }

  return (
    <div className="overflow-x-hidden max-w-full mt-5">
      <h3 className="mb-4 text-green-800 dark:text-slate-50 font-bold">
        Danh sách khách hàng của Eco Bắc Giang
      </h3>

      {/* Table */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-w-full table-responsive">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
            
              <th scope="col" className="px-6 py-3">
                STT
              </th>
              <th scope="col" className="px-6 py-3">
                Tên
              </th>
              <th scope="col" className="px-6 py-3">
                Email
              </th>
              <th scope="col" className="px-6 py-3">
                Số điện thoại
              </th>
            
              <th scope="col" className="px-6 py-3">
                Giới tính
              </th>
              <th scope="col" className="px-6 py-3">
                Tuổi
              </th>
              <th scope="col" className="px-6 py-3">
                Địa chỉ
              </th>
              <th scope="col" className="px-6 py-3">
                Thao tác
              </th>
           
            </tr>
          </thead>
          <tbody>
            {users.map((item, index) => (
              <tr
                key={item.id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
               
                <td className="px-6 py-4">{currentPage * PAGE_SIZE + index + 1}</td>
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {editingUser === item.id ? (
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  ) : (
                    item.name
                  )}
                </th>
                <td className="px-6 py-4">
                  {editingUser === item.id ? (
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  ) : (
                    item.email
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingUser === item.id ? (
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  ) : (
                    item.phone || "Chưa cung cấp"
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingUser === item.id ? (
                    <select
                      value={editFormData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  ) : (
                    item.gender || "Chưa cung cấp"
                  )}
                </td>
                <td className="px-6 py-4">
                  {(() => {
                    const age = calculateAge(item.dateOfBirth);
                    const title = getTitle(age, item.gender);
                    if (age) {
                      return (
                        <div className="text-sm">
                          <span className="font-medium">{age} tuổi</span>
                          <span className="text-gray-500 dark:text-gray-400 ml-1">({title})</span>
                        </div>
                      );
                    }
                    return <span className="text-gray-400">Chưa cập nhật</span>;
                  })()}
                </td>
                <td className="px-6 py-4">
                  {item.address && item.address.length > 0
                    ? (() => {
                        const addr = item.address.find((addr) => addr.isDefault) || item.address[0];
                        return `${addr.address1}, ${addr.wardName}, ${addr.districtName}, ${addr.cityName}`;
                      })()
                    : "Chưa cập nhật"}
                </td>
                <td className="px-6 py-4">
                  {editingUser === item.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        title="Lưu"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Hủy"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Sửa thông tin"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditAddress(item)}
                        className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                        title="Sửa địa chỉ"
                      >
                        <MapPin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(item.id, item.name)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
             
              </tr>
            ))}
          </tbody>
        </table>
        <nav
          className="flex items-center flex-column flex-wrap md:flex-row justify-between p-4"
          aria-label="Table navigation"
        >
          <span className="text-slate-800 dark:text-slate-50 text-sm font-normal mb-4 md:mb-0 block w-full md:inline md:w-auto">
            Hiện thị{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-50">
              {itemStartIndex}-{itemEndIndex}
            </span>{" "}
            của{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-50">
              {total}
            </span>
          </span>
          <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
            <li>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                Lùi
              </button>
            </li>
            {Array.from({ length: numberOfPages }, (_, index) => (
              <li key={index}>
                <button
                  onClick={() => handlePageChange(index)}
                  disabled={currentPage === index}
                  className={
                    currentPage === index
                      ? "flex items-center justify-center px-3 h-8 leading-tight text-gray-50 bg-blue-600 border border-blue-300 hover:bg-blue-800 hover:text-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      : "flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  }
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === numberOfPages - 1}
                className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                Tiếp
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Address Edit Modal */}
      {editingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" onClick={handleCancelAddressEdit}>
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Sửa địa chỉ</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Cập nhật thông tin địa chỉ giao hàng</p>
                </div>
              </div>
              <button
                onClick={handleCancelAddressEdit}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="space-y-5">
                {/* Loại địa chỉ - Buttons */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Loại địa chỉ</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleAddressInputChange('type', 'home')}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        addressFormData.type === 'home'
                          ? 'bg-pink-50 text-pink-600 border-pink-500 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600'
                      }`}
                    >
                      Nhà riêng
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddressInputChange('type', 'office')}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        addressFormData.type === 'office'
                          ? 'bg-blue-50 text-blue-600 border-blue-500 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600'
                      }`}
                    >
                      Văn phòng
                    </button>
                  </div>
                </div>

                {/* Họ tên và Số điện thoại */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressFormData.fullName}
                      onChange={(e) => handleAddressInputChange('fullName', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={addressFormData.phoneNumber}
                      onChange={(e) => handleAddressInputChange('phoneNumber', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>
                </div>

                {/* Địa chỉ chi tiết */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Địa chỉ chi tiết <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressFormData.address1}
                    onChange={(e) => handleAddressInputChange('address1', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="Số nhà, tên đường"
                    required
                  />
                </div>
                {/* Tỉnh/Thành, Quận/Huyện, Phường/Xã - Cùng 1 dòng */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tỉnh/Thành */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Tỉnh/Thành <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      value={addressFormData.city}
                      onChange={handleProvinceChange}
                      required
                    >
                      <option value="">Chọn Tỉnh/Thành</option>
                      {dataAll.map((prov) => (
                        <option key={prov.code} value={prov.code.toString()}>
                          {prov.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quận/Huyện */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-slate-800"
                      value={addressFormData.district}
                      onChange={handleDistrictChange}
                      required
                      disabled={!addressFormData.city || districts.length === 0}
                    >
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map((dist) => (
                        <option key={dist.code} value={dist.code.toString()}>
                          {dist.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Phường/Xã */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Phường/Xã <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-slate-800"
                      value={addressFormData.ward}
                      onChange={handleWardChange}
                      required
                      disabled={!addressFormData.district || wards.length === 0}
                    >
                      <option value="">Chọn Phường/Xã</option>
                      {wards.map((w) => (
                        <option key={w.code} value={w.code.toString()}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Checkbox mặc định */}
                <div className="flex items-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressFormData.isDefault}
                    onChange={(e) => handleAddressInputChange('isDefault', e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600"
                  />
                  <label htmlFor="isDefault" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={handleCancelAddressEdit}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveAddress(editingAddress)}
                    className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Lưu địa chỉ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}