/**
 * Script để xóa tất cả fallback về Next.js API
 * Chạy: node remove-fallback.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Tìm tất cả các file có fallback...\n');

// Tìm các file có fallback
const files = execSync('grep -r "Fallback về Next.js API" components/ pages/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" -l', { encoding: 'utf-8' })
  .trim()
  .split('\n')
  .filter(f => f);

console.log(`Tìm thấy ${files.length} file có fallback:\n`);
files.forEach(f => console.log(`  - ${f}`));

console.log('\n⚠️  Cần xóa fallback thủ công trong các file trên.');
console.log('📋 Xem hướng dẫn trong REMOVE_NEXTJS_API.md');

