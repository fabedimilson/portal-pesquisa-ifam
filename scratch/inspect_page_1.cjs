const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'pdf_raw_text.txt'), 'utf8');
const pages = content.split(/-- \d+ of \d+ --/);

console.log(`Total pages split: ${pages.length}`);
console.log('--- Page 1 text ---');
const page1Lines = pages[0].split('\n').map(l => l.trim()).filter(l => l.length > 0);
page1Lines.forEach((l, idx) => {
  console.log(`${idx + 1}: ${l}`);
});
