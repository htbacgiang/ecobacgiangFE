import React, { useState, useEffect } from "react";
import { MapPin, X, ExternalLink } from "lucide-react";

/**
 * Component hiển thị bản đồ dựa trên địa chỉ của khách hàng
 * @param {Object} address - Đối tượng địa chỉ với các trường: address1, wardName, districtName, cityName
 * @param {Boolean} showModal - Hiển thị dưới dạng modal
 * @param {Function} onClose - Hàm đóng modal
 * @param {String} height - Chiều cao của bản đồ (mặc định: "400px")
 */
export default function AddressMap({ address, showModal = false, onClose, height = "400px" }) {
  const [mapUrl, setMapUrl] = useState("");
  const [fullAddress, setFullAddress] = useState("");

  useEffect(() => {
    if (address) {
      // Tạo địa chỉ đầy đủ từ các trường
      const addressParts = [];
      
      if (address.address1) addressParts.push(address.address1);
      if (address.wardName) addressParts.push(address.wardName);
      if (address.districtName) addressParts.push(address.districtName);
      if (address.cityName) addressParts.push(address.cityName);
      if (address.country) addressParts.push(address.country);
      
      const fullAddr = addressParts.join(", ");
      setFullAddress(fullAddr);

      // Tạo URL cho Google Maps Embed
      // Sử dụng Google Maps search với output=embed (không cần API key)
      const encodedAddress = encodeURIComponent(fullAddr);
      const finalUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;
      setMapUrl(finalUrl);
    }
  }, [address]);

  if (!address) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-100 rounded-lg">
        <p className="text-gray-500">Không có địa chỉ để hiển thị</p>
      </div>
    );
  }

  const mapContent = (
    <div className="w-full">
      {/* Địa chỉ hiển thị */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start space-x-2">
          <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800 mb-1">Địa chỉ:</p>
            <p className="text-sm text-gray-700 leading-relaxed">{fullAddress}</p>
          </div>
        </div>
      </div>

      {/* Bản đồ */}
      <div className="relative w-full rounded-lg overflow-hidden border border-gray-300 shadow-md" style={{ height }}>
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        />
        
        {/* Nút mở Google Maps trong tab mới */}
        <div className="absolute bottom-4 right-4">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <ExternalLink className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Mở Google Maps</span>
          </a>
        </div>
      </div>
    </div>
  );

  if (showModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Xem vị trí trên bản đồ</h3>
                <p className="text-xs text-gray-500 mt-0.5">Địa chỉ giao hàng</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {mapContent}
          </div>
        </div>
      </div>
    );
  }

  return mapContent;
}
