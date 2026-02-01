import React from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { InternalAccounting } from '../../../components/admin/dashboard';

/**
 * Internal Accounting Page - Module Kế toán Nội bộ
 * This page provides internal accounting management for Eco Bắc Giang
 */
export default function InternalAccountingPage() {
  return (
    <AdminLayout title="Kế toán Nội bộ - Internal Accounting">
      <div className="p-4 bg-gray-50 dark:bg-slate-900 min-h-screen">
        <InternalAccounting />
      </div>
    </AdminLayout>
  );
}
