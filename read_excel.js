const XLSX = require('xlsx');
const workbook = XLSX.readFile('Controle Bolsas por campus AC.xlsx');
console.log('Sheet names:', workbook.SheetNames);
for (const sheetName of workbook.SheetNames) {
  console.log(`\n--- Sheet: ${sheetName} ---`);
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`Total rows: ${rows.length}`);
  console.log('Headers / Row 1:', rows[0] ? rows[0].slice(0, 15) : 'Empty');
  console.log('Row 2:', rows[1] ? rows[1].slice(0, 15) : 'Empty');
  console.log('Row 3:', rows[2] ? rows[2].slice(0, 15) : 'Empty');
  console.log('Row 4:', rows[3] ? rows[3].slice(0, 15) : 'Empty');
  console.log('Row 5:', rows[4] ? rows[4].slice(0, 15) : 'Empty');
}
