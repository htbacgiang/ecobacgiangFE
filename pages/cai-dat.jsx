import React, { useState, useEffect, useMemo } from 'react';
import useAuth from '../hooks/useAuth';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Sidebar from '../components/admin/layout/Slidebar';
import { promoBannerService } from '../lib/api-services';
import {
  Settings,
  Store,
  Mail,
  CreditCard,
  Truck,
  Shield,
  Palette,
  Bell,
  Database,
  Save,
  X,
  Check,
  Image
} from 'lucide-react';

export default function CaiDat() {
  const { user, isAuthenticated, status } = useAuth();
  const session = useMemo(
    () => (isAuthenticated && user ? { user } : null),
    [isAuthenticated, user]
  );
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'EcoBacGiang',
    siteDescription: 'Thực phẩm sạch từ thiên nhiên',
    contactEmail: 'info@ecobacgiang.com',
    contactPhone: '0123456789',
    address: 'Bắc Giang, Việt Nam'
  });

  const [businessSettings, setBusinessSettings] = useState({
    businessHours: '8:00 - 20:00',
    deliveryRadius: '20',
    minOrderAmount: '100000',
    freeShippingThreshold: '500000'
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@ecobacgiang.com',
    fromName: 'EcoBacGiang'
  });

  const [paymentSettings, setPaymentSettings] = useState({
    enableMomo: true,
    enableSepay: true,
    enableCOD: true,
    momoPhone: '',
    momoName: '',
    sepayApiKey: 'API',
    sepaySecretKey: ''
  });

  const [shippingSettings, setShippingSettings] = useState({
    baseShippingCost: '30000',
    estimatedDeliveryDays: 'Trong ngày',
    enableTracking: true
  });

  const [promoBannerSettings, setPromoBannerSettings] = useState({
    countdownDate: "",
    subtitle: "",
    title: "",
    description: "",
    countdownLabel: "",
    buttonText: "",
    buttonLink: "",
    backgroundImage: "",
    isActive: true,
  });
  const [previewImage, setPreviewImage] = useState("");

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      const currentPath = router.asPath || router.pathname;
      router.push(`/dang-nhap?callbackUrl=${encodeURIComponent(currentPath)}`);
    }
  }, [session, status, router]);

  // Fetch promo banner config từ BE
  useEffect(() => {
    const fetchPromoBannerConfig = async () => {
      try {
        const data = await promoBannerService.get();
        const countdownDate = data.countdownDate
          ? new Date(data.countdownDate).toISOString().slice(0, 16)
          : "";

        setPromoBannerSettings({
          countdownDate,
          subtitle: data.subtitle || "",
          title: data.title || "",
          description: data.description || "",
          countdownLabel: data.countdownLabel || "",
          buttonText: data.buttonText || "",
          buttonLink: data.buttonLink || "",
          backgroundImage: data.backgroundImage || "",
          isActive: data.isActive !== undefined ? data.isActive : true,
        });
        setPreviewImage(data.backgroundImage || "");
      } catch (error) {
        console.error("Error fetching promo banner config:", error);
      }
    };

    fetchPromoBannerConfig();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSave = async (settingsType) => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (settingsType === 'Promo Banner') {
        await promoBannerService.update(promoBannerSettings);
        setMessage({
          type: 'success',
          text: `${settingsType} đã được lưu thành công!`
        });
      } else {
        // Simulate API call for other settings
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setMessage({ 
          type: 'success', 
          text: `${settingsType} đã được lưu thành công!` 
        });
      }
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Có lỗi xảy ra khi lưu cài đặt' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'Cài đặt chung', icon: Settings },
    { id: 'business', name: 'Kinh doanh', icon: Store },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'payment', name: 'Thanh toán', icon: CreditCard },
    { id: 'shipping', name: 'Vận chuyển', icon: Truck },
    { id: 'promo-banner', name: 'Promo Banner', icon: Image },
    { id: 'security', name: 'Bảo mật', icon: Shield }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên website
          </label>
          <input
            type="text"
            value={generalSettings.siteName}
            onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email liên hệ
          </label>
          <input
            type="email"
            value={generalSettings.contactEmail}
            onChange={(e) => setGeneralSettings({...generalSettings, contactEmail: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số điện thoại
          </label>
          <input
            type="tel"
            value={generalSettings.contactPhone}
            onChange={(e) => setGeneralSettings({...generalSettings, contactPhone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ
          </label>
          <input
            type="text"
            value={generalSettings.address}
            onChange={(e) => setGeneralSettings({...generalSettings, address: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mô tả website
        </label>
        <textarea
          value={generalSettings.siteDescription}
          onChange={(e) => setGeneralSettings({...generalSettings, siteDescription: e.target.value})}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
      <button
        onClick={() => handleSave('Cài đặt chung')}
        disabled={isLoading}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
        ) : (
          <Save size={20} className="mr-2" />
        )}
        Lưu cài đặt chung
      </button>
    </div>
  );

  const renderBusinessSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giờ làm việc
          </label>
          <input
            type="text"
            value={businessSettings.businessHours}
            onChange={(e) => setBusinessSettings({...businessSettings, businessHours: e.target.value})}
            placeholder="8:00 - 20:00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bán kính giao hàng (km)
          </label>
          <input
            type="number"
            value={businessSettings.deliveryRadius}
            onChange={(e) => setBusinessSettings({...businessSettings, deliveryRadius: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đơn hàng tối thiểu (VNĐ)
          </label>
          <input
            type="number"
            value={businessSettings.minOrderAmount}
            onChange={(e) => setBusinessSettings({...businessSettings, minOrderAmount: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Miễn phí vận chuyển từ (VNĐ)
          </label>
          <input
            type="number"
            value={businessSettings.freeShippingThreshold}
            onChange={(e) => setBusinessSettings({...businessSettings, freeShippingThreshold: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>
      <button
        onClick={() => handleSave('Cài đặt kinh doanh')}
        disabled={isLoading}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
        ) : (
          <Save size={20} className="mr-2" />
        )}
        Lưu cài đặt kinh doanh
      </button>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <CreditCard size={20} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-medium">Thanh toán khi nhận hàng (COD)</h3>
              <p className="text-sm text-gray-600">Khách hàng thanh toán khi nhận hàng</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={paymentSettings.enableCOD}
              onChange={(e) => setPaymentSettings({...paymentSettings, enableCOD: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-3">
              <CreditCard size={20} className="text-pink-600" />
            </div>
            <div>
              <h3 className="font-medium">Ví MoMo</h3>
              <p className="text-sm text-gray-600">Thanh toán qua ví MoMo</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={paymentSettings.enableMomo}
              onChange={(e) => setPaymentSettings({...paymentSettings, enableMomo: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <CreditCard size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">SePay</h3>
              <p className="text-sm text-gray-600">Thanh toán qua SePay</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={paymentSettings.enableSepay}
              onChange={(e) => setPaymentSettings({...paymentSettings, enableSepay: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>
      </div>

      {paymentSettings.enableMomo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-pink-50 rounded-lg border border-pink-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại MoMo
            </label>
            <input
              type="tel"
              value={paymentSettings.momoPhone}
              onChange={(e) => setPaymentSettings({...paymentSettings, momoPhone: e.target.value})}
              placeholder="0123456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên chủ tài khoản
            </label>
            <input
              type="text"
              value={paymentSettings.momoName}
              onChange={(e) => setPaymentSettings({...paymentSettings, momoName: e.target.value})}
              placeholder="NGUYEN VAN A"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {paymentSettings.enableSepay && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="text"
              value={paymentSettings.sepayApiKey}
              onChange={(e) => setPaymentSettings({...paymentSettings, sepayApiKey: e.target.value})}
              placeholder="sepay_api_key_here"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secret Key
            </label>
            <input
              type="password"
              value={paymentSettings.sepaySecretKey}
              onChange={(e) => setPaymentSettings({...paymentSettings, sepaySecretKey: e.target.value})}
              placeholder="sepay_secret_key_here"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      <button
        onClick={() => handleSave('Cài đặt thanh toán')}
        disabled={isLoading}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
        ) : (
          <Save size={20} className="mr-2" />
        )}
        Lưu cài đặt thanh toán
      </button>
    </div>
  );

  const renderShippingSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phí vận chuyển cơ bản (VNĐ)
          </label>
          <input
            type="number"
            value={shippingSettings.baseShippingCost}
            onChange={(e) => setShippingSettings({...shippingSettings, baseShippingCost: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thời gian giao hàng dự kiến (ngày)
          </label>
          <input
            type="text"
            value={shippingSettings.estimatedDeliveryDays}
            onChange={(e) => setShippingSettings({...shippingSettings, estimatedDeliveryDays: e.target.value})}
            placeholder="2-3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={shippingSettings.enableTracking}
              onChange={(e) => setShippingSettings({...shippingSettings, enableTracking: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
          <span className="ml-3 text-sm font-medium text-gray-700">
            Bật theo dõi đơn hàng
          </span>
        </div>
      </div>
      <button
        onClick={() => handleSave('Cài đặt vận chuyển')}
        disabled={isLoading}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
        ) : (
          <Save size={20} className="mr-2" />
        )}
        Lưu cài đặt vận chuyển
      </button>
    </div>
  );

  const renderPromoBannerSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày giờ kết thúc khuyến mãi
          </label>
          <input
            type="datetime-local"
            value={promoBannerSettings.countdownDate}
            onChange={(e) => setPromoBannerSettings({...promoBannerSettings, countdownDate: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phụ đề (Subtitle)
          </label>
          <input
            type="text"
            value={promoBannerSettings.subtitle}
            onChange={(e) => setPromoBannerSettings({...promoBannerSettings, subtitle: e.target.value})}
            placeholder="Khám phá Eco Bắc Giang"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề chính (Title)
          </label>
          <input
            type="text"
            value={promoBannerSettings.title}
            onChange={(e) => setPromoBannerSettings({...promoBannerSettings, title: e.target.value})}
            placeholder="Ưu đãi mua rau củ hữu cơ"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả (Description)
          </label>
          <textarea
            value={promoBannerSettings.description}
            onChange={(e) => setPromoBannerSettings({...promoBannerSettings, description: e.target.value})}
            rows={3}
            placeholder="Sản phẩm sạch – tươi ngon từ nông trại của chúng tôi"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nhãn countdown
          </label>
          <input
            type="text"
            value={promoBannerSettings.countdownLabel}
            onChange={(e) => setPromoBannerSettings({...promoBannerSettings, countdownLabel: e.target.value})}
            placeholder="Thời gian khuyến mãi còn lại"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text nút bấm
            </label>
            <input
              type="text"
              value={promoBannerSettings.buttonText}
              onChange={(e) => setPromoBannerSettings({...promoBannerSettings, buttonText: e.target.value})}
              placeholder="Mua ngay"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link nút bấm
            </label>
            <input
              type="text"
              value={promoBannerSettings.buttonLink}
              onChange={(e) => setPromoBannerSettings({...promoBannerSettings, buttonLink: e.target.value})}
              placeholder="# hoặc URL"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hình ảnh nền (URL hoặc đường dẫn)
          </label>
          <input
            type="text"
            value={promoBannerSettings.backgroundImage}
            onChange={(e) => {
              setPromoBannerSettings({...promoBannerSettings, backgroundImage: e.target.value});
              setPreviewImage(e.target.value);
            }}
            placeholder="/banner.png hoặc https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {previewImage && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <div
                className="w-full h-48 rounded-lg border border-gray-300 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('${previewImage}')` }}
              />
            </div>
          )}
        </div>

        <div className="flex items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={promoBannerSettings.isActive}
              onChange={(e) => setPromoBannerSettings({...promoBannerSettings, isActive: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
          <span className="ml-3 text-sm font-medium text-gray-700">
            Hiển thị banner
          </span>
        </div>
      </div>

      <button
        onClick={() => handleSave('Promo Banner')}
        disabled={isLoading}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
        ) : (
          <Save size={20} className="mr-2" />
        )}
        Lưu cài đặt Promo Banner
      </button>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'business':
        return renderBusinessSettings();
      case 'payment':
        return renderPaymentSettings();
      case 'shipping':
        return renderShippingSettings();
      case 'promo-banner':
        return renderPromoBannerSettings();
      default:
        return (
          <div className="text-center py-12">
            <Settings size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chức năng đang phát triển</h3>
            <p className="text-gray-600">Chúng tôi sẽ sớm cập nhật thêm các tính năng cài đặt khác.</p>
          </div>
        );
    }
  };

  return (
    <>
      <Head>
        <title>Cài đặt - EcoBacGiang</title>
        <meta name="description" content="Cài đặt hệ thống EcoBacGiang" />
      </Head>

      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 ml-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Cài đặt hệ thống</h1>
              <p className="mt-2 text-gray-600">
                Quản lý cài đặt website, thanh toán, vận chuyển và các thông số khác
              </p>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-lg flex items-center ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {message.type === 'success' ? (
                  <Check size={20} className="mr-2" />
                ) : (
                  <X size={20} className="mr-2" />
                )}
                {message.text}
              </div>
            )}

            <div className="bg-white rounded-lg shadow">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                          activeTab === tab.id
                            ? 'border-green-500 text-green-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon size={20} className="mr-2" />
                        {tab.name}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Content */}
              <div className="p-6">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
