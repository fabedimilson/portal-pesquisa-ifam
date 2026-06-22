const fs = require('fs');
const path = require('path');

const pdf1 = fs.readFileSync(path.join(__dirname, 'pdf_raw_text.txt'), 'utf8');
const pdf2 = fs.readFileSync(path.join(__dirname, '29174_raw_text.txt'), 'utf8');

function findLinks(text, name) {
  const matches = text.match(/espelhogrupo\/\d+/g) || [];
  console.log(`Links in ${name}:`, Array.from(new Set(matches)));
}

findLinks(pdf1, 'consulta_cnpq grupos de pesquisa.pdf');
findLinks(pdf2, '29174.pdf');
