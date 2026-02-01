import { useRouter } from "next/router";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  CustomDataTable,
  Heading,
  OrderStats,
  OrderList,
} from "../../components/admin/dashboard";

import useAuth from "../../hooks/useAuth";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { user, status } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!user) {
      router.push("/dang-nhap");
      return;
    }

    if ((user as any)?.role !== "admin") {
      router.push("/");
      return;
    }

    setIsLoading(false);
  }, [user, status, router]);

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold">Đang tải Dashboard...</div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold">Vui lòng đăng nhập...</div>
      </div>
    );
  }

  // Not admin
  if ((user as any)?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-red-600">Bạn không có quyền truy cập trang này</div>
      </div>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <Heading title="Dashboard" />
      <div className="p-8 bg-white dark:bg-slate-900 min-h-screen overflow-x-hidden max-w-full">
        <OrderStats />
        <OrderList />
        <CustomDataTable />
      </div>
    </AdminLayout>
  );
}