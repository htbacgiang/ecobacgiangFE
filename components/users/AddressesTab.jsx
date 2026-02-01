import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, MapPin, Phone, User, Home, Building } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import AddressMap from "./AddressMap";

export default function AddressesTab({ userId }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State cho form popup thêm/chỉnh sửa địa chỉ
  const [showForm, setShowForm] = useState(false);
  const [addressData, setAddressData] = useState({
    _id: "",
    fullName: "",
    phoneNumber: "",
    address1: "",
    city: "",
    cityName: "",
    district: "",
    districtName: "",
    ward: "",
    wardName: "",
    type: "home",
    isDefault: false,
  });
  
  // State lưu dữ liệu tỉnh/TP, quận/huyện, phường/xã
  const [dataAll, setDataAll] = useState([]);
  const [selectedProvinceDetails, setSelectedProvinceDetails] = useState(null);
  
  // State xác nhận xóa địa chỉ
  const [confirmDeleteAddressId, setConfirmDeleteAddressId] = useState(null);
  
  // State hiển thị bản đồ
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedAddressForMap, setSelectedAddressForMap] = useState(null);
  
  useEffect(() => {
    if (showForm && dataAll.length === 0) {
      fetchAllData();
    }
  }, [showForm, dataAll.length]);

  const fetchAllData = async () => {
    try {
      // Sử dụng API cũ với depth=3 để có đầy đủ dữ liệu
      const res = await axios.get("https://provinces.open-api.vn/api/?depth=3");
      const sorted = res.data.sort((a, b) => a.name.localeCompare(b.name));
      setDataAll(sorted);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải dữ liệu Tỉnh/Thành!");
    }
  };



  // Dropdown dữ liệu dựa trên form addressData
  const selectedProvince = dataAll.find(
    (p) => p.code.toString() === addressData.city
  );
  const districts = selectedProvince
    ? selectedProvince.districts.sort((a, b) => a.name.localeCompare(b.name))
    : [];
  const selectedDistrict = districts.find(
    (d) => d.code.toString() === addressData.district
  );
  const wards = selectedDistrict
    ? selectedDistrict.wards.sort((a, b) => a.name.localeCompare(b.name))
    : [];
  


  // Fetch danh sách địa chỉ của user
  const fetchAddresses = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Chỉ dùng Server API
      const { addressService } = await import("../../lib/api-services");
      const response = await addressService.getAll();
      setAddresses(response.addresses || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Lỗi lấy địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only fetch when userId changes; fetchAddresses recreated each render
  }, [userId]);

  const resetForm = () => {
    setAddressData({
      _id: "",
      fullName: "",
      phoneNumber: "",
      address1: "",
      city: "",
      cityName: "",
      district: "",
      districtName: "",
      ward: "",
      wardName: "",
      type: "home",
      isDefault: false,
    });
    setSelectedProvinceDetails(null);
  };

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    const provinceObj = dataAll.find(
      (p) => p.code.toString() === provinceCode
    );
    setAddressData({
      ...addressData,
      city: provinceCode,
      cityName: provinceObj ? provinceObj.name : "",
      district: "",
      districtName: "",
      ward: "",
      wardName: "",
    });
  };

  const handleDistrictChange = (e) => {
    const districtCode = e.target.value;
    const districtObj = selectedProvince?.districts.find(
      (d) => d.code.toString() === districtCode
    );
    setAddressData({
      ...addressData,
      district: districtCode,
      districtName: districtObj ? districtObj.name : "",
      ward: "",
      wardName: "",
    });
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    const wardObj = wards.find(
      (w) => w.code.toString() === wardCode
    );
    setAddressData({
      ...addressData,
      ward: wardCode,
      wardName: wardObj ? wardObj.name : "",
    });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { addressService } = await import("../../lib/api-services");
      
      if (addressData._id) {
        const payload = { ...addressData };
        // Chỉ dùng Server API
        const res = await addressService.updateById(addressData._id, payload);
        if (res && res._isWarning) throw new Error(res.message || "Có lỗi khi cập nhật địa chỉ");
        toast.success("Địa chỉ cập nhật thành công!");
      } else {
        const { _id, ...newAddress } = addressData;
        // Chỉ dùng Server API
        const res = await addressService.add(newAddress);
        if (res && res._isWarning) throw new Error(res.message || "Có lỗi khi thêm địa chỉ");
        toast.success("Địa chỉ thêm thành công!");
      }
      resetForm();
      setShowForm(false);
      fetchAddresses();
    } catch (error) {
      console.error("Error saving address:", error);
      const errorMessage = error.response?.data?.error || error.message || "Có lỗi khi lưu địa chỉ";
      toast.error(errorMessage);
    }
  };

  const handleEdit = (addr) => {
    setAddressData(addr);
    setShowForm(true);
  };

  // Khi bấm nút xóa, không xóa ngay mà lưu id cần xóa vào state confirmDeleteAddressId
  const onDeleteClick = (addrId) => {
    setConfirmDeleteAddressId(addrId);
  };

  // Xác nhận xóa: gọi API xóa địa chỉ, sau đó reset state confirmDeleteAddressId
  const confirmDelete = async () => {
    try {
      // Chỉ dùng Server API
      const { addressService } = await import("../../lib/api-services");
      const res = await addressService.removeById(confirmDeleteAddressId);
      if (res && res._isWarning) throw new Error(res.message || "Có lỗi khi xóa địa chỉ");
      toast.success("Đã xóa địa chỉ!");
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
      const errorMessage = error.response?.data?.error || error.message || "Có lỗi khi xóa địa chỉ";
      toast.error(errorMessage);
    } finally {
      setConfirmDeleteAddressId(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 ">
      <div className="flex flex-col  md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-4 mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-green-500 rounded-xl shadow-md">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Sổ địa chỉ</h2>
            <p className="text-gray-500 text-xs mt-0.5">Quản lý địa chỉ giao hàng của bạn</p>
          </div>
        </div>
        <button
          className="flex items-center justify-center w-full md:w-auto px-5 py-2.5 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm địa chỉ mới
        </button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-green-200 border-t-green-600"></div>
          <span className="ml-3 text-gray-600 font-medium text-sm">Đang tải địa chỉ...</span>
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid gap-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className="border border-gray-200 p-3 rounded-xl hover:shadow-lg transition-all duration-200 bg-white hover:bg-gray-50 group"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2.5 rounded-xl shadow-sm ${
                      addr.type === 'home' 
                        ? 'bg-blue-500' 
                        : 'bg-purple-500'
                    }`}>
                      {addr.type === 'home' ? (
                        <Home className="w-5 h-5 text-white" />
                      ) : (
                        <Building className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 ">
                        {addr.fullName}
                        {addr.isDefault && (
                      <span className="ml-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-500 text-white mt-2.5 shadow-sm">
                        <div className="w-1.5 h-1.5 bg-white rounded-full mr-1.5"></div>
                        Mặc định
                      </span>
                    )}
                      </h3>
                      <div className="flex items-center space-x-4 text-xs text-gray-600 mt-1.5">
                        <div className="flex items-center space-x-1.5 bg-gray-100 px-2.5 py-1 rounded-full">
                          <Phone className="w-3.5 h-3.5 text-green-600" />
                          <span className="font-medium">{addr.phoneNumber}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 bg-gray-100 px-2.5 py-1 rounded-full">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-medium">{addr.type === 'home' ? 'Nhà riêng' : 'Văn phòng'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-1">
                    <div 
                      className="bg-gray-50 p-3 rounded-lg border-l-3 border-green-500 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        setSelectedAddressForMap(addr);
                        setShowMapModal(true);
                      }}
                      title="Click để xem trên bản đồ"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-gray-700 leading-relaxed text-sm font-medium">
                          {addr.address1}, {addr.wardName}, {addr.districtName}, {addr.cityName}
                        </p>
                        <MapPin className="w-4 h-4 text-green-600 ml-2 flex-shrink-0" />
                      </div>
                    </div>
           
                  </div>
                </div>
                
                <div className="flex flex-row md:flex-col gap-2 md:gap-2 md:ml-4 ml-0 w-full md:w-auto">
                  <button
                    className="flex-1 md:flex-none flex items-center justify-center px-3.5 py-2 text-blue-600 text-xs font-semibold hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300"
                    onClick={() => handleEdit(addr)}
                  >
                    <Edit size={16} className="mr-1.5" />
                    Sửa
                  </button>
                  <button
                    className="flex-1 md:flex-none flex items-center justify-center px-3.5 py-2 text-red-600 text-xs font-semibold hover:bg-red-50 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
                    onClick={() => onDeleteClick(addr._id)}
                  >
                    <Trash2 size={16} className="mr-1.5" />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="p-5 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1.5">Chưa có địa chỉ nào</h3>
          <p className="text-gray-500 text-sm mb-5">Hãy thêm địa chỉ đầu tiên của bạn</p>
          <button
            className="inline-flex items-center px-5 py-2.5 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm địa chỉ đầu tiên
          </button>
        </div>
      )}

      {showForm && (
        <div className="mt-6 p-6 border border-gray-200 rounded-xl bg-gray-50 shadow-md">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 bg-green-500 rounded-xl shadow-sm">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {addressData._id ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
              </h3>
              <p className="text-gray-500 text-xs mt-0.5">Điền thông tin địa chỉ giao hàng</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={addressData.fullName}
                  onChange={(e) =>
                    setAddressData({ ...addressData, fullName: e.target.value })
                  }
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white text-base"
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="text"
                  value={addressData.phoneNumber}
                  onChange={(e) =>
                    setAddressData({ ...addressData, phoneNumber: e.target.value })
                  }
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white text-base"
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Địa chỉ chi tiết *
              </label>
              <input
                type="text"
                value={addressData.address1}
                onChange={(e) =>
                  setAddressData({ ...addressData, address1: e.target.value })
                }
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white text-base"
                placeholder="Số nhà, tên đường"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tỉnh/Thành *
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white text-base"
                value={addressData.city}
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
            
            {addressData.city && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quận/Huyện *
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed text-base"
                  value={addressData.district}
                  onChange={handleDistrictChange}
                  required
                  disabled={!addressData.city || districts.length === 0}
                >
                  <option value="">Chọn Quận/Huyện</option>
                  {districts.map((dist) => (
                    <option key={dist.code} value={dist.code.toString()}>
                      {dist.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {addressData.district && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phường/Xã *
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed text-base"
                  value={addressData.ward}
                  onChange={handleWardChange}
                  required
                  disabled={!addressData.district || wards.length === 0}
                >
                  <option value="">Chọn Phường/Xã</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.code.toString()}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Loại địa chỉ
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  className={`flex-1 px-4 py-3 rounded-lg border-2 text-base font-medium transition-all duration-200 ${
                    addressData.type === "home"
                      ? "bg-pink-50 text-pink-600 border-pink-500"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() =>
                    setAddressData({ ...addressData, type: "home" })
                  }
                >
                  Nhà riêng
                </button>
                <button
                  type="button"
                  className={`flex-1 px-4 py-3 rounded-lg border-2 text-base font-medium transition-all duration-200 ${
                    addressData.type === "office"
                      ? "bg-blue-50 text-blue-600 border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() =>
                    setAddressData({ ...addressData, type: "office" })
                  }
                >
                  Văn phòng
                </button>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-6 w-6 text-green-600 rounded border-2 border-gray-300 focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                checked={addressData.isDefault}
                onChange={(e) =>
                  setAddressData({
                    ...addressData,
                    isDefault: e.target.checked,
                  })
                }
              />
              <label className="ml-3 text-gray-700 font-medium text-base">
                Đặt làm địa chỉ mặc định
              </label>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-200 text-base"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all duration-200 text-base"
              >
                {addressData._id ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Modal xác nhận xóa */}
      {confirmDeleteAddressId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-5 rounded-xl shadow-lg text-center w-80">
            <h3 className="text-base font-bold text-gray-800 mb-2">Xác nhận xóa</h3>
            <p className="text-gray-600 text-sm mb-5">Bạn có chắc chắn muốn xóa địa chỉ này?</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setConfirmDeleteAddressId(null)}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium text-sm shadow-md"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal hiển thị bản đồ */}
      {showMapModal && selectedAddressForMap && (
        <AddressMap
          address={selectedAddressForMap}
          showModal={true}
          onClose={() => {
            setShowMapModal(false);
            setSelectedAddressForMap(null);
          }}
          height="500px"
        />
      )}
    </div>
  );
}
