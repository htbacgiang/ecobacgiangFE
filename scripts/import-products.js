/**
 * Script để import sản phẩm từ file JSON vào MongoDB
 * 
 * Cách sử dụng:
 * 1. Đảm bảo MongoDB đang chạy
 * 2. Cập nhật MONGODB_URI trong file .env hoặc trong script này
 * 3. Chạy: node scripts/import-products.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../server/models/Product');
const db = require('../server/config/database');

// Đường dẫn đến file JSON
const jsonFilePath = path.join(__dirname, '..', 'sample-products.json');

async function importProducts() {
  try {
    // Kết nối database
    await db.connectDb();
    console.log('✅ Đã kết nối database thành công');

    // Đọc file JSON
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    const products = JSON.parse(jsonData);
    console.log(`📦 Đã đọc ${products.length} sản phẩm từ file JSON`);

    // Import từng sản phẩm
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const productData of products) {
      try {
        // Kiểm tra xem sản phẩm đã tồn tại chưa (theo maSanPham hoặc slug)
        const existingProduct = await Product.findOne({
          $or: [
            { maSanPham: productData.maSanPham },
            { slug: productData.slug }
          ]
        });

        if (existingProduct) {
          console.log(`⚠️  Sản phẩm "${productData.name}" đã tồn tại (maSanPham: ${productData.maSanPham}), bỏ qua...`);
          continue;
        }

        // Tạo sản phẩm mới
        const product = new Product(productData);
        await product.save();
        successCount++;
        console.log(`✅ Đã import: ${productData.name}`);
      } catch (error) {
        errorCount++;
        const errorMsg = `❌ Lỗi khi import "${productData.name}": ${error.message}`;
        console.error(errorMsg);
        errors.push({ product: productData.name, error: error.message });
      }
    }

    // Tổng kết
    console.log('\n📊 Tổng kết:');
    console.log(`✅ Thành công: ${successCount} sản phẩm`);
    console.log(`❌ Lỗi: ${errorCount} sản phẩm`);
    
    if (errors.length > 0) {
      console.log('\n📝 Chi tiết lỗi:');
      errors.forEach((err, index) => {
        console.log(`${index + 1}. ${err.product}: ${err.error}`);
      });
    }

  } catch (error) {
    console.error('❌ Lỗi khi import:', error);
  } finally {
    // Đóng kết nối database
    try {
      await db.disconnectDb();
      console.log('\n✅ Đã đóng kết nối database');
    } catch (disconnectError) {
      console.error('⚠️  Lỗi khi đóng kết nối:', disconnectError.message);
    }
    process.exit(0);
  }
}

// Chạy script
importProducts();

