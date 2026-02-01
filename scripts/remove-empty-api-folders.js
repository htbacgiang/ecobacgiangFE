const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..', 'pages', 'api');
const foldersToRemove = [
  'address', 'admin', 'analyze', 'banks', 'cart', 'check-sepay-status',
  'checkout', 'coupon', 'create-momo-payment', 'create-sepay-payment',
  'create-sepay-payment-simple', 'debug-payments', 'favorites', 'image',
  'momo-callback', 'orders', 'payment', 'posts', 'products',
  'refresh-sepay-qr', 'results', 'sepay-callback', 'sepay-webhook-real',
  'socket', 'submit', 'subscription', 'test-sepay-callback', 'user', 'wishlist'
];

foldersToRemove.forEach((name) => {
  const dir = path.join(base, name);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true });
    console.log('Removed:', dir);
  }
});
console.log('Done. Kept: auth, promo-banner, recruitment');
