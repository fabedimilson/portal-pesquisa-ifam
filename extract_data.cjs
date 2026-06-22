const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const workbook = XLSX.readFile('Controle Bolsas por campus AC.xlsx');
const allProjects = [];

function sanitizeDiscente(name) {
  if (!name) return null;
  const clean = String(name).trim().toUpperCase();
  const invalidNames = [
    'NAO', 'NÃO', 'NÃO SE APLICA', 'NÃO SE APLICA (DESCLASSIFICADO)', 
    'NÃO HÁ', 'DESCLASSIFICADO', 'REPROVADO', 'REPROVADA', 'PENDENTE', 
    '-', 'OK', 'SIM', 'N/A', 'NÃO HOUVE', 'NÃO INDIQUEI', 'NÃO HOUVE INDICAÇÃO'
  ];
  if (invalidNames.includes(clean) || clean.length <= 3) {
    return null;
  }
  return String(name).trim();
}

for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet);
  
  rows.forEach((row, index) => {
    const normalizedRow = {};
    for (const key of Object.keys(row)) {
      normalizedRow[key.trim().toUpperCase()] = row[key];
    }
    
    const codigo = normalizedRow['CÓDIGO'] || normalizedRow['CODIGO'];
    const campus = normalizedRow['CAMPUS'] || sheetName;
    const titulo = normalizedRow['TÍTULO'] || normalizedRow['TITULO'];
    const orientador = normalizedRow['COORDENADOR'] || normalizedRow['ORIENTADOR'];
    const fomento = normalizedRow['FINANCIAMENTO'] || normalizedRow['FOMENTO'];
    const discenteRaw = normalizedRow['INDICAÇÃO ESTUDANTES'] || normalizedRow['INDICAÇÃO ESTUDANTE'] || normalizedRow['INDICACAO ESTUDANTE'] || normalizedRow['BOLSISTA'];
    
    const discente = sanitizeDiscente(discenteRaw);

    if (codigo && titulo && orientador) {
      allProjects.push({
        id: `${campus}-${codigo}-${index}`,
        codigo: String(codigo).trim(),
        campus: String(campus).trim(),
        titulo: String(titulo).trim(),
        orientador: String(orientador).trim(),
        fomento: String(fomento || 'Voluntário').trim().toUpperCase(),
        discente: discente,
        status: normalizedRow['STATUS'] ? String(normalizedRow['STATUS']).trim() : 'APROVADO'
      });
    }
  });
}

console.log(`Extracted ${allProjects.length} projects.`);
const outDir = path.join(__dirname, 'src');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}
fs.writeFileSync(path.join(outDir, 'initialData.json'), JSON.stringify(allProjects, null, 2), 'utf8');
console.log('Saved to src/initialData.json');
