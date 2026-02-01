const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..', 'components');
// Cac thu muc co the trong (da xoa het file component ben trong)
const foldersToRemove = ['button'];

foldersToRemove.forEach((name) => {
  const dir = path.join(base, name);
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    if (files.length === 0) {
      fs.rmSync(dir, { recursive: true });
      console.log('Removed empty folder:', dir);
    } else {
      console.log('Skip (not empty):', dir);
    }
  }
});
console.log('Done.');
