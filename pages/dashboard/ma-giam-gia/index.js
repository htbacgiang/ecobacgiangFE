import React from 'react'
import AdminLayout from '../../../components/layout/AdminLayout'
import CouponForm from '../../../components/coupon/CouponForm'

export default function index() {
  return (
    <AdminLayout title="Quản lý mã giảm giá">
      <div className='p-4 bg-gray-50 dark:bg-slate-900 min-h-screen'>
        <CouponForm />
      </div>
    </AdminLayout>
  )
}
