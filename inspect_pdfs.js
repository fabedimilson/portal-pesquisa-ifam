import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfs = ['dados.pdf', 'banco.pdf', 'Protocolo.pdf', 'Relatório Edimilson.pdf'];

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
      const uint8Array = new Uint8Array(dataBuffer);
      const parser = new PDFParse(uint8Array);
      const result = await parser.getText();
      console.log(`Pages: ${result.total}`);
      console.log(`Snippet (first 400 chars):`);
      console.log(result.text.slice(0, 400).replace(/\s+/g, ' '));
    } catch (err) {
      console.error(`Error reading ${name}:`, err);
    }
  }
}

inspect();
