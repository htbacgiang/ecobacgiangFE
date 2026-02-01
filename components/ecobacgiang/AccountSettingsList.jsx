import React from "react";
import {
  User as UserIcon,
  Bell,
  ShoppingBag,
  MapPin,
  CreditCard,
  Lock,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function AccountSettingsList({ selectedTab, handleTabClick, onSignOut }) {
  // Đồng bộ tab IDs/labels với `components/users/UserSidebar.jsx`
  const menuItems = [
    {
      id: "account",
      title: "Thông tin tài khoản",
      subtitle: "Cập nhật thông tin cá nhân",
      icon: UserIcon,
    },
    {
      id: "notifications",
      title: "Thông báo của tôi",
      subtitle: "Quản lý thông báo hệ thống",
      icon: Bell,
    },
    {
      id: "orders",
      title: "Quản lý đơn hàng",
      subtitle: "Theo dõi và quản lý đơn hàng",
      icon: ShoppingBag,
    },
    {
      id: "addresses",
      title: "Sổ địa chỉ",
      subtitle: "Quản lý địa chỉ giao hàng",
      icon: MapPin,
    },
    {
      id: "payment",
      title: "Thông tin thanh toán",
      subtitle: "Quản lý phương thức thanh toán",
      icon: CreditCard,
    },
    {
      id: "change-password",
      title: "Đổi mật khẩu",
      subtitle: "Cập nhật bảo mật tài khoản",
      icon: Lock,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mx-4 mt-4">
      <div className="bg-gradient-to-br from-slate-50 to-slate-200 px-6 py-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Quản lý tài khoản</h2>
      </div>

      <div className="p-4 space-y-3">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = selectedTab === item.id;

          return (
            <div
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`group flex items-center justify-between p-4 cursor-pointer transition-all duration-200 rounded-2xl border-2 ${
                isActive
                  ? "bg-green-100 border-green-300 shadow-md"
                  : "bg-white border-green-200 hover:bg-green-50 hover:border-green-300"
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0 border border-green-100">
                  <IconComponent className="w-6 h-6 text-green-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">{item.title}</div>
                  <div className="text-sm text-slate-600 truncate">{item.subtitle}</div>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0" />
            </div>
          );
        })}

        <div className="pt-2">
          <div
            onClick={onSignOut}
            className="flex items-center justify-between p-4 cursor-pointer transition-colors rounded-2xl border-2 border-red-200 hover:bg-red-50"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0 border border-red-200">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-red-600 truncate">Đăng xuất</div>
                <div className="text-sm text-red-500 truncate">Thoát khỏi tài khoản</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-red-400 flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}