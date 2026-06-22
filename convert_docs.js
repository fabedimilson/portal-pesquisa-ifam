const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const files = [
  'Especificação Técnica de Requisitos - Plataforma Painel de Pesquisa IFAM.docx',
  'Transcrição Bruta do Chat - Painel de Pesquisa IFAM.docx',
  'Transcrição do Brainstorming_ Painel de Pesquisa IFAM.docx'
];

async function convert() {
  for (const file of files) {
    const docPath = path.join(__dirname, file);
    if (!fs.existsSync(docPath)) {
      console.log(`File not found: ${file}`);
      continue;
    }
    const mdPath = docPath.replace('.docx', '.md');
    console.log(`Converting ${file} to ${mdPath}...`);
    try {
      const result = await mammoth.convertToMarkdown({ path: docPath });
      fs.writeFileSync(mdPath, result.value, 'utf8');
      console.log(`Successfully converted ${file}`);
    } catch (err) {
      console.error(`Error converting ${file}:`, err);
    }
  }
}

convert();
