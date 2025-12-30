// Script để test callback thật từ SEPAY
// Chạy lệnh: node test-sepay-real-callback.js

const axios = require('axios');

// Dữ liệu callback thật từ SEPAY mà bạn vừa nhận
const realCallbackData = {
  gateway: 'TPBank',
  transactionDate: '2025-08-28 03:05:47',
  accountNumber: '03924302701',
  subAccount: null,
  code: null,
  content: 'NGO QUANG TRUONG chuyen tien',
  transferType: 'out',
  description: 'BankAPINotify NGO QUANG TRUONG chuyen tien',
  transferAmount: 31000,
  referenceCode: '666V009252401326',
  accumulated: 443,
  id: 21571529
};

// Thông tin ngrok của bạn
const NGROK_URL = 'https://8bc966d6b66a.ngrok-free.app'; // URL thật của bạn

async function testRealCallback() {
  try {
    console.log('🚀 Testing Real SEPAY Callback...');
    console.log('URL:', `${NGROK_URL}/api/sepay-webhook-real`);
    console.log('Data:', JSON.stringify(realCallbackData, null, 2));

    const response = await axios.post(`${NGROK_URL}/api/sepay-webhook-real`, realCallbackData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Apikey HFWCAFTYVVLYT2Q1QSUIRKUIBVGHIDREJO8GH09CM4SEXJPQBKCX6KLMX5SMBVNF',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });

    console.log('✅ Callback Response:', response.data);
    console.log('📊 Status Code:', response.status);

  } catch (error) {
    console.error('❌ Callback test failed:', error.response?.data || error.message);

    if (error.response) {
      console.log('📊 Error Status:', error.response.status);
      console.log('📊 Error Data:', error.response.data);
    }
  }
}

// Chạy test
testRealCallback();

// Hoặc test với dữ liệu tùy chỉnh
if (process.argv.length > 2) {
  const customAmount = parseInt(process.argv[2]);
  if (customAmount) {
    realCallbackData.transferAmount = customAmount;
    realCallbackData.referenceCode = 'TEST-' + Date.now();
    console.log(`🧪 Testing with custom amount: ${customAmount}`);
    testRealCallback();
  }
}
