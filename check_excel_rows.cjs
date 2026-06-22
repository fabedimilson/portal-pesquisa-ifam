const XLSX = require('xlsx');
const workbook = XLSX.readFile('Controle Bolsas por campus AC.xlsx');

console.log('--- EXCEL SHEETS INSPECTION ---');
workbook.SheetNames.forEach(sheetName => {
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  
  let validCodesCount = 0;
  let activeStudentsCount = 0;
  const codesList = [];

  rows.forEach((row, i) => {
    // Trim and normalize keys
    const norm = {};
    for (const key of Object.keys(row)) {
      norm[key.trim().toUpperCase()] = String(row[key]).trim();
    }

    const codigo = norm['CÓDIGO'] || norm['CODIGO'];
    const discente = norm['INDICAÇÃO ESTUDANTES'] || norm['INDICAÇÃO ESTUDANTE'] || norm['INDICACAO ESTUDANTE'] || norm['BOLSISTA'];

    if (codigo && codigo.length > 2 && codigo.includes('-2026')) {
      validCodesCount++;
      codesList.push(codigo);
      if (discente && discente !== 'NAO' && discente !== 'NÃO' && discente !== 'NÃO SE APLICA' && discente !== 'NÃO SE APLICA (Desclassificado)') {
        activeStudentsCount++;
      }
    }
  });

  console.log(`Sheet: ${sheetName}`);
  console.log(`  Rows with valid codes: ${validCodesCount}`);
  console.log(`  Active students: ${activeStudentsCount}`);
  console.log(`  Codes found: ${JSON.stringify(codesList.slice(0, 3))}...`);
});
