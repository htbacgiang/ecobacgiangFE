/**
 * Script import sản phẩm từ file JSON vào backend (BE) qua API
 *
 * Cách dùng:
 * 1. Đảm bảo BE đang chạy (ecobacgiangBE)
 * 2. Set API_SERVER_URL trong .env (ví dụ: http://localhost:5000/api) hoặc NEXT_PUBLIC_API_SERVER_URL
 * 3. (Tùy chọn) Set token admin trong .env (API_ADMIN_TOKEN) nếu BE yêu cầu auth cho POST /products
 * 4. Chạy: node scripts/import-products.js
 */

const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const jsonFilePath = path.join(__dirname, '..', 'sample-products.json');
const apiBaseUrl =
  process.env.API_SERVER_URL ||
  process.env.NEXT_PUBLIC_API_SERVER_URL ||
  'http://localhost:5000/api';
const adminToken = process.env.API_ADMIN_TOKEN || process.env.TOKEN || '';

async function importProducts() {
  try {
    if (!fs.existsSync(jsonFilePath)) {
      console.error('❌ Không tìm thấy file:', jsonFilePath);
      process.exit(1);
    }

    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    const products = JSON.parse(jsonData);
    console.log(`📦 Đã đọc ${products.length} sản phẩm từ file JSON`);
    console.log(`🔗 Gọi BE: ${apiBaseUrl}/products\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    const headers = {
      'Content-Type': 'application/json',
      ...(adminToken && { Authorization: `Bearer ${adminToken}` }),
    };

    for (const productData of products) {
      try {
        const res = await fetch(`${apiBaseUrl}/products`, {
          method: 'POST',
          headers,
          body: JSON.stringify(productData),
        });

        const body = await res.json().catch(() => ({}));

        if (res.ok && (body.status === 'success' || body.product)) {
          successCount++;
          console.log(`✅ Đã import: ${productData.name}`);
        } else if (res.status === 400 && (body.err || body.error || '').includes('tồn tại')) {
          console.log(`⚠️  Sản phẩm "${productData.name}" đã tồn tại, bỏ qua...`);
        } else {
          errorCount++;
          const msg = body.err || body.error || body.message || res.statusText || res.status;
          errors.push({ product: productData.name, error: msg });
          console.error(`❌ Lỗi "${productData.name}":`, msg);
        }
      } catch (err) {
        errorCount++;
        errors.push({ product: productData.name, error: err.message });
        console.error(`❌ Lỗi khi import "${productData.name}":`, err.message);
      }
    }

    console.log('\n📊 Tổng kết:');
    console.log(`✅ Thành công: ${successCount} sản phẩm`);
    console.log(`❌ Lỗi: ${errorCount} sản phẩm`);

    if (errors.length > 0) {
      console.log('\n📝 Chi tiết lỗi:');
      errors.forEach((err, i) => console.log(`${i + 1}. ${err.product}: ${err.error}`));
    }
  } catch (error) {
    console.error('❌ Lỗi khi import:', error);
    process.exit(1);
  }

  process.exit(0);
}

importProducts();
