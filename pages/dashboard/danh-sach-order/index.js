import React from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import OrderList from '../../../components/ecobacgiang/OrderList';
import OrderStats from '../../../components/ecobacgiang/OrderStats';
import TopProducts from '../../../components/ecobacgiang/TopProducts';
import TopCustomers from '../../../components/ecobacgiang/TopCustomers';

function OrdersPage() {
  return (
    <AdminLayout title="Danh sách đơn hàng">  
      <div className="orders-page-container">

        {/* Main Content - Vertical Layout */}
        <div className="orders-main-content">
          {/* Order Stats Section */}
          <div className="orders-section">
            <OrderStats />
          </div>

          {/* Top Products Section */}
          <div className="orders-section">
            <div className="orders-section-title">
              Sản phẩm bán chạy
            </div>
            <TopProducts />
          </div>

          {/* Order List Section */}
          <div className="orders-section">
            <div className="orders-section-title">
              Danh sách đơn hàng
            </div>
            <OrderList />
          </div>

          {/* Top Customers Section */}
          <div className="orders-section">
            <div className="orders-section-title">
               Khách hàng tiềm năng
            </div>
            <TopCustomers />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default OrdersPage;