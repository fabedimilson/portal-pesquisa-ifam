const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const pdfs = ['1.pdf', '2.pdf', '3.pdf', '4.pdf', '5.pdf', '6.pdf'];

async function inspect() {
  for (const name of pdfs) {
    const filePath = path.join(__dirname, '..', name);
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${name}`);
      continue;
    }
    console.log(`\n--- Inspecting ${name} ---`);
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      console.log(`Pages: ${data.numpages}`);
      console.log(`Snippet (first 400 chars):`);
      console.log(data.text.slice(0, 400).replace(/\s+/g, ' '));
    } catch (err) {
      console.error(`Error reading ${name}:`, err);
    }
  }
}

inspect();
