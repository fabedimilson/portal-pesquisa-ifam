const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function testPdf() {
  const pdfPath = path.join(__dirname, '../uploads/consulta_cnpq grupos de pesquisa.pdf');
  const dataBuffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: dataBuffer });
  const data = await parser.getText({});
  console.log('Metadata:', data.metadata);
  console.log('Number of pages:', data.numpages || 'unknown');
  console.log('Text length:', data.text ? data.text.length : 0);
  
  // Let's write the text again but check for page separation or truncated errors
  fs.writeFileSync(path.join(__dirname, 'pdf_raw_text_full.txt'), data.text);
}

testPdf();
