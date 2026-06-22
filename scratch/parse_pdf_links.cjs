const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'c:/Users/otran/Documents/Painel de Pesquisa_IFAM/uploads/consulta_cnpq grupos de pesquisa.pdf';
if (fs.existsSync(pdfPath)) {
  const dataBuffer = fs.readFileSync(pdfPath);
  pdf(dataBuffer).then(function(data) {
    console.log('PDF text length:', data.text.length);
    console.log('PDF metadata:', data.info);
    console.log('PDF preview:');
    console.log(data.text.slice(0, 2000));
  }).catch(err => {
    console.error('Error parsing PDF:', err);
  });
} else {
  console.log('PDF file does not exist');
}
