const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function extractText() {
  const pdfPath = path.join(__dirname, '../uploads/consulta_cnpq grupos de pesquisa.pdf');
  console.log(`Extracting: ${pdfPath}`);
  const dataBuffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: dataBuffer });
  const data = await parser.getText({});
  fs.writeFileSync(path.join(__dirname, 'pdf_raw_text.txt'), data.text);
  console.log('Done! Written to scratch/pdf_raw_text.txt');
}

extractText();
