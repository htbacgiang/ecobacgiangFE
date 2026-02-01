import React from 'react'
import AdminLayout from '../../../components/layout/AdminLayout';
import { CustomDataTable } from '../../../components/admin/dashboard';

export default function KhachHangPage() {
  return (
    <AdminLayout title="Danh sách khách hàng">
      <div className='p-2 bg-white dark:bg-slate-900 text-slate-50 min-h-screen'>
        {/* Recent Orders Table */}
        <CustomDataTable />
      </div>
    </AdminLayout>
  )
}
