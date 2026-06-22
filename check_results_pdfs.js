import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfs = [
  'Resultado_final_IC-Graduação_2026_2027.pdf',
  'Resultado_Parcial_-_PIBIC-AC_2026-2027-4.pdf'
];

async function inspect() {
  for (const name of pdfs) {
    const filePath = path.join(__dirname, name);
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${name}`);
      continue;
    }
    console.log(`\n--- Inspecting ${name} ---`);
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const uint8Array = new Uint8Array(dataBuffer);
      const parser = new PDFParse(uint8Array);
      const result = await parser.getText();
      console.log(`Pages: ${result.total}`);
      console.log(`Total Text Length: ${result.text.length}`);
      console.log(`Snippet (first 800 chars):`);
      console.log(result.text.slice(0, 800));
    } catch (err) {
      console.error(`Error reading ${name}:`, err);
    }
  }
}

inspect();
