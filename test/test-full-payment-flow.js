// Script để test toàn bộ payment flow
// Chạy lệnh: node test/test-full-payment-flow.js

const axios = require('axios');

// Thông tin server
const BASE_URL = 'http://localhost:3000';
// THAY ĐỔI URL NÀY BẰNG NGROK URL THỰC CỦA BẠN!
// Ví dụ: https://a1b2c3d4.ngrok.io
const NGROK_URL = 'https://8bc966d6b66a.ngrok-free.app'; // <-- THAY ĐỔI NGAY ĐÂY

async function testPaymentFlow() {
  console.log('🚀 Testing Full Payment Flow...\n');

  try {
    // Bước 1: Tạo thanh toán
    console.log('1️⃣  Tạo thanh toán SEPAY...');
    const createPaymentResponse = await axios.post(`${BASE_URL}/api/create-sepay-payment`, {
      amount: 100000,
      userId: 'test-user-123'
    });

    if (!createPaymentResponse.data.success) {
      throw new Error('Không thể tạo thanh toán');
    }

    const paymentCode = createPaymentResponse.data.paymentCode;
    console.log('✅ Payment created:', paymentCode);

    // Bước 2: Kiểm tra status ban đầu
    console.log('\n2️⃣  Kiểm tra status ban đầu...');
    const initialStatusResponse = await axios.get(`${BASE_URL}/api/check-sepay-status?paymentCode=${paymentCode}&timestamp=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    console.log('📊 Initial Status:', initialStatusResponse.data.payment.status);

    // Bước 3: Mô phỏng callback từ SEPAY
    console.log('\n3️⃣  Mô phỏng callback thanh toán thành công...');
    const callbackResponse = await axios.post(`${NGROK_URL}/api/sepay-webhook-real`, {
      gateway: 'TPBank',
      transactionDate: new Date().toISOString(),
      accountNumber: '03924302701',
      transferType: 'in',
      transferAmount: 100000,
      referenceCode: paymentCode,
      description: 'Test payment callback'
    });

    console.log('📊 Callback Response:', callbackResponse.data);

    // Bước 4: Kiểm tra status sau callback
    console.log('\n4️⃣  Kiểm tra status sau callback...');
    // Chờ một chút để callback được xử lý
    await new Promise(resolve => setTimeout(resolve, 2000));

    const finalStatusResponse = await axios.get(`${BASE_URL}/api/check-sepay-status?paymentCode=${paymentCode}&timestamp=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    console.log('📊 Final Status:', finalStatusResponse.data.payment.status);

    // Bước 5: Kết luận
    console.log('\n🎉 Kết quả:');
    if (finalStatusResponse.data.payment.status === 'paid') {
      console.log('✅ Payment flow hoạt động hoàn hảo!');
      console.log('✅ Status chuyển từ pending → paid');
      console.log('✅ Callback được xử lý thành công');
      console.log('✅ API check-sepay-status hoạt động đúng');
    } else {
      console.log('❌ Payment flow có vấn đề');
      console.log('❌ Status chưa chuyển sang paid');
      console.log('💡 Kiểm tra logs của server để debug');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Hướng dẫn khắc phục:');
      console.log('1. Chạy server: npm run dev');
      console.log('2. Chạy ngrok: ngrok http 3000');
      console.log('3. Cập nhật NGROK_URL trong script này');
      console.log('4. Đảm bảo webhook endpoint accessible từ internet');
    }
  }
}

// Chạy test
testPaymentFlow();

// Hoặc test với payment code cụ thể từ command line
if (process.argv.length > 2) {
  const customPaymentCode = process.argv[2];
  console.log(`🧪 Testing with specific payment code: ${customPaymentCode}`);

  // Chỉ test callback và status check
  testCallbackAndStatus(customPaymentCode);
}

async function testCallbackAndStatus(paymentCode) {
  try {
    // Test callback
    console.log('\n📤 Sending callback...');
    const callbackResponse = await axios.post(`${NGROK_URL}/api/sepay-webhook-real`, {
      gateway: 'TPBank',
      transactionDate: new Date().toISOString(),
      accountNumber: '03924302701',
      transferType: 'in',
      transferAmount: 100000,
      referenceCode: paymentCode,
      description: 'Test callback'
    });
    console.log('Callback result:', callbackResponse.data);

    // Chờ xử lý
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test status check
    console.log('\n📊 Checking status...');
    const statusResponse = await axios.get(`${BASE_URL}/api/check-sepay-status?paymentCode=${paymentCode}&timestamp=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    console.log('Status result:', statusResponse.data);

  } catch (error) {
    console.error('❌ Callback/Status test failed:', error.response?.data || error.message);
  }
}